import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        blog: z
          .object({
            date: z.coerce.date(),
            image: z.string(),
            imageAlt: z.string(),
            cardDescription: z.string().optional(),
          })
          .optional(),
        manual: z
          .object({
            id: z.string(),
            repository: z.literal('bluetape4k-projects'),
            group: z.string(),
            kind: z.enum(['library', 'example', 'benchmark']),
            sourceCommit: z.string().regex(/^[0-9a-f]{40}$/),
            sourcePath: z.string(),
            layer: z.enum(['build', 'learn', 'apply']),
          })
          .optional(),
      }),
    }),
  }),
};
