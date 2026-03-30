# FAQ & Tags — Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Tag, ArticleFaq, ProjectFaq models and a Tags CRUD module; extend Articles and Projects modules to support tags and FAQs in create/read/update flows.

**Architecture:** New `tags` module (routes → controller → service → repo) following existing module pattern. Extend existing articles and projects modules to include tags/FAQs in their responses and mutations. Replace-all strategy for tag associations and FAQs on update.

**Tech Stack:** Prisma (MySQL), Fastify, Zod, TypeScript strict mode.

**Testing approach:** After each task, the user will manually test via Postman. Each task ends with exact Postman test instructions.

---

## File Map

### New files
- `server/prisma/schema.prisma` — Add Tag, ArticleTag, ProjectTag, ArticleFaq, ProjectFaq models + relations
- `server/src/modules/tags/tags.types.ts` — Tag response/input types
- `server/src/modules/tags/tags.schemas.ts` — Zod validation schemas
- `server/src/modules/tags/tags.repo.ts` — Prisma queries for tags
- `server/src/modules/tags/tags.service.ts` — Tag business logic
- `server/src/modules/tags/tags.controller.ts` — Request handlers
- `server/src/modules/tags/tags.routes.ts` — Fastify route registration

### Modified files
- `server/src/app.ts` — Register tags routes
- `server/src/modules/articles/articles.types.ts` — Add tag/FAQ types to responses and inputs
- `server/src/modules/articles/articles.schemas.ts` — Add tagIds/faqs to create/update schemas
- `server/src/modules/articles/articles.repo.ts` — Include tags/faqs in queries, handle replace-all on mutations
- `server/src/modules/articles/articles.service.ts` — Pass tagIds/faqs through to repo
- `server/src/modules/projects/projects.types.ts` — Add tag/FAQ types to responses and inputs
- `server/src/modules/projects/projects.schemas.ts` — Add tagIds/faqs to create/update schemas
- `server/src/modules/projects/projects.repo.ts` — Include tags/faqs in queries, handle replace-all on mutations
- `server/src/modules/projects/projects.service.ts` — Pass tagIds/faqs through to repo
- `server/postman/collection.json` — Add Tags folder + update Article/Project request bodies

---

## Task 1: Database Schema — Add Tag, FAQ, and Junction Models

**Files:**
- Modify: `server/prisma/schema.prisma`

- [ ] **Step 1: Add Tag model after the Article model (after line 325)**

Add this to the end of `schema.prisma`, before the closing of the file:

```prisma
// ── Tags ────────────────────────────────────────────────

model Tag {
  id        String   @id @default(uuid())
  slug      String   @unique @db.VarChar(300)
  nameKa    String   @db.VarChar(200)
  nameRu    String   @default("") @db.VarChar(200)
  nameEn    String   @default("") @db.VarChar(200)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  articles  ArticleTag[]
  projects  ProjectTag[]

  @@index([slug])
  @@map("tags")
}

model ArticleTag {
  articleId String
  tagId     String
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([articleId, tagId])
  @@index([tagId])
  @@map("article_tags")
}

model ProjectTag {
  projectId String
  tagId     String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([projectId, tagId])
  @@index([tagId])
  @@map("project_tags")
}

// ── FAQs ────────────────────────────────────────────────

model ArticleFaq {
  id         String   @id @default(uuid())
  articleId  String
  questionKa String   @db.Text
  questionRu String   @default("") @db.Text
  questionEn String   @default("") @db.Text
  answerKa   String   @db.Text
  answerRu   String   @default("") @db.Text
  answerEn   String   @default("") @db.Text
  sortOrder  Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  article    Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@index([articleId, sortOrder])
  @@map("article_faqs")
}

model ProjectFaq {
  id         String   @id @default(uuid())
  projectId  String
  questionKa String   @db.Text
  questionRu String   @default("") @db.Text
  questionEn String   @default("") @db.Text
  answerKa   String   @db.Text
  answerRu   String   @default("") @db.Text
  answerEn   String   @default("") @db.Text
  sortOrder  Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  project    Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId, sortOrder])
  @@map("project_faqs")
}
```

- [ ] **Step 2: Add relations to existing Article model**

In the `Article` model (around line 318, after `author User @relation(...)`), add:

```prisma
  tags ArticleTag[]
  faqs ArticleFaq[]
```

- [ ] **Step 3: Add relations to existing Project model**

In the `Project` model (around line 214, before the `@@index` lines), add:

```prisma
  tags ProjectTag[]
  faqs ProjectFaq[]
```

- [ ] **Step 4: Run the migration**

```bash
cd server && npx prisma migrate dev --name add_tags_and_faqs
```

Expected: Migration created and applied successfully. New tables: `tags`, `article_tags`, `project_tags`, `article_faqs`, `project_faqs`.

- [ ] **Step 5: Verify with Prisma Studio**

```bash
cd server && npx prisma studio
```

Expected: Open browser, see the 5 new tables listed. All tables are empty but visible.

- [ ] **Step 6: Commit**

```bash
git add server/prisma/
git commit -m "feat: add Tag, FAQ, and junction table models to Prisma schema"
```

### 🧪 Test checkpoint

Open Prisma Studio (`npx prisma studio`) and verify:
1. `tags` table exists with columns: id, slug, nameKa, nameRu, nameEn, createdAt, updatedAt
2. `article_tags` table exists with columns: articleId, tagId
3. `project_tags` table exists with columns: projectId, tagId
4. `article_faqs` table exists with columns: id, articleId, questionKa/Ru/En, answerKa/Ru/En, sortOrder, createdAt, updatedAt
5. `project_faqs` table exists — same shape as article_faqs but with projectId

Tell me the result before proceeding.

---

## Task 2: Tags Module — Types and Schemas

**Files:**
- Create: `server/src/modules/tags/tags.types.ts`
- Create: `server/src/modules/tags/tags.schemas.ts`

- [ ] **Step 1: Create tags types file**

Create `server/src/modules/tags/tags.types.ts`:

```typescript
/**
 * Tags Module — Types
 */

export interface LocalizedString {
  ka: string;
  ru: string;
  en: string;
}

export interface TagResponse {
  id: string;
  slug: string;
  name: LocalizedString;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagInput {
  name: LocalizedString;
}

export interface UpdateTagInput {
  name?: { ka?: string; ru?: string; en?: string };
}
```

