#pragma once

#include <windows.h>

#include <atomic>
#include <deque>
#include <memory>
#include <mutex>
#include <thread>
#include <unordered_map>
#include <unordered_set>
#include <vector>

#include "audio_process_filter.h"
#include "process_loopback_capture.h"

struct PendingProcessSamples {
  std::mutex lock;
  std::deque<float> samples;
  bool isPrimed = false;
  std::atomic<bool> hasFailed = false;
};

class FilteredAudioCapture {
 public:
  FilteredAudioCapture(AudioProcessFilter filter, LoopbackCaptureListeners listeners);
  ~FilteredAudioCapture();

  FilteredAudioCapture(const FilteredAudioCapture&) = delete;
  FilteredAudioCapture& operator=(const FilteredAudioCapture&) = delete;

  void Start();
  void Stop();

 private:
  struct CapturedProcess {
    std::unique_ptr<ProcessLoopbackCapture> capture;
    std::shared_ptr<PendingProcessSamples> pendingSamples;
  };

  void RunMixingThread();
  void RefreshCapturedProcesses();
  void StartCapturingProcess(DWORD processId);

  AudioProcessFilter filter;
  LoopbackCaptureListeners listeners;
  HANDLE stopRequestedEvent;
  std::thread mixingThread;
  std::unordered_map<DWORD, CapturedProcess> capturedProcessesById;
  std::unordered_set<DWORD> failedProcessIds;
};
