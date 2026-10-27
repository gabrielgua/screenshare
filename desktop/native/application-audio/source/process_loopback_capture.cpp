#include "process_loopback_capture.h"

#include <audioclient.h>
#include <audioclientactivationparams.h>
#include <mmdeviceapi.h>
#include <wrl/client.h>
#include <wrl/implements.h>

#include <cstdio>
#include <utility>

using Microsoft::WRL::ComPtr;

namespace {

constexpr REFERENCE_TIME CAPTURE_BUFFER_DURATION = 200000;
constexpr DWORD ACTIVATION_TIMEOUT_MILLISECONDS = 5000;

using ActivateAudioInterfaceAsyncFunction =
    HRESULT(WINAPI*)(LPCWSTR, REFIID, PROPVARIANT*, IActivateAudioInterfaceCompletionHandler*,
                     IActivateAudioInterfaceAsyncOperation**);

std::string DescribeFailure(const char* step, HRESULT result) {
  char description[160];
  std::snprintf(description, sizeof(description), "%s failed with 0x%08lX", step,
                static_cast<unsigned long>(result));
  return description;
}

class ActivationCompletionHandler
    : public Microsoft::WRL::RuntimeClass<
          Microsoft::WRL::RuntimeClassFlags<Microsoft::WRL::ClassicCom>, Microsoft::WRL::FtmBase,
          IActivateAudioInterfaceCompletionHandler> {
 public:
  ActivationCompletionHandler() { completedEvent = CreateEventW(nullptr, TRUE, FALSE, nullptr); }

  ~ActivationCompletionHandler() override { CloseHandle(completedEvent); }

  STDMETHOD(ActivateCompleted)(IActivateAudioInterfaceAsyncOperation* operation) override {
    HRESULT activationResult = E_FAIL;
    ComPtr<IUnknown> activatedInterface;
    HRESULT queryResult = operation->GetActivateResult(&activationResult, &activatedInterface);
    if (FAILED(queryResult)) {
      completionResult = queryResult;
    } else if (FAILED(activationResult)) {
      completionResult = activationResult;
    } else {
      completionResult = activatedInterface.As(&audioClient);
    }
    SetEvent(completedEvent);
    return S_OK;
  }

  HANDLE completedEvent;
  HRESULT completionResult = E_FAIL;
  ComPtr<IAudioClient> audioClient;
};

class ComApartment {
 public:
  ComApartment() { initializationResult = CoInitializeEx(nullptr, COINIT_MULTITHREADED); }
  ~ComApartment() {
    if (SUCCEEDED(initializationResult)) {
      CoUninitialize();
    }
  }
  HRESULT initializationResult;
};

class ScopedEvent {
 public:
  ScopedEvent() : handle(CreateEventW(nullptr, FALSE, FALSE, nullptr)) {}
  ~ScopedEvent() {
    if (handle) {
      CloseHandle(handle);
    }
  }
  HANDLE handle;
};

WAVEFORMATEX DescribeCapturedFormat() {
  WAVEFORMATEX format{};
  format.wFormatTag = WAVE_FORMAT_IEEE_FLOAT;
  format.nChannels = CAPTURED_CHANNEL_COUNT;
  format.nSamplesPerSec = CAPTURED_SAMPLE_RATE;
  format.wBitsPerSample = 32;
  format.nBlockAlign = format.nChannels * format.wBitsPerSample / 8;
  format.nAvgBytesPerSec = format.nSamplesPerSec * format.nBlockAlign;
  return format;
}

}

ProcessLoopbackCapture::ProcessLoopbackCapture(DWORD targetProcessId, LoopbackScope scope,
                                               LoopbackCaptureListeners listeners)
    : targetProcessId(targetProcessId),
      scope(scope),
      listeners(std::move(listeners)),
      stopRequestedEvent(CreateEventW(nullptr, TRUE, FALSE, nullptr)) {}