- [ ] **Step 2: Create tags schemas file**

Create `server/src/modules/tags/tags.schemas.ts`:

```typescript
/**
 * Tags Module — Zod Schemas
 */

import { z } from 'zod';

// ── Param Schemas ───────────────────────────────────────

export const TagIdParamSchema = z.object({
  id: z.string().uuid(),
});
export type TagIdParam = z.infer<typeof TagIdParamSchema>;

// ── Query Schemas ───────────────────────────────────────

export const TagsQuerySchema = z.object({
  search: z.string().optional(),
});
export type TagsQuery = z.infer<typeof TagsQuerySchema>;

// ── Create / Update Schemas ─────────────────────────────

const LocalizedNameSchema = z.object({
  ka: z.string().min(1).max(200),
  ru: z.string().max(200).default(''),
  en: z.string().max(200).default(''),
});

const LocalizedNamePartialSchema = z.object({
  ka: z.string().min(1).max(200).optional(),
  ru: z.string().max(200).optional(),
  en: z.string().max(200).optional(),
});

export const CreateTagSchema = z.object({
  name: LocalizedNameSchema,
});
export type CreateTagSchemaInput = z.infer<typeof CreateTagSchema>;

export const UpdateTagSchema = z.object({
  name: LocalizedNamePartialSchema.optional(),
});
export type UpdateTagSchemaInput = z.infer<typeof UpdateTagSchema>;
```

- [ ] **Step 3: Commit**

```bash
git add server/src/modules/tags/
git commit -m "feat: add Tags module types and Zod schemas"
```

No testing needed here — these are just type/schema definitions.

---

## Task 3: Tags Module — Repository

**Files:**
- Create: `server/src/modules/tags/tags.repo.ts`

- [ ] **Step 1: Create tags repository**

Create `server/src/modules/tags/tags.repo.ts`:

```typescript
/**
 * Tags Module — Repository
 *
 * Prisma queries for tags.
 */

import { prisma } from '@libs/prisma.js';
import type { Tag } from '@prisma/client';
import type { TagResponse } from './tags.types.js';

// ── DB → Response Mapper ────────────────────────────────

function toTagResponse(t: Tag): TagResponse {
  return {
    id: t.id,
    slug: t.slug,
    name: { ka: t.nameKa, ru: t.nameRu, en: t.nameEn },
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

// ── Repository ──────────────────────────────────────────

class TagsRepository {
  async findAll(search?: string): Promise<TagResponse[]> {
    const where = search
      ? {
          OR: [
            { nameKa: { contains: search } },
            { nameRu: { contains: search } },
            { nameEn: { contains: search } },
          ],
        }
      : {};

    const rows = await prisma.tag.findMany({
      where,
      orderBy: { nameKa: 'asc' },
    });

    return rows.map(toTagResponse);
  }

  async findById(id: string): Promise<TagResponse | null> {
    const row = await prisma.tag.findUnique({ where: { id } });
    return row ? toTagResponse(row) : null;
  }

  async findByIds(ids: string[]): Promise<TagResponse[]> {
    const rows = await prisma.tag.findMany({
      where: { id: { in: ids } },
    });
    return rows.map(toTagResponse);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await prisma.tag.count({ where: { slug } });
    return count > 0;
  }

  async create(data: {
    slug: string;
    nameKa: string;
    nameRu: string;
    nameEn: string;
  }): Promise<TagResponse> {
    const row = await prisma.tag.create({ data });
    return toTagResponse(row);
  }

  async update(id: string, data: {
    nameKa?: string;
    nameRu?: string;
    nameEn?: string;
  }): Promise<TagResponse> {
    const updateData: Record<string, unknown> = {};
    if (data.nameKa !== undefined) updateData.nameKa = data.nameKa;
    if (data.nameRu !== undefined) updateData.nameRu = data.nameRu;
    if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;

    const row = await prisma.tag.update({
      where: { id },
      data: updateData,
    });
    return toTagResponse(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.tag.delete({ where: { id } });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await prisma.tag.count({ where: { id } });
    return count > 0;
  }
}

export const tagsRepository = new TagsRepository();
```

- [ ] **Step 2: Commit**

```bash
git add server/src/modules/tags/tags.repo.ts
git commit -m "feat: add Tags repository with CRUD queries"
```

---

## Task 4: Tags Module — Service

**Files:**
- Create: `server/src/modules/tags/tags.service.ts`

- [ ] **Step 1: Create tags service**

Create `server/src/modules/tags/tags.service.ts`:

```typescript
/**
 * Tags Module — Service
 *
 * Business logic for tag management.
 */

import { NotFoundError, ConflictError } from '@shared/errors/errors.js';
import { generateUniqueSlug } from '@libs/slugify.js';
import { tagsRepository } from './tags.repo.js';
import type { TagResponse, CreateTagInput, UpdateTagInput } from './tags.types.js';

class TagsService {
  async getAllTags(search?: string): Promise<TagResponse[]> {
    return tagsRepository.findAll(search);
  }

  async getTag(id: string): Promise<TagResponse> {
    const tag = await tagsRepository.findById(id);
    if (!tag) {
      throw new NotFoundError('Tag not found', 'TAG_NOT_FOUND');
    }
    return tag;
  }

  async createTag(input: CreateTagInput): Promise<TagResponse> {
    const slug = await generateUniqueSlug(
      input.name.ka,
      (s) => tagsRepository.existsBySlug(s),
    );

    return tagsRepository.create({
      slug,
      nameKa: input.name.ka,
      nameRu: input.name.ru ?? '',
      nameEn: input.name.en ?? '',
    });
  }

  async updateTag(id: string, input: UpdateTagInput): Promise<TagResponse> {
    const exists = await tagsRepository.existsById(id);
    if (!exists) {
      throw new NotFoundError('Tag not found', 'TAG_NOT_FOUND');
    }

    return tagsRepository.update(id, {
      nameKa: input.name?.ka,
      nameRu: input.name?.ru,
      nameEn: input.name?.en,
    });
  }

  async deleteTag(id: string): Promise<void> {
    const exists = await tagsRepository.existsById(id);
    if (!exists) {
      throw new NotFoundError('Tag not found', 'TAG_NOT_FOUND');
    }
    await tagsRepository.delete(id);
  }
}

export const tagsService = new TagsService();
```

