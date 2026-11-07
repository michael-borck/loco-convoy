import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { loco } from '@locolabo/theme';

export default defineConfig({
  site: 'https://lococonvoy.org',
  integrations: [
    starlight(
      loco({
        project: 'loco-convoy',
        title: 'LocoConvoy',
        description: 'Multi-GPU parallelism research on consumer PCIe hardware',
        home: 'https://lococonvoy.org',
        github: 'loco-convoy',
        accent: { low: '#1a0a2e', main: '#a855f7', high: '#e9d5ff' },
        favicon: '/favicon.svg',
        logo: {
          alt: 'LocoConvoy',
          src: './src/assets/convoy.svg',
          replacesTitle: false,
        },
        sidebar: [
          {
            label: 'Research',
            items: [
              { label: 'Multi-GPU Inference on Consumer Hardware', slug: 'multi-gpu' },
              { label: 'Tiered Inference: VRAM vs Architecture', slug: 'tiered-inference-experiment' },
              { label: 'Multi-GPU AI Inference Guide', slug: 'multi-gpu-ai-inference' },
            ],
          },
        ],
      })
    ),
  ],
});
