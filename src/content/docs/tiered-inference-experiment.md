---
title: "Tiered Multi-GPU Inference: VRAM Tier vs Architecture Generation"
---

:::note[Experiment]
This is an active experiment within LocoConvoy. If it develops a clear paper path, it will be promoted to its own repository.
:::

An experiment to isolate two variables that existing multi-GPU benchmarks conflate: **VRAM capacity** and **architecture generation** (specifically, Tensor Core availability). Most consumer multi-GPU work assumes matched RTX cards. This experiment uses matched GTX cards as a control group to measure what Tensor Cores actually contribute to inference throughput when VRAM is held roughly constant.

---

## Research Questions

**Primary:** At what VRAM tier does PCIe-bandwidth-limited multi-GPU inference become viable for practical use (defined as >3 tok/s on a quantised model)?

**Secondary:** What is the measurable contribution of Tensor Cores to inference throughput when VRAM capacity is held constant?

**Tertiary:** Is there a crossover point where adding more low-generation VRAM outperforms fewer high-generation VRAM slots?

---

## Why This Matters

The existing [multi-GPU pooling experiment](multi-gpu.md) tests matched RTX 2060 Supers and RTX 3060s -- same architecture generation, scaling VRAM by adding cards. That design answers "does pooling work?" but cannot answer "does architecture matter?"

Tortuga's GTX fleet provides the missing control group. The GTX 1060 6 GB and RTX 2060 Super 8 GB share enough VRAM to be roughly comparable, but differ in architecture generation and Tensor Core availability. Running the same scaling experiment on both tracks -- one GTX, one RTX -- isolates the architecture variable.

The community assumption is that Tensor Cores accelerate inference. For compute-bound workloads, they do. But LLM inference is memory-bandwidth-bound, not compute-bound. The GTX 1060 6 GB has 192 GB/s bandwidth; the RTX 2060 Super has 448 GB/s. If the RTX advantage is primarily bandwidth rather than Tensor Cores, that changes the purchasing advice for budget builders: older high-bandwidth cards may be better buys than newer low-bandwidth ones.

---

## Experimental Design

### Track A -- GTX (No Tensor Cores)

All cards from Tortuga. Pascal architecture, CUDA cores only.

| Config | Cards | Total VRAM | Per-Card BW |
|--------|-------|------------|-------------|
| A1 | 1x GTX 1060 6 GB | 6 GB | 192 GB/s |
| A2 | 2x GTX 1060 6 GB | 12 GB | 192 GB/s each |
| A3 | 3x GTX 1060 6 GB | 18 GB | 192 GB/s each |

*Tortuga has three GTX 1060 6 GB cards. All configurations are available without additional acquisition.*

### Track B -- RTX (Tensor Cores)

All cards from Colmena. Turing architecture, Tensor Core enabled.

| Config | Cards | Total VRAM | Per-Card BW |
|--------|-------|------------|-------------|
| B1 | 1x RTX 2060 Super 8 GB | 8 GB | 448 GB/s |
| B2 | 2x RTX 2060 Super 8 GB | 16 GB | 448 GB/s each |
| B3 | 3x RTX 2060 Super 8 GB | 24 GB | 448 GB/s each |

### Controls

| Config | Card | Total VRAM | Notes |
|--------|------|------------|-------|
| C1 | 1x RTX 3090 24 GB | 24 GB | Single-card control for B3 (planned acquisition) |
| C2 | 1x GTX Titan X 12 GB | 12 GB | Single-card control for A2 (Tortuga) |

C1 compares 3x RTX 2060 Super (24 GB pooled, 448 GB/s per card) against RTX 3090 (24 GB monolithic, 936 GB/s). C2 compares 2x GTX 1060 6 GB (12 GB pooled, 192 GB/s per card) against the Titan X (12 GB monolithic, 336 GB/s). Both test whether pooled commodity cards match a single high-VRAM card at the same total capacity.

---

## Methodology

- **Inference engine:** llama.cpp with `--tensor-split` for multi-GPU layer distribution
- **Models:** Llama 3.1 8B, Llama 3.1 13B (Q4_K_M and Q8_0 quantisations)
- **Metrics:**
  - Tokens/second (prompt processing and generation, separately)
  - VRAM utilisation per card
  - CPU offload percentage (if any layers spill to system RAM)
  - PCIe bandwidth utilisation
- **Control variables:** Same host machine per track (Colmena for Track B, Tortuga for Track A), same prompt set, same context length, same quantisation per run
- **Benchmark harness:** LocoBench standard harness for consistent logging and reproducibility

### Cross-Track Comparison Points

The most informative comparisons isolate one variable at a time:

| Comparison | What It Tests |
|------------|---------------|
| A1 (6 GB GTX) vs B1 (8 GB RTX) | Architecture + bandwidth difference at similar VRAM |
| A2 (12 GB GTX pooled) vs C2 (12 GB Titan X) | Pooled vs monolithic, no Tensor Cores in either |
| B3 (24 GB RTX pooled) vs C1 (24 GB RTX 3090) | Pooled vs monolithic, Tensor Cores in both |
| A2 (12 GB GTX pooled) vs B1 (8 GB RTX single) | More VRAM (no Tensor Cores) vs less VRAM (Tensor Cores) |
| A3 (18 GB GTX pooled) vs B2 (16 GB RTX pooled) | Similar VRAM, different architecture, both multi-GPU |

---

## Expected Outcomes

1. **PCIe bottleneck will suppress multi-GPU gains** relative to theoretical VRAM scaling. Scaling efficiency will be well below 100%, consistent with the [pooling experiment](multi-gpu.md) hypothesis.

2. **Tensor Core advantage will be most visible at Q8_0.** At Q4_K_M, the quantised weights are small enough that memory bandwidth dominates. At Q8_0, the larger weight representation may give Tensor Cores more to work with.

3. **Bandwidth may matter more than Tensor Cores.** The RTX 2060 Super's 448 GB/s vs the GTX 1060's 192 GB/s is a 2.3x bandwidth advantage. If Track B outperforms Track A by roughly that ratio regardless of quantisation level, Tensor Cores are not the differentiator -- bandwidth is.

4. **There may be a "good enough" threshold.** 18 GB of GTX VRAM (A3) at >3 tok/s would mean larger models are accessible on salvaged pre-RTX hardware. Whether that threshold is reachable depends on the PCIe penalty at three-card configurations.

---

## Hardware Availability

Both tracks are ready to run. Colmena has three RTX 2060 Supers installed. Tortuga has three GTX 1060 6 GB cards. The Titan X control (C2) is already in Tortuga. The RTX 3090 control (C1) is a planned Colmena acquisition.

---

## Significance

This experiment documents a reproducible, low-cost pathway for running larger models on salvaged consumer hardware. The GTX track is especially relevant: if pre-RTX cards scale meaningfully across PCIe, a substantial pool of secondhand Maxwell and Pascal hardware becomes viable for multi-GPU inference. That finding -- positive or negative -- is directly useful to low-resource AI research contexts and institutions considering on-premise inference without cloud spend.

The cross-architecture comparison provides baseline data that does not exist in the literature. Consumer multi-GPU benchmarks either assume matched RTX hardware or test single cards. Nobody has systematically compared GTX scaling against RTX scaling on the same workloads.

---

*Part of the [LocoConvoy](https://github.com/michael-borck/loco-convoy) project. Related: [Multi-GPU Inference Pooling](multi-gpu.md), [LocoBench](https://locobench.org), [LocoLab](https://locolabo.org).*