- [ ] **Step 2: Commit**

```bash
git add server/src/modules/tags/tags.service.ts
git commit -m "feat: add Tags service with CRUD business logic"
```

---

## Task 5: Tags Module — Controller, Routes, and App Registration

**Files:**
- Create: `server/src/modules/tags/tags.controller.ts`
- Create: `server/src/modules/tags/tags.routes.ts`
- Modify: `server/src/app.ts`

- [ ] **Step 1: Create tags controller**

Create `server/src/modules/tags/tags.controller.ts`:

```typescript
/**
 * Tags Controller
 *
 * Request handlers for tag endpoints.
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { tagsService } from './tags.service.js';
import { successResponse } from '@shared/responses/successResponse.js';
import {
  TagIdParamSchema,
  TagsQuerySchema,
  CreateTagSchema,
  UpdateTagSchema,
} from './tags.schemas.js';

class TagsController {
  async getAll(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { search } = TagsQuerySchema.parse(request.query);
    const tags = await tagsService.getAllTags(search);
    return reply.send(successResponse('Tags retrieved successfully', tags));
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = CreateTagSchema.parse(request.body);
    const tag = await tagsService.createTag(input);
    return reply.status(201).send(successResponse('Tag created successfully', tag));
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = TagIdParamSchema.parse(request.params);
    const input = UpdateTagSchema.parse(request.body);
    const tag = await tagsService.updateTag(id, input);
    return reply.send(successResponse('Tag updated successfully', tag));
  }

  async remove(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = TagIdParamSchema.parse(request.params);
    await tagsService.deleteTag(id);
    return reply.send(successResponse('Tag deleted successfully', null));
  }
}

export const tagsController = new TagsController();
```

- [ ] **Step 2: Create tags routes**

Create `server/src/modules/tags/tags.routes.ts`:

```typescript
/**
 * Tags Routes
 *
 * Defines HTTP routes for tag operations.
 *
 * Public endpoints:
 * - GET /tags — List all tags (optional ?search= filter)
 *
 * Admin endpoints:
 * - POST   /tags      — Create tag
 * - PATCH  /tags/:id  — Update tag
 * - DELETE /tags/:id  — Delete tag
 */

import type { FastifyInstance } from 'fastify';
import { tagsController } from './tags.controller.js';
import { authenticate, authorize } from '@libs/auth.js';
import { RATE_LIMITS } from '@config/rate-limit.config.js';

export async function tagsRoutes(fastify: FastifyInstance): Promise<void> {
  // ── Public ────────────────────────────────────────────
  fastify.get(
    '/tags',
    {
      config: {
        rateLimit: { max: 60, timeWindow: '1 minute' },
      },
    },
    tagsController.getAll.bind(tagsController),
  );

  // ── Admin ─────────────────────────────────────────────
  fastify.post(
    '/tags',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    tagsController.create.bind(tagsController),
  );

  fastify.patch(
    '/tags/:id',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    tagsController.update.bind(tagsController),
  );

  fastify.delete(
    '/tags/:id',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    tagsController.remove.bind(tagsController),
  );
}
```

- [ ] **Step 3: Register tags routes in app.ts**

In `server/src/app.ts`, add the import (after line 24, the articles import):

```typescript
import { tagsRoutes } from '@modules/tags/tags.routes.js';
```

Add route registration (after line 299, the articles registration):

```typescript
  await app.register(tagsRoutes, { prefix: '/api/v1' });
```

- [ ] **Step 4: Commit**

```bash
git add server/src/modules/tags/ server/src/app.ts
git commit -m "feat: add Tags controller, routes, and register in app"
```

### 🧪 Test checkpoint

Start the server (`npm run dev` in server/) and test with Postman:

1. **GET** `{{baseUrl}}/tags` — should return `{ success: true, data: [] }` (empty list)
2. **POST** `{{baseUrl}}/tags` (as admin, with Bearer token) with body:
   ```json
   { "name": { "ka": "ეკონომიკა", "ru": "Экономика", "en": "Economics" } }
   ```
   Should return 201 with the created tag including auto-generated slug.
3. **POST** `{{baseUrl}}/tags` again with body:
   ```json
   { "name": { "ka": "Anthropic" } }
   ```
   Should return 201.
4. **GET** `{{baseUrl}}/tags` — should return both tags.
5. **GET** `{{baseUrl}}/tags?search=Anthro` — should return only the Anthropic tag.
6. **PATCH** `{{baseUrl}}/tags/:id` with body `{ "name": { "en": "Anthropic AI" } }` — should update.
7. **DELETE** `{{baseUrl}}/tags/:id` — should delete one tag.

Tell me the results before proceeding.

---

## Task 6: Extend Articles — Types and Schemas for Tags & FAQs

**Files:**
- Modify: `server/src/modules/articles/articles.types.ts`
- Modify: `server/src/modules/articles/articles.schemas.ts`

- [ ] **Step 1: Update article types**

Replace the entire contents of `server/src/modules/articles/articles.types.ts`:

```typescript
/**
 * Articles Module — Types
 */

export type ArticleCategory = 'cameras' | 'nvr' | 'installation' | 'news' | 'guides';

export interface ArticleTagResponse {
  id: string;
  slug: string;
  name: { ka: string; ru: string; en: string };
}

export interface ArticleFaqResponse {
  id: string;
  question: { ka: string; ru: string; en: string };
  answer: { ka: string; ru: string; en: string };
  sortOrder: number;
}

export interface ArticleResponse {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  coverImage: string | null;
  videoUrl: string | null;
  isPublished: boolean;
  readMin: number;
  authorId: string;
  tags: ArticleTagResponse[];
  faqs: ArticleFaqResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface FaqInput {
  question: { ka: string; ru?: string; en?: string };
  answer: { ka: string; ru?: string; en?: string };
  sortOrder?: number;
}

export interface CreateArticleInput {
  slug?: string;
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  readMin?: number;
  isPublished?: boolean;
  tagIds?: string[];
  faqs?: FaqInput[];
}

export interface UpdateArticleInput {
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  category?: ArticleCategory;
  coverImage?: string | null;
  videoUrl?: string | null;
  readMin?: number;
  isPublished?: boolean;
  tagIds?: string[];
  faqs?: FaqInput[];
}
```

