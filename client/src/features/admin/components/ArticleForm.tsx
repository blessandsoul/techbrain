'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { RichTextEditor } from './RichTextEditor';
import { VideoUploader } from './VideoUploader';
import { InfoTooltip } from './InfoTooltip';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateArticle, useUploadArticleCover, useUploadArticleContentImage, articleKeys } from '../hooks/useArticles';
import { articleService } from '../services/article.service';

import { getArticleImageUrl } from '@/features/blog/hooks/useBlog';
import { getErrorMessage } from '@/lib/utils/error';
import { stripServerBaseUrl, resolveContentImageUrls } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';

import type { IArticle, ArticleCategory } from '@/features/articles/types/article.types';

interface ArticleFormProps {
  article?: IArticle;
}

const KA_TO_LATIN: Record<string, string> = {
  'ა': 'a', 'ბ': 'b', 'გ': 'g', 'დ': 'd', 'ე': 'e', 'ვ': 'v', 'ზ': 'z',
  'თ': 't', 'ი': 'i', 'კ': 'k', 'ლ': 'l', 'მ': 'm', 'ნ': 'n', 'ო': 'o',
  'პ': 'p', 'ჟ': 'zh', 'რ': 'r', 'ს': 's', 'ტ': 't', 'უ': 'u', 'ფ': 'f',
  'ქ': 'q', 'ღ': 'gh', 'ყ': 'k', 'შ': 'sh', 'ჩ': 'ch', 'ც': 'ts', 'ძ': 'dz',
  'წ': 'ts', 'ჭ': 'ch', 'ხ': 'kh', 'ჯ': 'j', 'ჰ': 'h',
};

function toUrlSlug(text: string): string {
  return text
    .split('')
    .map((ch) => KA_TO_LATIN[ch] ?? ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function isHtmlContent(content: string): boolean {
  return content.trimStart().startsWith('<');
}

/** Convert legacy Markdown content to basic HTML for editor loading */
function markdownToBasicHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt: string, url: string) => {
      const fullUrl = url.startsWith('http') ? url : getArticleImageUrl(url);
      return `<img src="${fullUrl}" alt="${alt}" />`;
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hupbolia])/gm, '<p>')
    .replace(/<p><\/p>/g, '');
}

interface FormErrors {
  title?: string;
  excerpt?: string;
  content?: string;
}

