# OMEGA SWARM v10.0 Stress Test Summary Report

**Execution Timestamp**: 2026-08-02T09:09:47.799Z  
**Target Application**: `http://localhost:3000`  
**PRNG Seed**: `42`  
**Execution Duration**: `69.81s`  
**Overall Status**: **WARN**

---

## Performance Budget Evaluation

| Metric | Measured Value | Threshold | Status |
| :--- | :--- | :--- | :--- |
| Average Route Latency | 520ms | < 500ms (PASS), < 1000ms (WARN) | **WARN** |
| Largest Contentful Paint (LCP) | 624ms | < 2500ms (PASS), < 4000ms (WARN) | **PASS** |
| Cumulative Layout Shift (CLS) | 0.00 | < 0.1 (PASS), < 0.25 (WARN) | **PASS** |
| Frame Rate (FPS) | 15 FPS | >= 15 FPS (PASS), >= 10 FPS (WARN) | **PASS** |
| Heap Growth Percentage | -10.9% | < 20% (PASS), < 50% (WARN) | **PASS** |
| Garbage Collection Stability | STABLE | Memory bounded & reclaimed | **PASS** |
| Console Error Count | 0 errors | 0 errors (PASS), < 3 (WARN) | **PASS** |
| Network HTTP Failures | 0 failures | 0 failures (PASS), < 2 (WARN) | **PASS** |

---

## 8 Test Phase Execution Summary

| Phase # | Phase Name | Status | Duration (ms) | Details |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Warm-up | **PASS** | 3330ms | {"navLatency":234,"initialFPS":20,"initialHeapBytes":60292400} |
| 2 | Navigation Stress | **PASS** | 8896ms | {"totalNavigations":12,"avgLatencyMs":520} |
| 3 | Scroll Stress | **PASS** | 10170ms | {"scrollFPS":16} |
| 4 | Interaction Stress | **PASS** | 25166ms | {"totalInteractions":26} |
| 5 | CPU / Network Throttling | **PASS** | 4836ms | {"throttledNavLatencyMs":3091,"throttledFPS":63} |
| 6 | WebGL Context Loss & Recovery | **PASS** | 2797ms | {"success":true,"isLost":true,"isRestored":true} |
| 7 | Idle Observation | **PASS** | 5210ms | {"idleDurationMs":5000,"idleStartHeapBytes":70386256,"idleEndHeapBytes":49348932,"heapGrowthBytes":-21037324} |
| 8 | Recovery Verification | **PASS** | 4592ms | {"recoveryFPS":15,"finalHeapBytes":53715076,"isCanvasActive":true} |

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
The stress test framework completed all 8 phases deterministically using PRNG seed `42`. All 10 CI report artifacts have been successfully generated.