- [ ] **Step 2: Update article schemas**

Replace the entire contents of `server/src/modules/articles/articles.schemas.ts`:

```typescript
/**
 * Articles Module — Zod Schemas
 */

import { z } from 'zod';

// ── Param Schemas ───────────────────────────────────────

export const ArticleIdParamSchema = z.object({
  id: z.string().uuid(),
});
export type ArticleIdParam = z.infer<typeof ArticleIdParamSchema>;

export const ArticleSlugParamSchema = z.object({
  slug: z.string().min(1).max(300),
});
export type ArticleSlugParam = z.infer<typeof ArticleSlugParamSchema>;

// ── Query Schemas ───────────────────────────────────────

export const PublicArticlesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  category: z.enum(['cameras', 'nvr', 'installation', 'news', 'guides']).optional(),
});
export type PublicArticlesQuery = z.infer<typeof PublicArticlesQuerySchema>;

export const AdminArticlesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  isPublished: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  category: z.enum(['cameras', 'nvr', 'installation', 'news', 'guides']).optional(),
});
export type AdminArticlesQuery = z.infer<typeof AdminArticlesQuerySchema>;

// ── FAQ Sub-Schema ──────────────────────────────────────

const FaqInputSchema = z.object({
  question: z.object({
    ka: z.string().min(1),
    ru: z.string().default(''),
    en: z.string().default(''),
  }),
  answer: z.object({
    ka: z.string().min(1),
    ru: z.string().default(''),
    en: z.string().default(''),
  }),
  sortOrder: z.number().int().min(0).default(0),
});

// ── Create / Update Schemas ─────────────────────────────

const ARTICLE_CATEGORIES = ['cameras', 'nvr', 'installation', 'news', 'guides'] as const;

export const CreateArticleSchema = z.object({
  slug: z.string().min(1).max(300).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only').optional(),
  title: z.string().min(1).max(500),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  category: z.enum(ARTICLE_CATEGORIES),
  readMin: z.number().int().min(1).max(120).default(5),
  isPublished: z.boolean().default(false),
  tagIds: z.array(z.string().uuid()).default([]),
  faqs: z.array(FaqInputSchema).default([]),
});
export type CreateArticleSchemaInput = z.infer<typeof CreateArticleSchema>;

export const UpdateArticleSchema = z.object({
  slug: z.string().min(1).max(300).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only').optional(),
  title: z.string().min(1).max(500).optional(),
  excerpt: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  category: z.enum(ARTICLE_CATEGORIES).optional(),
  coverImage: z.string().max(500).nullable().optional(),
  videoUrl: z.string().max(500).nullable().optional(),
  readMin: z.number().int().min(1).max(120).optional(),
  isPublished: z.boolean().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  faqs: z.array(FaqInputSchema).optional(),
});
export type UpdateArticleSchemaInput = z.infer<typeof UpdateArticleSchema>;
```

- [ ] **Step 3: Commit**

```bash
git add server/src/modules/articles/articles.types.ts server/src/modules/articles/articles.schemas.ts
git commit -m "feat: add tagIds and faqs to article types and schemas"
```

No testing needed — next task integrates these into the repo/service.

---

## Task 7: Extend Articles — Repository (Include Tags & FAQs in Queries and Mutations)

**Files:**
- Modify: `server/src/modules/articles/articles.repo.ts`

- [ ] **Step 1: Replace the entire articles repo**

Replace the entire contents of `server/src/modules/articles/articles.repo.ts`:

