---
title: "About LocoConvoy"
---

LocoConvoy is a research project investigating **multi-GPU parallelism on consumer PCIe hardware** -- the kind of secondhand GPUs and mining chassis you can pick up for a fraction of datacenter costs. No NVLink. No enterprise interconnects. Just PCIe and persistence.

## The Core Question

Can multiple cheap consumer GPUs, connected over standard PCIe, deliver practical AI inference performance? And if so, under what conditions?

Datacenter multi-GPU setups rely on NVLink, which provides hundreds of GB/s of inter-GPU bandwidth. Consumer hardware is limited to PCIe 4.0 x16 at roughly 32 GB/s -- about one-tenth the bandwidth. LocoConvoy systematically measures what that penalty actually costs in real-world inference workloads, and identifies the scenarios where consumer multi-GPU is genuinely worthwhile.

## Research Areas

LocoConvoy focuses on three parallelism strategies:

### Load Balancing
Running multiple independent model instances across separate GPUs to serve concurrent users. Each card operates independently, eliminating the PCIe bottleneck entirely. Six GPUs means six simultaneous inference workers -- ideal for classroom or small-team deployments.

### Mixture of Agents (MoA)
Multiple models contribute to a single response, each running on its own GPU. Different specialist models (or different quantisations of the same model) collaborate without competing for the same VRAM pool.

### Speculative Decoding
A small draft model on one GPU proposes tokens while a larger verification model on another GPU accepts or rejects them. The approach trades inter-GPU bandwidth for faster token generation by reducing the number of full-model forward passes.

## Hardware

Two WEIHO 8-GPU enclosed chassis -- eight native PCIe slots each, no risers needed. Between them, every multi-GPU experiment configuration the project requires.

**Colmena** (always-on) -- RTX 2060 Super x3, RTX 3060, Tesla P100, with RTX 3090 and RTX 4060 Ti planned. Turing and Ampere cards with Tensor Cores. Handles load balancing, Mixture of Agents, vLLM tensor parallelism, and speculative decoding experiments.

**Tortuga** (on-call) -- GTX 950, GTX 960, GTX 1050 Ti, GTX 1060 3 GB, GTX 1060 6 GB x3, GTX 980 Ti, GTX Titan X. Maxwell and Pascal cards without Tensor Cores. Provides the control group for the [tiered inference experiment](tiered-inference-experiment.md) -- matched GTX scaling to isolate what Tensor Cores actually contribute.

## Philosophy

LocoConvoy follows the same "best from what you have" philosophy as the broader [LocoLab](https://locolabo.org) research group. The goal is not to compete with datacenter hardware but to rigorously document what consumer hardware can actually do -- and to identify the configurations, frameworks, and workloads where budget multi-GPU setups deliver genuine value.

The results inform practical purchasing decisions: should you buy one expensive card or several cheap ones? The answer depends on your workload, and LocoConvoy provides the data to make that choice with evidence rather than assumptions.

## Related Projects

- **[LocoLLM](https://locollm.org)** -- Routed specialist language models on consumer hardware
- **[LocoBench](https://locobench.org)** -- Standardised benchmarking for local LLM inference
- **[LocoLab](https://locolabo.org)** -- The applied AI research lab at Curtin University that coordinates these projects
