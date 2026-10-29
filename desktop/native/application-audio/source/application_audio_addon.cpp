#include <napi.h>

#include <memory>
#include <string>
#include <vector>

#include "audio_process_filter.h"
#include "com_apartment.h"
#include "filtered_audio_capture.h"
#include "process_loopback_capture.h"

namespace {

std::wstring ToWideText(const std::string& utf8Text) {
  int wideLength = MultiByteToWideChar(CP_UTF8, 0, utf8Text.data(),
                                       static_cast<int>(utf8Text.size()), nullptr, 0);
  std::wstring wideText(static_cast<size_t>(wideLength), L' ');
  MultiByteToWideChar(CP_UTF8, 0, utf8Text.data(), static_cast<int>(utf8Text.size()),
                      wideText.data(), wideLength);
  return wideText;
}

std::string ToUtf8Text(const std::wstring& wideText) {
  int utf8Length = WideCharToMultiByte(CP_UTF8, 0, wideText.data(),
                                       static_cast<int>(wideText.size()), nullptr, 0, nullptr,
                                       nullptr);
  std::string utf8Text(static_cast<size_t>(utf8Length), ' ');
  WideCharToMultiByte(CP_UTF8, 0, wideText.data(), static_cast<int>(wideText.size()),
                      utf8Text.data(), utf8Length, nullptr, nullptr);
  return utf8Text;
}

AudioProcessFilter ReadAudioProcessFilter(Napi::Env environment, const Napi::Object& options) {
  Napi::Value scopeProcessIdValue = options.Get("scopeProcessId");
  Napi::Value excludedProcessIdValue = options.Get("excludedProcessId");
  Napi::Value excludedExecutableNamesValue = options.Get("excludedExecutableNames");
  if (!scopeProcessIdValue.IsNumber() || !excludedProcessIdValue.IsNumber() ||
      !excludedExecutableNamesValue.IsArray()) {
    throw Napi::TypeError::New(
        environment, "scopeProcessId, excludedProcessId and excludedExecutableNames are required");
  }
  AudioProcessFilter filter;
  filter.scopeProcessId = scopeProcessIdValue.As<Napi::Number>().Uint32Value();
  filter.excludedProcessId = excludedProcessIdValue.As<Napi::Number>().Uint32Value();
  Napi::Array excludedExecutableNames = excludedExecutableNamesValue.As<Napi::Array>();
  for (uint32_t nameIndex = 0; nameIndex < excludedExecutableNames.Length(); ++nameIndex) {
    Napi::Value executableName = excludedExecutableNames.Get(nameIndex);
    if (executableName.IsString()) {
      filter.excludedExecutableNames.push_back(
          ToWideText(executableName.As<Napi::String>().Utf8Value()));
    }
  }
  return filter;
}

class ApplicationAudioCapture : public Napi::ObjectWrap<ApplicationAudioCapture> {
 public:
  static Napi::Function DefineClass(Napi::Env environment) {
    return ObjectWrap<ApplicationAudioCapture>::DefineClass(
        environment, "ApplicationAudioCapture",
        {
            InstanceMethod<&ApplicationAudioCapture::Start>("start"),
            InstanceMethod<&ApplicationAudioCapture::Stop>("stop"),
        });
  }

  explicit ApplicationAudioCapture(const Napi::CallbackInfo& callInformation)
      : Napi::ObjectWrap<ApplicationAudioCapture>(callInformation) {
    Napi::Env environment = callInformation.Env();
    if (callInformation.Length() < 1 || !callInformation[0].IsObject()) {
      throw Napi::TypeError::New(environment, "Capture options are required");
    }
    Napi::Object options = callInformation[0].As<Napi::Object>();
    AudioProcessFilter filter = ReadAudioProcessFilter(environment, options);
    Napi::Value samplesListenerValue = options.Get("onSamplesCaptured");
    Napi::Value failureListenerValue = options.Get("onCaptureFailed");
    if (!samplesListenerValue.IsFunction() || !failureListenerValue.IsFunction()) {
      throw Napi::TypeError::New(environment, "onSamplesCaptured and onCaptureFailed are required");
    }

    samplesListener = Napi::ThreadSafeFunction::New(
        environment, samplesListenerValue.As<Napi::Function>(), "ApplicationAudioSamples", 0, 1);
    failureListener = Napi::ThreadSafeFunction::New(
        environment, failureListenerValue.As<Napi::Function>(), "ApplicationAudioFailure", 0, 1);

    LoopbackCaptureListeners listeners;
    listeners.onSamplesCaptured = [this](std::vector<float>&& capturedSamples) {
      auto* deliveredSamples = new std::vector<float>(std::move(capturedSamples));
      napi_status status = samplesListener.NonBlockingCall(
          deliveredSamples,
          [](Napi::Env callbackEnvironment, Napi::Function listener, std::vector<float>* samples) {
            Napi::Float32Array samplesArray =
                Napi::Float32Array::New(callbackEnvironment, samples->size());
            std::copy(samples->begin(), samples->end(), samplesArray.Data());
            delete samples;
            listener.Call({samplesArray});
          });
      if (status != napi_ok) {
        delete deliveredSamples;
      }
    };
    listeners.onCaptureFailed = [this](const std::string& failureDescription) {
      auto* deliveredDescription = new std::string(failureDescription);
      napi_status status = failureListener.NonBlockingCall(
          deliveredDescription,
          [](Napi::Env callbackEnvironment, Napi::Function listener, std::string* description) {
            Napi::String descriptionValue = Napi::String::New(callbackEnvironment, *description);
            delete description;
            listener.Call({descriptionValue});
          });
      if (status != napi_ok) {
        delete deliveredDescription;
      }
    };

    capture = std::make_unique<FilteredAudioCapture>(std::move(filter), std::move(listeners));
  }