```typescript
/**
 * Articles Module — Repository
 *
 * Prisma queries for articles.
 */

import { prisma } from '@libs/prisma.js';
import type { Article, ArticleTag, Tag, ArticleFaq } from '@prisma/client';
import type { ArticleResponse, FaqInput } from './articles.types.js';

// ── Types for Prisma includes ───────────────────────────

type ArticleWithRelations = Article & {
  tags: (ArticleTag & { tag: Tag })[];
  faqs: ArticleFaq[];
};

// ── Include clause reused across queries ────────────────

const ARTICLE_INCLUDE = {
  tags: {
    include: { tag: true },
    orderBy: { tag: { nameKa: 'asc' as const } },
  },
  faqs: {
    orderBy: { sortOrder: 'asc' as const },
  },
};

// ── DB → Response Mapper ────────────────────────────────

function toArticleResponse(a: ArticleWithRelations): ArticleResponse {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    content: a.content,
    category: a.category as ArticleResponse['category'],
    coverImage: a.coverImage,
    videoUrl: a.videoUrl,
    isPublished: a.isPublished,
    readMin: a.readMin,
    authorId: a.authorId,
    tags: a.tags.map((at) => ({
      id: at.tag.id,
      slug: at.tag.slug,
      name: { ka: at.tag.nameKa, ru: at.tag.nameRu, en: at.tag.nameEn },
    })),
    faqs: a.faqs.map((f) => ({
      id: f.id,
      question: { ka: f.questionKa, ru: f.questionRu, en: f.questionEn },
      answer: { ka: f.answerKa, ru: f.answerRu, en: f.answerEn },
      sortOrder: f.sortOrder,
    })),
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

// ── Repository ──────────────────────────────────────────

class ArticlesRepository {
  // ── Public Queries ──────────────────────────────────

  async findPublishedPaginated(
    page: number,
    limit: number,
    category?: string,
  ): Promise<{ items: ArticleResponse[]; totalItems: number }> {
    const where: Record<string, unknown> = { isPublished: true };
    if (category) where.category = category;

    const [rows, totalItems] = await Promise.all([
      prisma.article.findMany({
        where,
        include: ARTICLE_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return {
      items: (rows as ArticleWithRelations[]).map(toArticleResponse),
      totalItems,
    };
  }

  async findBySlug(slug: string): Promise<ArticleResponse | null> {
    const row = await prisma.article.findUnique({
      where: { slug },
      include: ARTICLE_INCLUDE,
    });
    if (!row || !row.isPublished) return null;
    return toArticleResponse(row as ArticleWithRelations);
  }

  // ── Admin Queries ───────────────────────────────────

  async findAllPaginated(
    page: number,
    limit: number,
    filters?: { isPublished?: boolean; category?: string },
  ): Promise<{ items: ArticleResponse[]; totalItems: number }> {
    const where: Record<string, unknown> = {};
    if (filters?.isPublished !== undefined) where.isPublished = filters.isPublished;
    if (filters?.category) where.category = filters.category;

    const [rows, totalItems] = await Promise.all([
      prisma.article.findMany({
        where,
        include: ARTICLE_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return {
      items: (rows as ArticleWithRelations[]).map(toArticleResponse),
      totalItems,
    };
  }

  async findById(id: string): Promise<ArticleResponse | null> {
    const row = await prisma.article.findUnique({
      where: { id },
      include: ARTICLE_INCLUDE,
    });
    return row ? toArticleResponse(row as ArticleWithRelations) : null;
  }

  // ── Mutations ───────────────────────────────────────

  async create(data: {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    readMin: number;
    isPublished: boolean;
    authorId: string;
    tagIds: string[];
    faqs: FaqInput[];
  }): Promise<ArticleResponse> {
    const row = await prisma.article.create({
      data: {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        readMin: data.readMin,
        isPublished: data.isPublished,
        authorId: data.authorId,
        tags: {
          create: data.tagIds.map((tagId) => ({ tagId })),
        },
        faqs: {
          create: data.faqs.map((faq, index) => ({
            questionKa: faq.question.ka,
            questionRu: faq.question.ru ?? '',
            questionEn: faq.question.en ?? '',
            answerKa: faq.answer.ka,
            answerRu: faq.answer.ru ?? '',
            answerEn: faq.answer.en ?? '',
            sortOrder: faq.sortOrder ?? index,
          })),
        },
      },
      include: ARTICLE_INCLUDE,
    });
    return toArticleResponse(row as ArticleWithRelations);
  }

  async update(id: string, data: {
    slug?: string;
    title?: string;
    excerpt?: string;
    content?: string;
    category?: string;
    coverImage?: string | null;
    videoUrl?: string | null;
    readMin?: number;
    isPublished?: boolean;
    tagIds?: string[];
    faqs?: FaqInput[];
  }): Promise<ArticleResponse> {
    // Build the scalar update data
    const updateData: Record<string, unknown> = {};
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.readMin !== undefined) updateData.readMin = data.readMin;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    // Replace-all for tags if provided
    if (data.tagIds !== undefined) {
      updateData.tags = {
        deleteMany: {},
        create: data.tagIds.map((tagId: string) => ({ tagId })),
      };
    }

    // Replace-all for FAQs if provided
    if (data.faqs !== undefined) {
      updateData.faqs = {
        deleteMany: {},
        create: data.faqs.map((faq: FaqInput, index: number) => ({
          questionKa: faq.question.ka,
          questionRu: faq.question.ru ?? '',
          questionEn: faq.question.en ?? '',
          answerKa: faq.answer.ka,
          answerRu: faq.answer.ru ?? '',
          answerEn: faq.answer.en ?? '',
          sortOrder: faq.sortOrder ?? index,
        })),
      };
    }

    const row = await prisma.article.update({
      where: { id },
      data: updateData,
      include: ARTICLE_INCLUDE,
    });
    return toArticleResponse(row as ArticleWithRelations);
  }

  async delete(id: string): Promise<void> {
    await prisma.article.delete({ where: { id } });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await prisma.article.count({ where: { id } });
    return count > 0;
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await prisma.article.count({ where: { slug } });
    return count > 0;
  }
}

export const articlesRepository = new ArticlesRepository();
```

- [ ] **Step 2: Commit**

```bash
git add server/src/modules/articles/articles.repo.ts
git commit -m "feat: include tags and FAQs in article repository queries and mutations"
```

---

## Task 8: Extend Articles — Service (Pass Tags & FAQs Through)

**Files:**
- Modify: `server/src/modules/articles/articles.service.ts`

- [ ] **Step 1: Update createArticle method**

In `articles.service.ts`, update the `createArticle` method (around line 58-73) to pass `tagIds` and `faqs`:

Replace:
```typescript
    return articlesRepository.create({
      slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      readMin: input.readMin ?? 5,
      isPublished: input.isPublished ?? false,
      authorId,
    });
```

With:
```typescript
    return articlesRepository.create({
      slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      readMin: input.readMin ?? 5,
      isPublished: input.isPublished ?? false,
      authorId,
      tagIds: input.tagIds ?? [],
      faqs: input.faqs ?? [],
    });
```

- [ ] **Step 2: Update updateArticle method**

In `articles.service.ts`, update the return statement in `updateArticle` (around line 99-109) to pass `tagIds` and `faqs`:

Replace:
```typescript
    return articlesRepository.update(id, {
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      coverImage: input.coverImage,
      videoUrl: input.videoUrl,
      readMin: input.readMin,
      isPublished: input.isPublished,
    });
```

With:
```typescript
    return articlesRepository.update(id, {
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      coverImage: input.coverImage,
      videoUrl: input.videoUrl,
      readMin: input.readMin,
      isPublished: input.isPublished,
      tagIds: input.tagIds,
      faqs: input.faqs,
    });
```

- [ ] **Step 3: Commit**

```bash
git add server/src/modules/articles/articles.service.ts
git commit -m "feat: pass tagIds and faqs through article service to repository"
```

### 🧪 Test checkpoint

Start the server and test with Postman:

1. **Create 2 tags first** (POST `/tags`) — note their IDs.
2. **Create an article** (POST `/articles`) with tags and FAQs:
   ```json
   {
     "title": "Test Article with Tags and FAQs",
     "excerpt": "Testing tags and FAQ integration",
     "content": "<p>Test content</p>",
     "category": "news",
     "tagIds": ["<tag-id-1>", "<tag-id-2>"],
     "faqs": [
       {
         "question": { "ka": "რა არის ტესტი?", "en": "What is a test?" },
         "answer": { "ka": "ეს არის ტესტი", "en": "This is a test" }
       },
       {
         "question": { "ka": "მეორე კითხვა?", "en": "Second question?" },
         "answer": { "ka": "მეორე პასუხი", "en": "Second answer" },
         "sortOrder": 1
       }
     ]
   }
   ```
   Should return 201 with `tags` array (2 items) and `faqs` array (2 items) in the response.