ProcessLoopbackCapture::~ProcessLoopbackCapture() {
  Stop();
  CloseHandle(stopRequestedEvent);
}

void ProcessLoopbackCapture::Start() {
  if (captureThread.joinable()) {
    return;
  }
  ResetEvent(stopRequestedEvent);
  captureThread = std::thread([this] { RunCaptureThread(); });
}

void ProcessLoopbackCapture::Stop() {
  SetEvent(stopRequestedEvent);
  if (captureThread.joinable()) {
    captureThread.join();
  }
}

void ProcessLoopbackCapture::RunCaptureThread() {
  std::string failureDescription = CaptureUntilStopped();
  if (!failureDescription.empty() && listeners.onCaptureFailed) {
    listeners.onCaptureFailed(failureDescription);
  }
}

std::string ProcessLoopbackCapture::CaptureUntilStopped() {
  ComApartment apartment;
  if (FAILED(apartment.initializationResult)) {
    return DescribeFailure("CoInitializeEx", apartment.initializationResult);
  }

  HMODULE audioDeviceLibrary = LoadLibraryW(L"mmdevapi.dll");
  if (!audioDeviceLibrary) {
    return "Windows audio devices are not available";
  }
  auto activateAudioInterfaceAsync = reinterpret_cast<ActivateAudioInterfaceAsyncFunction>(
      GetProcAddress(audioDeviceLibrary, "ActivateAudioInterfaceAsync"));
  if (!activateAudioInterfaceAsync) {
    FreeLibrary(audioDeviceLibrary);
    return "This version of Windows cannot capture the audio of one app";
  }

  AUDIOCLIENT_ACTIVATION_PARAMS activationParameters{};
  activationParameters.ActivationType = AUDIOCLIENT_ACTIVATION_TYPE_PROCESS_LOOPBACK;
  activationParameters.ProcessLoopbackParams.TargetProcessId = targetProcessId;
  activationParameters.ProcessLoopbackParams.ProcessLoopbackMode =
      scope == LoopbackScope::IncludeProcessTree ? PROCESS_LOOPBACK_MODE_INCLUDE_TARGET_PROCESS_TREE
                                                 : PROCESS_LOOPBACK_MODE_EXCLUDE_TARGET_PROCESS_TREE;

  PROPVARIANT activationVariant{};
  activationVariant.vt = VT_BLOB;
  activationVariant.blob.cbSize = sizeof(activationParameters);
  activationVariant.blob.pBlobData = reinterpret_cast<BYTE*>(&activationParameters);

  auto completionHandler = Microsoft::WRL::Make<ActivationCompletionHandler>();
  ComPtr<IActivateAudioInterfaceAsyncOperation> activationOperation;
  HRESULT result = activateAudioInterfaceAsync(VIRTUAL_AUDIO_DEVICE_PROCESS_LOOPBACK,
                                               __uuidof(IAudioClient), &activationVariant,
                                               completionHandler.Get(), &activationOperation);
  if (FAILED(result)) {
    FreeLibrary(audioDeviceLibrary);
    return DescribeFailure("ActivateAudioInterfaceAsync", result);
  }

  HANDLE activationWaitEvents[] = {stopRequestedEvent, completionHandler->completedEvent};
  DWORD activationWaitResult =
      WaitForMultipleObjects(2, activationWaitEvents, FALSE, ACTIVATION_TIMEOUT_MILLISECONDS);
  if (activationWaitResult == WAIT_OBJECT_0) {
    FreeLibrary(audioDeviceLibrary);
    return "";
  }
  if (activationWaitResult != WAIT_OBJECT_0 + 1) {
    FreeLibrary(audioDeviceLibrary);
    return "Windows took too long to start capturing the app's audio";
  }
  if (FAILED(completionHandler->completionResult)) {
    FreeLibrary(audioDeviceLibrary);
    return DescribeFailure("Audio capture activation", completionHandler->completionResult);
  }

  ComPtr<IAudioClient> audioClient = completionHandler->audioClient;
  WAVEFORMATEX capturedFormat = DescribeCapturedFormat();
  result = audioClient->Initialize(AUDCLNT_SHAREMODE_SHARED,
                                   AUDCLNT_STREAMFLAGS_LOOPBACK |
                                       AUDCLNT_STREAMFLAGS_EVENTCALLBACK |
                                       AUDCLNT_STREAMFLAGS_AUTOCONVERTPCM,
                                   CAPTURE_BUFFER_DURATION, 0, &capturedFormat, nullptr);
  if (FAILED(result)) {
    FreeLibrary(audioDeviceLibrary);
    return DescribeFailure("IAudioClient::Initialize", result);
  }

  ScopedEvent samplesReadyEvent;
  result = audioClient->SetEventHandle(samplesReadyEvent.handle);
  if (FAILED(result)) {
    FreeLibrary(audioDeviceLibrary);
    return DescribeFailure("IAudioClient::SetEventHandle", result);
  }

  ComPtr<IAudioCaptureClient> captureClient;
  result = audioClient->GetService(IID_PPV_ARGS(&captureClient));
  if (FAILED(result)) {
    FreeLibrary(audioDeviceLibrary);
    return DescribeFailure("IAudioClient::GetService", result);
  }

  result = audioClient->Start();
  if (FAILED(result)) {
    FreeLibrary(audioDeviceLibrary);
    return DescribeFailure("IAudioClient::Start", result);
  }

  std::string failureDescription;
  HANDLE captureWaitEvents[] = {stopRequestedEvent, samplesReadyEvent.handle};
  bool isCapturing = true;
  while (isCapturing) {
    DWORD waitResult = WaitForMultipleObjects(2, captureWaitEvents, FALSE, INFINITE);
    if (waitResult != WAIT_OBJECT_0 + 1) {
      isCapturing = false;
      continue;
    }
    std::vector<float> capturedSamples;
    UINT32 nextPacketFrameCount = 0;
    while (SUCCEEDED(result = captureClient->GetNextPacketSize(&nextPacketFrameCount)) &&
           nextPacketFrameCount > 0) {
      BYTE* packetData = nullptr;
      UINT32 packetFrameCount = 0;
      DWORD packetFlags = 0;
      result = captureClient->GetBuffer(&packetData, &packetFrameCount, &packetFlags, nullptr,
                                        nullptr);
      if (FAILED(result)) {
        break;
      }
      size_t packetSampleCount = static_cast<size_t>(packetFrameCount) * CAPTURED_CHANNEL_COUNT;
      size_t previousSampleCount = capturedSamples.size();
      capturedSamples.resize(previousSampleCount + packetSampleCount, 0.0f);
      if (!(packetFlags & AUDCLNT_BUFFERFLAGS_SILENT)) {
        const float* packetSamples = reinterpret_cast<const float*>(packetData);
        std::copy(packetSamples, packetSamples + packetSampleCount,
                  capturedSamples.begin() + previousSampleCount);
      }
      captureClient->ReleaseBuffer(packetFrameCount);
    }
    if (FAILED(result)) {
      failureDescription = DescribeFailure("Reading captured audio", result);
      isCapturing = false;
    }
    if (!capturedSamples.empty() && listeners.onSamplesCaptured) {
      listeners.onSamplesCaptured(std::move(capturedSamples));
    }
  }

  audioClient->Stop();
  captureClient.Reset();
  audioClient.Reset();
  completionHandler.Reset();
  activationOperation.Reset();
  FreeLibrary(audioDeviceLibrary);
  return failureDescription;
}

DWORD FindWindowProcessId(HWND windowHandle) {
  DWORD processId = 0;
  if (IsWindow(windowHandle)) {
    GetWindowThreadProcessId(windowHandle, &processId);
  }
  return processId;
}
