#pragma once

#include <windows.h>

#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

struct AudioProcessFilter {
  DWORD scopeProcessId = 0;
  DWORD excludedProcessId = 0;
  std::vector<std::wstring> excludedExecutableNames;
};

struct RunningProcess {
  DWORD parentProcessId = 0;
  std::wstring executableName;
};

class ProcessFamilyTree {
 public:
  static ProcessFamilyTree Snapshot();

  bool Contains(DWORD processId) const;
  const std::wstring& ReadExecutableName(DWORD processId) const;
  std::vector<DWORD> ListAncestors(DWORD processId) const;
  std::vector<DWORD> ListProcessIds() const;

 private:
  std::unordered_map<DWORD, RunningProcess> runningProcessesById;
};

std::vector<DWORD> ListAudioSessionProcessIds();

std::vector<DWORD> ChooseCapturedProcessIds(const AudioProcessFilter& filter,
                                            const ProcessFamilyTree& familyTree,
                                            const std::vector<DWORD>& audioSessionProcessIds);
