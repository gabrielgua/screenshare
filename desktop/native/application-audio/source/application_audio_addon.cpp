#include <napi.h>

#include <memory>
#include <string>
#include <vector>

#include "process_loopback_capture.h"

namespace {

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
    Napi::Value processIdValue = options.Get("processId");
    Napi::Value scopeValue = options.Get("scope");
    Napi::Value samplesListenerValue = options.Get("onSamplesCaptured");
    Napi::Value failureListenerValue = options.Get("onCaptureFailed");
    if (!processIdValue.IsNumber() || !scopeValue.IsString() ||
        !samplesListenerValue.IsFunction() || !failureListenerValue.IsFunction()) {
      throw Napi::TypeError::New(
          environment, "processId, scope, onSamplesCaptured and onCaptureFailed are required");
    }

    DWORD targetProcessId = processIdValue.As<Napi::Number>().Uint32Value();
    std::string scopeName = scopeValue.As<Napi::String>().Utf8Value();
    LoopbackScope scope = scopeName == "exclude-process-tree" ? LoopbackScope::ExcludeProcessTree
                                                              : LoopbackScope::IncludeProcessTree;

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

    capture = std::make_unique<ProcessLoopbackCapture>(targetProcessId, scope,
                                                       std::move(listeners));
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

  std::unique_ptr<ProcessLoopbackCapture> capture;
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

Napi::Object InitializeAddon(Napi::Env environment, Napi::Object exports) {
  exports.Set("ApplicationAudioCapture", ApplicationAudioCapture::DefineClass(environment));
  exports.Set("findWindowProcessId", Napi::Function::New(environment, FindWindowProcessIdBinding));
  exports.Set("capturedSampleRate", Napi::Number::New(environment, CAPTURED_SAMPLE_RATE));
  exports.Set("capturedChannelCount", Napi::Number::New(environment, CAPTURED_CHANNEL_COUNT));
  return exports;
}

}

NODE_API_MODULE(application_audio, InitializeAddon)