  ~ApplicationAudioCapture() override { ReleaseCapture(); }

 private:
  Napi::Value Start(const Napi::CallbackInfo& callInformation) {
    if (capture) {
      capture->Start();
    }
    return callInformation.Env().Undefined();
  }

  Napi::Value Stop(const Napi::CallbackInfo& callInformation) {
    ReleaseCapture();
    return callInformation.Env().Undefined();
  }

  void ReleaseCapture() {
    if (!capture) {
      return;
    }
    capture->Stop();
    capture.reset();
    samplesListener.Release();
    failureListener.Release();
  }

  std::unique_ptr<FilteredAudioCapture> capture;
  Napi::ThreadSafeFunction samplesListener;
  Napi::ThreadSafeFunction failureListener;
};

Napi::Value FindWindowProcessIdBinding(const Napi::CallbackInfo& callInformation) {
  Napi::Env environment = callInformation.Env();
  if (callInformation.Length() < 1 || !callInformation[0].IsNumber()) {
    throw Napi::TypeError::New(environment, "A window handle number is required");
  }
  auto windowHandleNumber = static_cast<uintptr_t>(callInformation[0].As<Napi::Number>().Int64Value());
  DWORD processId = FindWindowProcessId(reinterpret_cast<HWND>(windowHandleNumber));
  return Napi::Number::New(environment, processId);
}

Napi::Value ListCapturedApplicationsBinding(const Napi::CallbackInfo& callInformation) {
  Napi::Env environment = callInformation.Env();
  if (callInformation.Length() < 1 || !callInformation[0].IsObject()) {
    throw Napi::TypeError::New(environment, "Capture options are required");
  }
  AudioProcessFilter filter =
      ReadAudioProcessFilter(environment, callInformation[0].As<Napi::Object>());
  ComApartment apartment;
  ProcessFamilyTree familyTree = ProcessFamilyTree::Snapshot();
  std::vector<DWORD> capturedProcessIds =
      ChooseCapturedProcessIds(filter, familyTree, ListAudioSessionProcessIds());
  Napi::Array capturedApplications = Napi::Array::New(environment, capturedProcessIds.size());
  for (uint32_t applicationIndex = 0; applicationIndex < capturedProcessIds.size();
       ++applicationIndex) {
    DWORD processId = capturedProcessIds[applicationIndex];
    Napi::Object capturedApplication = Napi::Object::New(environment);
    capturedApplication.Set("processId", Napi::Number::New(environment, processId));
    capturedApplication.Set("executableName",
                            ToUtf8Text(familyTree.ReadExecutableName(processId)));
    capturedApplications.Set(applicationIndex, capturedApplication);
  }
  return capturedApplications;
}

Napi::Object InitializeAddon(Napi::Env environment, Napi::Object exports) {
  exports.Set("ApplicationAudioCapture", ApplicationAudioCapture::DefineClass(environment));
  exports.Set("findWindowProcessId", Napi::Function::New(environment, FindWindowProcessIdBinding));
  exports.Set("listCapturedApplications",
              Napi::Function::New(environment, ListCapturedApplicationsBinding));
  exports.Set("capturedSampleRate", Napi::Number::New(environment, CAPTURED_SAMPLE_RATE));
  exports.Set("capturedChannelCount", Napi::Number::New(environment, CAPTURED_CHANNEL_COUNT));
  return exports;
}

}

NODE_API_MODULE(application_audio, InitializeAddon)
