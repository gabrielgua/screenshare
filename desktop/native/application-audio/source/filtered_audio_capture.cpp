#include "filtered_audio_capture.h"

#include <algorithm>
#include <chrono>
#include <cstdint>
#include <string>
#include <utility>

#include "com_apartment.h"

namespace {

constexpr DWORD MIXING_INTERVAL_MILLISECONDS = 10;
constexpr auto PROCESS_REFRESH_INTERVAL = std::chrono::seconds(1);
constexpr size_t PRIMING_SAMPLE_COUNT = CAPTURED_SAMPLE_RATE / 50 * CAPTURED_CHANNEL_COUNT;
constexpr size_t MAXIMUM_PENDING_SAMPLE_COUNT = CAPTURED_SAMPLE_RATE / 5 * CAPTURED_CHANNEL_COUNT;
constexpr uint64_t MAXIMUM_MIXED_FRAME_COUNT = CAPTURED_SAMPLE_RATE / 10;

void KeepNewestSamples(std::deque<float>& samples) {
  if (samples.size() > MAXIMUM_PENDING_SAMPLE_COUNT) {
    samples.erase(samples.begin(),
                  samples.begin() + (samples.size() - MAXIMUM_PENDING_SAMPLE_COUNT));
  }
}

void AddPendingSamples(PendingProcessSamples& pendingSamples, std::vector<float>& mixedSamples) {
  std::lock_guard<std::mutex> samplesLock(pendingSamples.lock);
  if (!pendingSamples.isPrimed) {
    if (pendingSamples.samples.size() < PRIMING_SAMPLE_COUNT) {
      return;
    }
    pendingSamples.isPrimed = true;
  }
  size_t takenSampleCount = std::min(pendingSamples.samples.size(), mixedSamples.size());
  for (size_t sampleIndex = 0; sampleIndex < takenSampleCount; ++sampleIndex) {
    mixedSamples[sampleIndex] += pendingSamples.samples[sampleIndex];
  }
  pendingSamples.samples.erase(pendingSamples.samples.begin(),
                               pendingSamples.samples.begin() + takenSampleCount);
  if (takenSampleCount < mixedSamples.size()) {
    pendingSamples.isPrimed = false;
  }
}

}

FilteredAudioCapture::FilteredAudioCapture(AudioProcessFilter filter,
                                           LoopbackCaptureListeners listeners)
    : filter(std::move(filter)),
      listeners(std::move(listeners)),
      stopRequestedEvent(CreateEventW(nullptr, TRUE, FALSE, nullptr)) {}

FilteredAudioCapture::~FilteredAudioCapture() {
  Stop();
  CloseHandle(stopRequestedEvent);
}

void FilteredAudioCapture::Start() {
  if (mixingThread.joinable()) {
    return;
  }
  ResetEvent(stopRequestedEvent);
  mixingThread = std::thread([this] { RunMixingThread(); });
}

void FilteredAudioCapture::Stop() {
  SetEvent(stopRequestedEvent);
  if (mixingThread.joinable()) {
    mixingThread.join();
  }
}

void FilteredAudioCapture::StartCapturingProcess(DWORD processId) {
  auto pendingSamples = std::make_shared<PendingProcessSamples>();
  LoopbackCaptureListeners processListeners;
  processListeners.onSamplesCaptured = [pendingSamples](std::vector<float>&& capturedSamples) {
    std::lock_guard<std::mutex> samplesLock(pendingSamples->lock);
    pendingSamples->samples.insert(pendingSamples->samples.end(), capturedSamples.begin(),
                                   capturedSamples.end());
    KeepNewestSamples(pendingSamples->samples);
  };
  processListeners.onCaptureFailed = [pendingSamples](const std::string&) {
    pendingSamples->hasFailed = true;
  };
  auto capture = std::make_unique<ProcessLoopbackCapture>(processId, std::move(processListeners));
  capture->Start();
  capturedProcessesById[processId] = {std::move(capture), std::move(pendingSamples)};
}

void FilteredAudioCapture::RefreshCapturedProcesses() {
  std::vector<DWORD> audioSessionProcessIds = ListAudioSessionProcessIds();
  std::vector<DWORD> chosenProcessIds = ChooseCapturedProcessIds(
      filter, ProcessFamilyTree::Snapshot(), audioSessionProcessIds);
  std::unordered_set<DWORD> chosenProcessIdSet(chosenProcessIds.begin(), chosenProcessIds.end());

  std::erase_if(failedProcessIds,
                [&](DWORD processId) { return !chosenProcessIdSet.contains(processId); });
  for (auto capturedProcess = capturedProcessesById.begin();
       capturedProcess != capturedProcessesById.end();) {
    bool hasFailed = capturedProcess->second.pendingSamples->hasFailed;
    if (hasFailed) {
      failedProcessIds.insert(capturedProcess->first);
    }
    if (hasFailed || !chosenProcessIdSet.contains(capturedProcess->first)) {
      capturedProcess->second.capture->Stop();
      capturedProcess = capturedProcessesById.erase(capturedProcess);
    } else {
      ++capturedProcess;
    }
  }
  for (DWORD processId : chosenProcessIds) {
    if (!capturedProcessesById.contains(processId) && !failedProcessIds.contains(processId)) {
      StartCapturingProcess(processId);
    }
  }
}

void FilteredAudioCapture::RunMixingThread() {
  ComApartment apartment;
  if (FAILED(apartment.initializationResult)) {
    if (listeners.onCaptureFailed) {
      listeners.onCaptureFailed("Could not prepare the audio capture");
    }
    return;
  }

  using Clock = std::chrono::steady_clock;
  const Clock::time_point mixingStartedAt = Clock::now();
  Clock::time_point nextRefreshAt = mixingStartedAt;
  uint64_t mixedFrameCount = 0;

  while (WaitForSingleObject(stopRequestedEvent, MIXING_INTERVAL_MILLISECONDS) == WAIT_TIMEOUT) {
    Clock::time_point now = Clock::now();
    if (now >= nextRefreshAt) {
      RefreshCapturedProcesses();
      nextRefreshAt = now + PROCESS_REFRESH_INTERVAL;
    }
    auto elapsedMicroseconds =
        std::chrono::duration_cast<std::chrono::microseconds>(now - mixingStartedAt).count();
    uint64_t elapsedFrameCount =
        static_cast<uint64_t>(elapsedMicroseconds) * CAPTURED_SAMPLE_RATE / 1000000;
    if (elapsedFrameCount <= mixedFrameCount) {
      continue;
    }
    uint64_t dueFrameCount = elapsedFrameCount - mixedFrameCount;
    mixedFrameCount = elapsedFrameCount;
    dueFrameCount = std::min(dueFrameCount, MAXIMUM_MIXED_FRAME_COUNT);

    std::vector<float> mixedSamples(static_cast<size_t>(dueFrameCount) * CAPTURED_CHANNEL_COUNT,
                                    0.0f);
    for (auto& [processId, capturedProcess] : capturedProcessesById) {
      AddPendingSamples(*capturedProcess.pendingSamples, mixedSamples);
    }
    if (listeners.onSamplesCaptured) {
      listeners.onSamplesCaptured(std::move(mixedSamples));
    }
  }

  for (auto& [processId, capturedProcess] : capturedProcessesById) {
    capturedProcess.capture->Stop();
  }
  capturedProcessesById.clear();
}