3. **GET the article by slug** — verify tags and faqs are included in response.
4. **GET all articles** (admin) — verify tags and faqs are in each article.
5. **Update the article** (PATCH) — remove one tag, add a new FAQ:
   ```json
   {
     "tagIds": ["<tag-id-1>"],
     "faqs": [
       {
         "question": { "ka": "ახალი კითხვა?", "en": "New question?" },
         "answer": { "ka": "ახალი პასუხი", "en": "New answer" }
       }
     ]
   }
   ```
   Should return the article with 1 tag and 1 FAQ (old ones replaced).
6. **Check existing articles** that were created before this change — they should have `tags: []` and `faqs: []`.

Tell me the results before proceeding.

---

## Task 9: Extend Projects — Types and Schemas for Tags & FAQs

**Files:**
- Modify: `server/src/modules/projects/projects.types.ts`
- Modify: `server/src/modules/projects/projects.schemas.ts`

- [ ] **Step 1: Update project types**

Replace the entire contents of `server/src/modules/projects/projects.types.ts`:

```typescript
/**
 * Projects Module — Types
 */

export type ProjectType = 'commercial' | 'residential' | 'retail' | 'office';

export interface LocalizedString {
  ka: string;
  ru: string;
  en: string;
}

export interface ProjectTagResponse {
  id: string;
  slug: string;
  name: LocalizedString;
}

export interface ProjectFaqResponse {
  id: string;
  question: LocalizedString;
  answer: LocalizedString;
  sortOrder: number;
}

export interface ProjectResponse {
  id: string;
  slug: string;
  title: LocalizedString;
  excerpt: LocalizedString;
  location: LocalizedString;
  type: ProjectType;
  cameras: number;
  image: string | null;
  videoUrl: string | null;
  content: string;
  year: string;
  isActive: boolean;
  sortOrder: number;
  tags: ProjectTagResponse[];
  faqs: ProjectFaqResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface FaqInput {
  question: { ka: string; ru?: string; en?: string };
  answer: { ka: string; ru?: string; en?: string };
  sortOrder?: number;
}

export interface CreateProjectInput {
  slug?: string;
  title: LocalizedString;
  excerpt?: { ka?: string; ru?: string; en?: string };
  location: LocalizedString;
  type: ProjectType;
  cameras: number;
  image?: string;
  videoUrl?: string | null;
  content?: string;
  year: string;
  isActive?: boolean;
  sortOrder?: number;
  tagIds?: string[];
  faqs?: FaqInput[];
}

export interface UpdateProjectInput {
  slug?: string;
  title?: { ka?: string; ru?: string; en?: string };
  excerpt?: { ka?: string; ru?: string; en?: string };
  location?: { ka?: string; ru?: string; en?: string };
  type?: ProjectType;
  cameras?: number;
  image?: string | null;
  videoUrl?: string | null;
  content?: string;
  year?: string;
  isActive?: boolean;
  sortOrder?: number;
  tagIds?: string[];
  faqs?: FaqInput[];
}
```

- [ ] **Step 2: Update project schemas**

In `server/src/modules/projects/projects.schemas.ts`, add the FAQ sub-schema and extend create/update schemas.

Add the `FaqInputSchema` after the `LocalizedStringPartialSchema` (around line 47):

```typescript
// ── FAQ Sub-Schema ──────────────────────────────────────

const FaqInputSchema = z.object({
  question: z.object({
    ka: z.string().min(1),
    ru: z.string().default(''),
    en: z.string().default(''),
  }),
  answer: z.object({
    ka: z.string().min(1),
    ru: z.string().default(''),
    en: z.string().default(''),
  }),
  sortOrder: z.number().int().min(0).default(0),
});
```

In `CreateProjectSchema`, add before the closing `})`:

```typescript
  tagIds: z.array(z.string().uuid()).default([]),
  faqs: z.array(FaqInputSchema).default([]),
```

In `UpdateProjectSchema`, add before the closing `})`:

```typescript
  tagIds: z.array(z.string().uuid()).optional(),
  faqs: z.array(FaqInputSchema).optional(),
```

- [ ] **Step 3: Commit**

```bash
git add server/src/modules/projects/projects.types.ts server/src/modules/projects/projects.schemas.ts
git commit -m "feat: add tagIds and faqs to project types and schemas"
```

---

## Task 10: Extend Projects — Repository (Include Tags & FAQs)

**Files:**
- Modify: `server/src/modules/projects/projects.repo.ts`

- [ ] **Step 1: Replace the entire projects repo**

Replace the entire contents of `server/src/modules/projects/projects.repo.ts`:

```typescript
/**
 * Projects Module — Repository
 *
 * Prisma queries for projects.
 */

import { prisma } from '@libs/prisma.js';
import type { Project, ProjectTag, Tag, ProjectFaq, Prisma } from '@prisma/client';
import type { ProjectResponse, FaqInput } from './projects.types.js';

// ── Types for Prisma includes ───────────────────────────

type ProjectWithRelations = Project & {
  tags: (ProjectTag & { tag: Tag })[];
  faqs: ProjectFaq[];
};

// ── Include clause reused across queries ────────────────

const PROJECT_INCLUDE = {
  tags: {
    include: { tag: true },
    orderBy: { tag: { nameKa: 'asc' as const } },
  },
  faqs: {
    orderBy: { sortOrder: 'asc' as const },
  },
};

// ── DB → Response Mapper ────────────────────────────────

function toProjectResponse(p: ProjectWithRelations): ProjectResponse {
  return {
    id: p.id,
    slug: p.slug,
    title: { ka: p.titleKa, ru: p.titleRu, en: p.titleEn },
    excerpt: { ka: p.excerptKa, ru: p.excerptRu, en: p.excerptEn },
    location: { ka: p.locationKa, ru: p.locationRu, en: p.locationEn },
    type: p.type as ProjectResponse['type'],
    cameras: p.cameras,
    image: p.image,
    videoUrl: p.videoUrl,
    content: p.content,
    year: p.year,
    isActive: p.isActive,
    sortOrder: p.sortOrder,
    tags: p.tags.map((pt) => ({
      id: pt.tag.id,
      slug: pt.tag.slug,
      name: { ka: pt.tag.nameKa, ru: pt.tag.nameRu, en: pt.tag.nameEn },
    })),
    faqs: p.faqs.map((f) => ({
      id: f.id,
      question: { ka: f.questionKa, ru: f.questionRu, en: f.questionEn },
      answer: { ka: f.answerKa, ru: f.answerRu, en: f.answerEn },
      sortOrder: f.sortOrder,
    })),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

// ── Repository ──────────────────────────────────────────

class ProjectsRepository {
  async findActivePaginated(
    page: number = 1,
    limit: number = 10,
    type?: string,
  ): Promise<{ items: ProjectResponse[]; totalItems: number }> {
    const where: Prisma.ProjectWhereInput = { isActive: true };
    if (type) where.type = type;

    const [rows, totalItems] = await Promise.all([
      prisma.project.findMany({
        where,
        include: PROJECT_INCLUDE,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return {
      items: (rows as ProjectWithRelations[]).map(toProjectResponse),
      totalItems,
    };
  }

  async findAllPaginated(
    page: number,
    limit: number,
    isActive?: boolean,
  ): Promise<{ items: ProjectResponse[]; totalItems: number }> {
    const where = isActive !== undefined ? { isActive } : {};

    const [rows, totalItems] = await Promise.all([
      prisma.project.findMany({
        where,
        include: PROJECT_INCLUDE,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return {
      items: (rows as ProjectWithRelations[]).map(toProjectResponse),
      totalItems,
    };
  }

  async findById(id: string): Promise<ProjectResponse | null> {
    const row = await prisma.project.findUnique({
      where: { id },
      include: PROJECT_INCLUDE,
    });
    return row ? toProjectResponse(row as ProjectWithRelations) : null;
  }

  async findBySlug(slug: string): Promise<ProjectResponse | null> {
    const row = await prisma.project.findUnique({
      where: { slug, isActive: true },
      include: PROJECT_INCLUDE,
    });
    return row ? toProjectResponse(row as ProjectWithRelations) : null;
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await prisma.project.count({ where: { slug } });
    return count > 0;
  }

  async create(data: {
    slug: string;
    titleKa: string;
    titleRu: string;
    titleEn: string;
    excerptKa: string;
    excerptRu: string;
    excerptEn: string;
    locationKa: string;
    locationRu: string;
    locationEn: string;
    type: string;
    cameras: number;
    image?: string;
    videoUrl?: string | null;
    content: string;
    year: string;
    isActive: boolean;
    sortOrder: number;
    tagIds: string[];
    faqs: FaqInput[];
  }): Promise<ProjectResponse> {
    const row = await prisma.project.create({
      data: {
        slug: data.slug,
        titleKa: data.titleKa,
        titleRu: data.titleRu,
        titleEn: data.titleEn,
        excerptKa: data.excerptKa,
        excerptRu: data.excerptRu,
        excerptEn: data.excerptEn,
        locationKa: data.locationKa,
        locationRu: data.locationRu,
        locationEn: data.locationEn,
        type: data.type,
        cameras: data.cameras,
        image: data.image ?? null,
        videoUrl: data.videoUrl ?? null,
        content: data.content,
        year: data.year,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        tags: {
          create: data.tagIds.map((tagId) => ({ tagId })),
        },
        faqs: {
          create: data.faqs.map((faq, index) => ({
            questionKa: faq.question.ka,
            questionRu: faq.question.ru ?? '',
            questionEn: faq.question.en ?? '',
            answerKa: faq.answer.ka,
            answerRu: faq.answer.ru ?? '',
            answerEn: faq.answer.en ?? '',
            sortOrder: faq.sortOrder ?? index,
          })),
        },
      },
      include: PROJECT_INCLUDE,
    });
    return toProjectResponse(row as ProjectWithRelations);
  }

  async update(id: string, data: {
    slug?: string;
    titleKa?: string;
    titleRu?: string;
    titleEn?: string;
    excerptKa?: string;
    excerptRu?: string;
    excerptEn?: string;
    locationKa?: string;
    locationRu?: string;
    locationEn?: string;
    type?: string;
    cameras?: number;
    image?: string | null;
    videoUrl?: string | null;
    content?: string;
    year?: string;
    isActive?: boolean;
    sortOrder?: number;
    tagIds?: string[];
    faqs?: FaqInput[];
  }): Promise<ProjectResponse> {
    const updateData: Record<string, unknown> = {};
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.titleKa !== undefined) updateData.titleKa = data.titleKa;
    if (data.titleRu !== undefined) updateData.titleRu = data.titleRu;
    if (data.titleEn !== undefined) updateData.titleEn = data.titleEn;
    if (data.excerptKa !== undefined) updateData.excerptKa = data.excerptKa;
    if (data.excerptRu !== undefined) updateData.excerptRu = data.excerptRu;
    if (data.excerptEn !== undefined) updateData.excerptEn = data.excerptEn;
    if (data.locationKa !== undefined) updateData.locationKa = data.locationKa;
    if (data.locationRu !== undefined) updateData.locationRu = data.locationRu;
    if (data.locationEn !== undefined) updateData.locationEn = data.locationEn;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.cameras !== undefined) updateData.cameras = data.cameras;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    // Replace-all for tags if provided
    if (data.tagIds !== undefined) {
      updateData.tags = {
        deleteMany: {},
        create: data.tagIds.map((tagId: string) => ({ tagId })),
      };
    }

    // Replace-all for FAQs if provided
    if (data.faqs !== undefined) {
      updateData.faqs = {
        deleteMany: {},
        create: data.faqs.map((faq: FaqInput, index: number) => ({
          questionKa: faq.question.ka,
          questionRu: faq.question.ru ?? '',
          questionEn: faq.question.en ?? '',
          answerKa: faq.answer.ka,
          answerRu: faq.answer.ru ?? '',
          answerEn: faq.answer.en ?? '',
          sortOrder: faq.sortOrder ?? index,
        })),
      };
    }

    const row = await prisma.project.update({
      where: { id },
      data: updateData,
      include: PROJECT_INCLUDE,
    });
    return toProjectResponse(row as ProjectWithRelations);
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await prisma.project.count({ where: { id } });
    return count > 0;
  }
}

export const projectsRepository = new ProjectsRepository();
```

- [ ] **Step 2: Commit**

```bash
git add server/src/modules/projects/projects.repo.ts
git commit -m "feat: include tags and FAQs in project repository queries and mutations"
```

