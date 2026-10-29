#include "audio_process_filter.h"

#include <audiopolicy.h>
#include <mmdeviceapi.h>
#include <tlhelp32.h>
#include <wrl/client.h>

#include <algorithm>
#include <cwctype>

using Microsoft::WRL::ComPtr;

namespace {

constexpr int MAXIMUM_ANCESTOR_DEPTH = 64;

std::wstring ToLowerCase(std::wstring text) {
  std::transform(text.begin(), text.end(), text.begin(),
                 [](wchar_t character) { return static_cast<wchar_t>(std::towlower(character)); });
  return text;
}

void AddSessionProcessIds(IMMDevice* device, std::unordered_set<DWORD>& processIds) {
  ComPtr<IAudioSessionManager2> sessionManager;
  if (FAILED(device->Activate(__uuidof(IAudioSessionManager2), CLSCTX_ALL, nullptr,
                              reinterpret_cast<void**>(sessionManager.GetAddressOf())))) {
    return;
  }
  ComPtr<IAudioSessionEnumerator> sessions;
  if (FAILED(sessionManager->GetSessionEnumerator(&sessions))) {
    return;
  }
  int sessionCount = 0;
  if (FAILED(sessions->GetCount(&sessionCount))) {
    return;
  }
  for (int sessionIndex = 0; sessionIndex < sessionCount; ++sessionIndex) {
    ComPtr<IAudioSessionControl> sessionControl;
    ComPtr<IAudioSessionControl2> detailedSessionControl;
    if (FAILED(sessions->GetSession(sessionIndex, &sessionControl)) ||
        FAILED(sessionControl.As(&detailedSessionControl))) {
      continue;
    }
    DWORD processId = 0;
    if (detailedSessionControl->GetProcessId(&processId) != S_OK || processId == 0) {
      continue;
    }
    if (detailedSessionControl->IsSystemSoundsSession() == S_OK) {
      continue;
    }
    processIds.insert(processId);
  }
}

}

ProcessFamilyTree ProcessFamilyTree::Snapshot() {
  ProcessFamilyTree familyTree;
  HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
  if (snapshot == INVALID_HANDLE_VALUE) {
    return familyTree;
  }
  PROCESSENTRY32W processEntry{};
  processEntry.dwSize = sizeof(processEntry);
  for (BOOL hasEntry = Process32FirstW(snapshot, &processEntry); hasEntry;
       hasEntry = Process32NextW(snapshot, &processEntry)) {
    familyTree.runningProcessesById[processEntry.th32ProcessID] = {
        processEntry.th32ParentProcessID, ToLowerCase(processEntry.szExeFile)};
  }
  CloseHandle(snapshot);
  return familyTree;
}

bool ProcessFamilyTree::Contains(DWORD processId) const {
  return runningProcessesById.contains(processId);
}

const std::wstring& ProcessFamilyTree::ReadExecutableName(DWORD processId) const {
  static const std::wstring unknownExecutableName;
  auto runningProcess = runningProcessesById.find(processId);
  return runningProcess == runningProcessesById.end() ? unknownExecutableName
                                                      : runningProcess->second.executableName;
}

std::vector<DWORD> ProcessFamilyTree::ListAncestors(DWORD processId) const {
  std::vector<DWORD> ancestors;
  std::unordered_set<DWORD> visitedProcessIds{processId};
  DWORD currentProcessId = processId;
  for (int depth = 0; depth < MAXIMUM_ANCESTOR_DEPTH; ++depth) {
    auto runningProcess = runningProcessesById.find(currentProcessId);
    if (runningProcess == runningProcessesById.end()) {
      break;
    }
    DWORD parentProcessId = runningProcess->second.parentProcessId;
    if (parentProcessId == 0 || !runningProcessesById.contains(parentProcessId) ||
        !visitedProcessIds.insert(parentProcessId).second) {
      break;
    }
    ancestors.push_back(parentProcessId);
    currentProcessId = parentProcessId;
  }
  return ancestors;
}

