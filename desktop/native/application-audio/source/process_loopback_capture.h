#pragma once

#include <windows.h>

#include <functional>
#include <string>
#include <thread>
#include <vector>

enum class LoopbackScope { IncludeProcessTree, ExcludeProcessTree };

constexpr DWORD CAPTURED_SAMPLE_RATE = 48000;
constexpr WORD CAPTURED_CHANNEL_COUNT = 2;

struct LoopbackCaptureListeners {
  std::function<void(std::vector<float>&&)> onSamplesCaptured;
  std::function<void(const std::string&)> onCaptureFailed;
};

class ProcessLoopbackCapture {
 public:
  ProcessLoopbackCapture(DWORD targetProcessId, LoopbackScope scope,
                         LoopbackCaptureListeners listeners);
  ~ProcessLoopbackCapture();

  ProcessLoopbackCapture(const ProcessLoopbackCapture&) = delete;
  ProcessLoopbackCapture& operator=(const ProcessLoopbackCapture&) = delete;

  void Start();
  void Stop();

 private:
  void RunCaptureThread();
  std::string CaptureUntilStopped();

  DWORD targetProcessId;
  LoopbackScope scope;
  LoopbackCaptureListeners listeners;
  HANDLE stopRequestedEvent;
  std::thread captureThread;
};

DWORD FindWindowProcessId(HWND windowHandle);