export function ArticleForm({ article }: ArticleFormProps): React.ReactElement {
  const isEdit = !!article;

  const router = useRouter();
  const queryClient = useQueryClient();

  const [isPublished, setIsPublished] = useState(article?.isPublished ?? false);
  const [coverPreview, setCoverPreview] = useState(
    article?.coverImage ? getArticleImageUrl(article.coverImage, article.updatedAt) : '',
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverRemoved, setCoverRemoved] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(article?.videoUrl ?? null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bodyHtml, setBodyHtml] = useState('');
  const [categoryValue, setCategoryValue] = useState<ArticleCategory>(article?.category ?? 'guides');
  const [errors, setErrors] = useState<FormErrors>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingImagesRef = useRef<Map<string, File>>(new Map());

  const updateMutation = useUpdateArticle();
  const uploadCoverMutation = useUploadArticleCover();
  const uploadContentImageMutation = useUploadArticleContentImage();

  const isSubmitting = submitting || updateMutation.isPending;

  const initialContent = article?.content
    ? resolveContentImageUrls(
        isHtmlContent(article.content)
          ? article.content
          : markdownToBasicHtml(article.content)
      )
    : '';

  function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setCoverRemoved(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  const handleImageUpload = useCallback(async (file: File): Promise<string | null> => {
    if (article?.id) {
      // Edit mode: upload immediately
      try {
        const result = await uploadContentImageMutation.mutateAsync({ id: article.id, file });
        return getArticleImageUrl(result.url);
      } catch {
        return null;
      }
    }
    // Create mode: use blob URL for preview, upload after article is created
    const blobUrl = URL.createObjectURL(file);
    pendingImagesRef.current.set(blobUrl, file);
    return blobUrl;
  }, [article?.id, uploadContentImageMutation]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = (formData.get('title') as string) || '';
    const excerpt = (formData.get('excerpt') as string) || '';
    const readMin = Number(formData.get('readMin')) || 5;
    const content = stripServerBaseUrl(bodyHtml || initialContent);

    // Client-side validation
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = 'სათაური სავალდებულოა';
    if (!excerpt.trim()) newErrors.excerpt = 'მოკლე აღწერა სავალდებულოა';
    if (!content.trim()) newErrors.content = 'შინაარსი სავალდებულოა';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    if (isEdit && article) {
      // Update existing article
      await updateMutation.mutateAsync({
        id: article.id,
        data: {
          title,
          excerpt,
          content,
          category: categoryValue,
          readMin,
          isPublished,
          // If cover was removed and no new file selected, set coverImage to null
          ...(coverRemoved && !coverFile ? { coverImage: null } : {}),
        },
      });

      // Upload cover if a new file was selected
      if (coverFile) {
        await uploadCoverMutation.mutateAsync({ id: article.id, file: coverFile });
      }

      // Upload video if a new file was selected in edit mode
      if (videoFile) {
        await articleService.uploadVideo(article.id, videoFile);
      }
    } else {
      // Create new article — handle directly to support pending image uploads
      const slug = toUrlSlug(title) || `article-${Date.now()}`;
      setSubmitting(true);

      try {
        const created = await articleService.createArticle({
          slug,
          title,
          excerpt,
          content,
          category: categoryValue,
          readMin,
          isPublished,
        });

        // Upload cover after creation
        if (coverFile) {
          await articleService.uploadCover(created.id, coverFile);
        }

        // Upload video after creation
        if (videoFile) {
          await articleService.uploadVideo(created.id, videoFile);
        }

        // Upload pending content images and replace blob URLs
        if (pendingImagesRef.current.size > 0) {
          let updatedContent = content;
          for (const [blobUrl, file] of pendingImagesRef.current) {
            const result = await articleService.uploadContentImage(created.id, file);
            updatedContent = updatedContent.replaceAll(blobUrl, result.url);
          }
          await articleService.updateArticle(created.id, { content: updatedContent });
          pendingImagesRef.current.clear();
        }

        toast.success('სტატია შეიქმნა');
        queryClient.invalidateQueries({ queryKey: articleKeys.all });
        router.push(ROUTES.ADMIN.ARTICLES_EDIT(created.id));
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setSubmitting(false);
      }
    }
  }

  const labelClass = 'text-xs text-muted-foreground';

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {/* Cover Image */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-1">გარეკანი</span>
          <p className="text-xs text-muted-foreground mb-3">რეკომენდებული: 1200×675px (16:9). მინ. 960×540px. მნიშვნელოვანი კონტენტი ცენტრში.</p>
          <div className="flex items-center gap-3">
            {coverPreview && (
              <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-muted">
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setCoverPreview(''); setCoverFile(null); setCoverRemoved(true); }}
                  className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-black/80 transition-colors"
                  aria-label="გარეკანის წაშლა"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={submitting}
            >
              {submitting ? 'ატვირთვა...' : 'ატვირთვა'}
            </Button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverSelect} />
          </div>
        </div>

        {/* Video */}
        <VideoUploader
          videoUrl={videoUrl}
          resolveUrl={(url) => getArticleImageUrl(url, article?.updatedAt)}
          onUpload={async (file) => {
            if (isEdit && article?.id) {
              setVideoUploading(true);
              try {
                const updated = await articleService.uploadVideo(article.id, file);
                setVideoUrl(updated.videoUrl);
              } catch (error) {
                toast.error(getErrorMessage(error));
              } finally {
                setVideoUploading(false);
              }
            } else {
              setVideoFile(file);
              setVideoUrl(URL.createObjectURL(file));
            }
          }}
          onRemove={() => {
            if (videoUrl?.startsWith('blob:')) {
              URL.revokeObjectURL(videoUrl);
            }
            setVideoUrl(null);
            setVideoFile(null);
          }}
          isPending={videoUploading}
        />

        {/* Meta */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-4">
              <Label className={labelClass}>სათაური <InfoTooltip text="სტატიის სათაური — გამოჩნდება საიტზე და SEO-ში" /></Label>
              <Input name="title" defaultValue={article?.title ?? ''} placeholder="სტატიის სათაური" className={errors.title ? 'border-destructive' : ''} />
              {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <Label className={labelClass}>კატეგორია <InfoTooltip text="სტატიის კატეგორია — განსაზღვრავს რა სექციაში მოხვდება" /></Label>
              <Select value={categoryValue} onValueChange={(v) => setCategoryValue(v as ArticleCategory)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cameras">კამერები</SelectItem>
                  <SelectItem value="nvr">NVR / DVR</SelectItem>
                  <SelectItem value="installation">მონტაჟი</SelectItem>
                  <SelectItem value="news">სიახლეები</SelectItem>
                  <SelectItem value="guides">გაიდები</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-4 pb-0.5">
              <div>
                <Label className={labelClass}>წთ <InfoTooltip text="სავარაუდო კითხვის დრო წუთებში" /></Label>
                <Input name="readMin" type="number" min="1" max="60" defaultValue={article?.readMin ?? 5} className="w-16" />
              </div>
              <div className="flex items-center gap-1.5 pb-1">
                <Checkbox
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={(checked) => setIsPublished(checked === true)}
                />
                <Label htmlFor="isPublished" className="text-xs text-muted-foreground cursor-pointer">გამოქვეყნებული <InfoTooltip text="გამოქვეყნებული სტატია ხილულია საიტზე. მონახაზი არის მხოლოდ ადმინში" /></Label>
              </div>
            </div>
            <div className="col-span-4">
              <Label className={labelClass}>მოკლე აღწერა <InfoTooltip text="მოკლე აღწერა — გამოჩნდება სტატიების სიაში და SEO description-ში" /></Label>
              <Textarea name="excerpt" defaultValue={article?.excerpt ?? ''} rows={2} className={`resize-y ${errors.excerpt ? 'border-destructive' : ''}`} placeholder="მოკლე აღწერა..." />
              {errors.excerpt && <p className="text-destructive text-xs mt-1">{errors.excerpt}</p>}
            </div>
          </div>
        </div>

        {/* WYSIWYG Editor */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">შინაარსი <InfoTooltip text="სტატიის ძირითადი ტექსტი — შეგიძლიათ გამოიყენოთ ფორმატირება, სურათები და ბმულები" /></span>
          <div className={errors.content ? 'rounded-xl border border-destructive' : ''}>
            <RichTextEditor
              content={initialContent}
              onChange={setBodyHtml}
              onImageUpload={handleImageUpload}
            />
          </div>
          {errors.content && <p className="text-destructive text-xs mt-1">{errors.content}</p>}
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" className="mt-4" disabled={isSubmitting}>
        {isSubmitting ? 'შენახვა...' : 'სტატიის შენახვა'}
      </Button>
    </form>
  );
}