---

## Task 11: Extend Projects — Service (Pass Tags & FAQs Through)

**Files:**
- Modify: `server/src/modules/projects/projects.service.ts`

- [ ] **Step 1: Update createProject method**

In `projects.service.ts`, update the `createProject` method (around line 65-83) to pass `tagIds` and `faqs`:

Replace:
```typescript
    return projectsRepository.create({
      slug,
      titleKa: input.title.ka,
      titleRu: input.title.ru ?? '',
      titleEn: input.title.en ?? '',
      excerptKa: input.excerpt?.ka ?? '',
      excerptRu: input.excerpt?.ru ?? '',
      excerptEn: input.excerpt?.en ?? '',
      locationKa: input.location.ka,
      locationRu: input.location.ru ?? '',
      locationEn: input.location.en ?? '',
      type: input.type,
      cameras: input.cameras,
      image: input.image,
      content: input.content ?? '',
      year: input.year,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
    });
```

With:
```typescript
    return projectsRepository.create({
      slug,
      titleKa: input.title.ka,
      titleRu: input.title.ru ?? '',
      titleEn: input.title.en ?? '',
      excerptKa: input.excerpt?.ka ?? '',
      excerptRu: input.excerpt?.ru ?? '',
      excerptEn: input.excerpt?.en ?? '',
      locationKa: input.location.ka,
      locationRu: input.location.ru ?? '',
      locationEn: input.location.en ?? '',
      type: input.type,
      cameras: input.cameras,
      image: input.image,
      content: input.content ?? '',
      year: input.year,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
      tagIds: input.tagIds ?? [],
      faqs: input.faqs ?? [],
    });
```

- [ ] **Step 2: Update updateProject method**

In `projects.service.ts`, update the return statement in `updateProject` (around line 102-121) to pass `tagIds` and `faqs`:

Replace:
```typescript
    return projectsRepository.update(id, {
      slug: input.slug,
      titleKa: input.title?.ka,
      titleRu: input.title?.ru,
      titleEn: input.title?.en,
      excerptKa: input.excerpt?.ka,
      excerptRu: input.excerpt?.ru,
      excerptEn: input.excerpt?.en,
      locationKa: input.location?.ka,
      locationRu: input.location?.ru,
      locationEn: input.location?.en,
      type: input.type,
      cameras: input.cameras,
      image: input.image,
      content: input.content,
      year: input.year,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
    });
```

With:
```typescript
    return projectsRepository.update(id, {
      slug: input.slug,
      titleKa: input.title?.ka,
      titleRu: input.title?.ru,
      titleEn: input.title?.en,
      excerptKa: input.excerpt?.ka,
      excerptRu: input.excerpt?.ru,
      excerptEn: input.excerpt?.en,
      locationKa: input.location?.ka,
      locationRu: input.location?.ru,
      locationEn: input.location?.en,
      type: input.type,
      cameras: input.cameras,
      image: input.image,
      content: input.content,
      year: input.year,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
      tagIds: input.tagIds,
      faqs: input.faqs,
    });
```

- [ ] **Step 3: Commit**

```bash
git add server/src/modules/projects/projects.service.ts
git commit -m "feat: pass tagIds and faqs through project service to repository"
```

### 🧪 Test checkpoint

Start the server and test with Postman:

1. **Create a project** with tags and FAQs:
   ```json
   {
     "title": { "ka": "ტესტ პროექტი", "en": "Test Project" },
     "location": { "ka": "თბილისი", "en": "Tbilisi" },
     "type": "commercial",
     "cameras": 16,
     "year": "2025",
     "tagIds": ["<existing-tag-id>"],
     "faqs": [
       {
         "question": { "ka": "რა სისტემა დაიმონტაჟა?", "en": "What system was installed?" },
         "answer": { "ka": "16 კამერიანი სისტემა", "en": "16-camera system" }
       }
     ]
   }
   ```
   Should return 201 with `tags` and `faqs` arrays in the response.
2. **GET the project by slug** — verify tags and faqs included.
3. **GET all projects** (admin) — verify tags and faqs in list responses.
4. **Update the project** — add/remove tags, replace FAQs.
5. **Check existing projects** — they should have `tags: []` and `faqs: []`.

Tell me the results before proceeding.

---

## Task 12: Update Postman Collection

**Files:**
- Modify: `server/postman/collection.json`

- [ ] **Step 1: Add Tags folder to Postman collection**

Add a new "Tags" folder with these requests:
- `GET {{baseUrl}}/tags` — List all tags (no auth)
- `GET {{baseUrl}}/tags?search=test` — Search tags (no auth)
- `POST {{baseUrl}}/tags` — Create tag (admin auth)
  - Body: `{ "name": { "ka": "ტესტ", "ru": "Тест", "en": "Test" } }`
- `PATCH {{baseUrl}}/tags/{{tagId}}` — Update tag (admin auth)
  - Body: `{ "name": { "en": "Updated" } }`
- `DELETE {{baseUrl}}/tags/{{tagId}}` — Delete tag (admin auth)

Add a `Tests` script on the Create Tag request to capture `tagId`:
```javascript
if (pm.response.code === 201) {
  const res = pm.response.json();
  pm.collectionVariables.set("tagId", res.data.id);
}
```

- [ ] **Step 2: Update Article request bodies**

Update the "Create Article" request body to include `tagIds` and `faqs` example fields.
Update the "Update Article" request body similarly.

- [ ] **Step 3: Update Project request bodies**

Update the "Create Project" request body to include `tagIds` and `faqs` example fields.
Update the "Update Project" request body similarly.

- [ ] **Step 4: Commit**

```bash
git add server/postman/collection.json
git commit -m "feat: add Tags folder and update Article/Project bodies in Postman collection"
```

### 🧪 Final test checkpoint

Import the updated Postman collection and run through the full flow:
1. Login → tokens auto-set
2. Create 3 tags
3. Create an article with 2 tags + 2 FAQs
4. Create a project with 1 tag + 1 FAQ
5. GET both by slug — verify all data present
6. Update both — replace tags/FAQs
7. Delete a tag — verify it's removed from article/project responses (cascade)
8. GET list endpoints — verify tags/faqs in all list responses

Tell me the results. Once confirmed, the server work is complete and we can move to the client.
