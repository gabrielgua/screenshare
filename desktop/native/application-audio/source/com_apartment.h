#pragma once

#include <objbase.h>

class ComApartment {
 public:
  ComApartment() { initializationResult = CoInitializeEx(nullptr, COINIT_MULTITHREADED); }
  ~ComApartment() {
    if (SUCCEEDED(initializationResult)) {
      CoUninitialize();
    }
  }

  ComApartment(const ComApartment&) = delete;
  ComApartment& operator=(const ComApartment&) = delete;

  HRESULT initializationResult;
};
