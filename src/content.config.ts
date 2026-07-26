import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';
import repositoryData from './data/manual/repositories.json';
import { validateRepositoryRegistry } from '../scripts/manual/lib/repositories.mjs';

const repositorySlugs = new Set(
  validateRepositoryRegistry(repositoryData).repositories.map((repository: { slug: string }) => repository.slug),
);

const manualBase = z.object({
  id: z.string(),
  repository: z.string().refine((value) => repositorySlugs.has(value), 'Unknown manual repository'),
  group: z.string(),
  kind: z.enum(['library', 'example', 'benchmark', 'guide']),
  sourceCommit: z.string().regex(/^[0-9a-f]{40}$/),
  sourcePath: z.string(),
  releaseRef: z.string().regex(/^v?\d+\.\d+\.\d+$/),
  sourceDir: z.string().min(1),
  layer: z.enum(['build', 'learn', 'apply']),
  learningOrder: z.number().int().positive().optional(),
  chapterOrder: z.number().int().positive().optional(),
});

const manual = manualBase.extend({
  minorVersion: z.string().regex(/^\d+\.\d+$/),
  releaseCommit: z.string().regex(/^[0-9a-f]{40}$/),
});

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
            tags: z.array(z.string()).default([]),
          })
          .optional(),
        manual: manual.optional(),
      }),
    }),
  }),
};
