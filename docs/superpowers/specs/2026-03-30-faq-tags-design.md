# FAQ & Tags for Articles and Projects

## Goal

Add FAQ and Tags sections to the bottom of every blog post and project detail page. Both features improve SEO (structured data, keyword density) and help users understand content better.

## Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Tag scope | Shared across articles & projects | One tag pool, simpler management, cross-content relevance |
| Language | Multi-language (ka/ru/en) | Matches project model, future-proof |
| FAQ ownership | Unique per article/project | Tailored content per page, better SEO |
| Tag management | Inline creation + dedicated admin page | Fast authoring + cleanup capability |
| Tag linking | Non-clickable badges | Start simple, add tag pages later if needed |

---

## Database Schema

### Tag

```prisma
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
```

### Junction Tables

```prisma
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
```

### ArticleFaq

```prisma
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
```

### ProjectFaq

```prisma
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

### Model Relation Updates

Add to existing `Article` model:
```prisma
tags ArticleTag[]
faqs ArticleFaq[]
```

Add to existing `Project` model:
```prisma
tags ProjectTag[]
faqs ProjectFaq[]
```

---

## Server API

### Tags Module (`/api/v1/tags`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/tags` | Public | List all tags |
| POST | `/tags` | Admin | Create tag |
| PATCH | `/tags/:id` | Admin | Update tag |
| DELETE | `/tags/:id` | Admin | Delete tag (cascades junction rows) |

**Create/Update payload:**
```json
{
  "name": { "ka": "required", "ru": "optional", "en": "optional" }
}
```

Slug auto-generated from `nameKa` on create.

### Articles Module Changes

**Create/Update payloads gain:**
```json
{
  "tagIds": ["uuid1", "uuid2"],
  "faqs": [
    {
      "question": { "ka": "...", "ru": "...", "en": "..." },
      "answer": { "ka": "...", "ru": "...", "en": "..." },
      "sortOrder": 0
    }
  ]
}
```

**GET responses include:**
```json
{
  "tags": [{ "id": "...", "slug": "...", "name": { "ka": "...", "ru": "...", "en": "..." } }],
  "faqs": [{ "id": "...", "question": { "ka": "...", ... }, "answer": { "ka": "...", ... }, "sortOrder": 0 }]
}
```

**FAQ update strategy:** Replace-all — on article update, delete all existing FAQs for that article, insert new ones. Simple and avoids diff logic.

**Tag update strategy:** Replace-all — on article update, delete all junction rows for that article, insert new ones.

### Projects Module Changes

Same pattern as articles — `tagIds` and `faqs` in create/update payloads, `tags` and `faqs` in responses.

---

## Client (future — not in this spec)

### Admin Forms
- ArticleForm & ProjectForm: add Tags multi-select combobox + FAQ dynamic form array
- Dedicated `/admin/tags` page for tag CRUD

### Public Display
- FAQ accordion section with JSON-LD structured data
- Tags cloud section with non-clickable badges
- Both placed after footer, before related items on detail pages

---

## Implementation Approach

Server-first, step-by-step with manual testing checkpoints after each step. Client work begins only after server is fully tested and confirmed working.
