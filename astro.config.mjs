import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://lococonvoy.org',
  base: '/docs',
  integrations: [
    starlight({
      title: 'LocoConvoy',
      description: 'Multi-GPU parallelism research on consumer PCIe hardware',
      favicon: '/favicon.svg',
      social: [
        { icon: 'external', label: 'Home', href: 'https://lococonvoy.org' },
        { icon: 'external', label: 'LocoLab', href: 'https://locolabo.org' },
        { icon: 'github', label: 'GitHub', href: 'https://github.com/michael-borck/loco-convoy' },
      ],
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Research',
          items: [
            { label: 'Multi-GPU Inference on Consumer Hardware', slug: 'multi-gpu' },
            { label: 'Multi-GPU AI Inference Guide', slug: 'multi-gpu-ai-inference' },
          ],
        },
        {
          label: 'Related Projects',
          items: [
            { label: 'LocoLLM', link: 'https://locollm.org' },
            { label: 'LocoBench', link: 'https://locobench.org' },
            { label: 'LocoLab', link: 'https://locolabo.org' },
          ],
        },
      ],
    }),
  ],
});