std::vector<DWORD> ProcessFamilyTree::ListProcessIds() const {
  std::vector<DWORD> processIds;
  processIds.reserve(runningProcessesById.size());
  for (const auto& [processId, runningProcess] : runningProcessesById) {
    processIds.push_back(processId);
  }
  return processIds;
}

std::vector<DWORD> ListAudioSessionProcessIds() {
  std::unordered_set<DWORD> processIds;
  ComPtr<IMMDeviceEnumerator> deviceEnumerator;
  if (FAILED(CoCreateInstance(__uuidof(MMDeviceEnumerator), nullptr, CLSCTX_ALL,
                              IID_PPV_ARGS(&deviceEnumerator)))) {
    return {};
  }
  ComPtr<IMMDeviceCollection> renderDevices;
  if (FAILED(deviceEnumerator->EnumAudioEndpoints(eRender, DEVICE_STATE_ACTIVE, &renderDevices))) {
    return {};
  }
  UINT deviceCount = 0;
  renderDevices->GetCount(&deviceCount);
  for (UINT deviceIndex = 0; deviceIndex < deviceCount; ++deviceIndex) {
    ComPtr<IMMDevice> renderDevice;
    if (SUCCEEDED(renderDevices->Item(deviceIndex, &renderDevice))) {
      AddSessionProcessIds(renderDevice.Get(), processIds);
    }
  }
  return {processIds.begin(), processIds.end()};
}

std::vector<DWORD> ChooseCapturedProcessIds(const AudioProcessFilter& filter,
                                            const ProcessFamilyTree& familyTree,
                                            const std::vector<DWORD>& audioSessionProcessIds) {
  std::unordered_set<std::wstring> excludedExecutableNames;
  for (const std::wstring& executableName : filter.excludedExecutableNames) {
    excludedExecutableNames.insert(ToLowerCase(executableName));
  }
  auto isExcludedItself = [&](DWORD processId) {
    return processId == filter.excludedProcessId ||
           excludedExecutableNames.contains(familyTree.ReadExecutableName(processId));
  };

  std::unordered_set<DWORD> ancestorsOfExcludedProcesses;
  for (DWORD processId : familyTree.ListProcessIds()) {
    if (isExcludedItself(processId)) {
      for (DWORD ancestorProcessId : familyTree.ListAncestors(processId)) {
        ancestorsOfExcludedProcesses.insert(ancestorProcessId);
      }
    }
  }

  std::unordered_set<DWORD> candidateProcessIds;
  for (DWORD processId : audioSessionProcessIds) {
    if (!familyTree.Contains(processId) || isExcludedItself(processId) ||
        ancestorsOfExcludedProcesses.contains(processId)) {
      continue;
    }
    std::vector<DWORD> ancestors = familyTree.ListAncestors(processId);
    bool hasExcludedAncestor = std::any_of(ancestors.begin(), ancestors.end(), isExcludedItself);
    bool isInScope = filter.scopeProcessId == 0 || processId == filter.scopeProcessId ||
                     std::find(ancestors.begin(), ancestors.end(), filter.scopeProcessId) !=
                         ancestors.end();
    if (isInScope && !hasExcludedAncestor) {
      candidateProcessIds.insert(processId);
    }
  }

  std::vector<DWORD> capturedProcessIds;
  for (DWORD processId : candidateProcessIds) {
    std::vector<DWORD> ancestors = familyTree.ListAncestors(processId);
    bool isCoveredByAncestor =
        std::any_of(ancestors.begin(), ancestors.end(), [&](DWORD ancestorProcessId) {
          return candidateProcessIds.contains(ancestorProcessId);
        });
    if (!isCoveredByAncestor) {
      capturedProcessIds.push_back(processId);
    }
  }
  return capturedProcessIds;
}
