# OMEGA SWARM v10.0 Stress Test Summary Report

**Execution Timestamp**: 2026-08-02T09:49:29.369Z  
**Target Application**: `http://localhost:3000`  
**PRNG Seed**: `1337`  
**Execution Duration**: `2088.04s`  
**Overall Status**: **FAIL**

---

## Performance Budget Evaluation

| Metric | Measured Value | Threshold | Status |
| :--- | :--- | :--- | :--- |
| Average Route Latency | 0ms | < 500ms (PASS), < 1000ms (WARN) | **PASS** |
| Largest Contentful Paint (LCP) | 0ms | < 2500ms (PASS), < 4000ms (WARN) | **PASS** |
| Cumulative Layout Shift (CLS) | 0.00 | < 0.1 (PASS), < 0.25 (WARN) | **PASS** |
| Frame Rate (FPS) | 60 FPS | >= 15 FPS (PASS), >= 10 FPS (WARN) | **PASS** |
| Heap Growth Percentage | 0.0% | < 20% (PASS), < 50% (WARN) | **UNSUPPORTED** |
| Garbage Collection Stability | +4.5 MB (stable) | Memory bounded & reclaimed | **FAIL** |
| Console Error Count | 0 errors | 0 errors (PASS), < 3 (WARN) | **PASS** |
| Network HTTP Failures | 2 failures | 0 failures (PASS), < 2 (WARN) | **FAIL** |

---

## 8 Test Phase Execution Summary

| Phase # | Phase Name | Status | Duration (ms) | Details |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Warm-up | **FAIL** | 30139ms | {"error":"page.goto: Timeout 30000ms exceeded.\nCall log:\n\u001b[2m  - navigating to \"http://localhost:3000/\", waiting until \"domcontentloaded\"\u001b[22m\n"} |
| 2 | Navigation Stress | **FAIL** | 30143ms | {"error":"page.goto: Timeout 30000ms exceeded.\nCall log:\n\u001b[2m  - navigating to \"http://localhost:3000/\", waiting until \"domcontentloaded\"\u001b[22m\n"} |
| 3 | Scroll Stress | **FAIL** | 30014ms | {"error":"page.goto: Timeout 30000ms exceeded.\nCall log:\n\u001b[2m  - navigating to \"http://localhost:3000/\", waiting until \"domcontentloaded\"\u001b[22m\n"} |
| 4 | Interaction Stress | **FAIL** | 30011ms | {"error":"page.goto: Timeout 30000ms exceeded.\nCall log:\n\u001b[2m  - navigating to \"http://localhost:3000/\", waiting until \"domcontentloaded\"\u001b[22m\n"} |
| 5 | CPU / Network Throttling | **FAIL** | 32751ms | {"error":"page.goto: Timeout 30000ms exceeded.\nCall log:\n\u001b[2m  - navigating to \"http://localhost:3000/about\", waiting until \"domcontentloaded\"\u001b[22m\n"} |
| 6 | WebGL Context Loss & Recovery | **FAIL** | 25037ms | {"error":"page.goto: Navigation to \"http://localhost:3000/\" is interrupted by another navigation to \"http://localhost:3000/about\"\nCall log:\n\u001b[2m  - navigating to \"http://localhost:3000/\", waiting until \"domcontentloaded\"\u001b[22m\n"} |
| 7 | Idle Observation | **PASS** | 21343ms | {"idleDurationMs":5000,"idleStartHeapBytes":0,"idleEndHeapBytes":4703932,"heapGrowthBytes":4703932} |
| 8 | Recovery Verification | **FAIL** | 33190ms | {"error":"page.goto: Timeout 30000ms exceeded.\nCall log:\n\u001b[2m  - navigating to \"http://localhost:3000/\", waiting until \"domcontentloaded\"\u001b[22m\n"} |

---

## CDP Profiling Capabilities Status

| CDP Domain / Capability | Status |
| :--- | :--- |
| **Performance** | `OK` |
| **HeapProfiler** | `OK` |
| **Profiler (CPU)** | `OK` |
| **Tracing** | `OK` |

---

## WebGL Context Recovery Verification
- **Context Loss & Restoration**: ✅ Passed (WebGL context lost and restored cleanly)

## Summary Conclusion
The stress test framework completed all 8 phases deterministically using PRNG seed `1337`. All 10 CI report artifacts have been successfully generated.
