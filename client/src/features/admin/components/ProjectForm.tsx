'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { RichTextEditor } from './RichTextEditor';
import { InfoTooltip } from './InfoTooltip';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateProject, projectKeys, getProjectImageUrl } from '@/features/projects/hooks/useProjects';
import { projectsService } from '@/features/projects/services/projects.service';
import { getErrorMessage } from '@/lib/utils/error';
import { stripServerBaseUrl, resolveContentImageUrls } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';

import type { IProject } from '@/features/projects/types/projects.types';

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

const projectSchema = z.object({
  title_ka: z.string().min(1, 'ქართული სათაური სავალდებულოა'),
  title_ru: z.string().optional(),
  title_en: z.string().optional(),
  excerpt_ka: z.string().optional(),
  excerpt_ru: z.string().optional(),
  excerpt_en: z.string().optional(),
  location_ka: z.string().min(1, 'ქართული მდებარეობა სავალდებულოა'),
  location_ru: z.string().optional(),
  location_en: z.string().optional(),
  cameras: z.coerce.number().int().min(0, 'კამერების რაოდენობა არ შეიძლება იყოს უარყოფითი'),
  year: z.string().min(1, 'წელი სავალდებულოა').regex(/^\d{4}$/, 'წელი უნდა იყოს 4 ციფრი'),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof projectSchema>, string>>;

interface ProjectFormProps {
  project?: IProject;
}

export function ProjectForm({ project }: ProjectFormProps): React.ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const updateMutation = useUpdateProject();
  const isEdit = !!project;

  const [isActive, setIsActive] = useState(project?.isActive ?? true);
  const [typeValue, setTypeValue] = useState<string>(project?.type ?? 'commercial');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [bodyHtml, setBodyHtml] = useState('');

  // Cover image state
  const [imagePreview, setImagePreview] = useState(
    project?.image ? getProjectImageUrl(project.image, project.updatedAt) : '',
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingImagesRef = useRef<Map<string, File>>(new Map());

  const labelClass = 'text-xs text-muted-foreground';
  const isPending = submitting || updateMutation.isPending;

  const initialContent = resolveContentImageUrls(project?.content ?? '');

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('ფაილი ძალიან დიდია (მაქსიმუმ 10MB)');
      return;
    }
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageRemoved(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleRemoveImage(): void {
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview('');
    setImageFile(null);
    setImageRemoved(true);
  }

  const handleImageUpload = useCallback(async (file: File): Promise<string | null> => {
    if (project?.id) {
      try {
        const result = await projectsService.uploadContentImage(project.id, file);
        return getProjectImageUrl(result.url);
      } catch {
        return null;
      }
    }
    const blobUrl = URL.createObjectURL(file);
    pendingImagesRef.current.set(blobUrl, file);
    return blobUrl;
  }, [project?.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const raw = {
      title_ka: (formData.get('title_ka') as string) || '',
      title_ru: (formData.get('title_ru') as string) || '',
      title_en: (formData.get('title_en') as string) || '',
      excerpt_ka: (formData.get('excerpt_ka') as string) || '',
      excerpt_ru: (formData.get('excerpt_ru') as string) || '',
      excerpt_en: (formData.get('excerpt_en') as string) || '',
      location_ka: (formData.get('location_ka') as string) || '',
      location_ru: (formData.get('location_ru') as string) || '',
      location_en: (formData.get('location_en') as string) || '',
      cameras: formData.get('cameras') as string,
      year: (formData.get('year') as string) || '',
    };

    const result = projectSchema.safeParse(raw);

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    const content = stripServerBaseUrl(bodyHtml || initialContent);

    const payload = {
      title: {
        ka: result.data.title_ka,
        ru: result.data.title_ru || '',
        en: result.data.title_en || '',
      },
      excerpt: {
        ka: result.data.excerpt_ka || '',
        ru: result.data.excerpt_ru || '',
        en: result.data.excerpt_en || '',
      },
      location: {
        ka: result.data.location_ka,
        ru: result.data.location_ru || '',
        en: result.data.location_en || '',
      },
      type: typeValue as IProject['type'],
      cameras: result.data.cameras,
      year: result.data.year,
      content,
      isActive,
    };

    if (isEdit) {
      try {
        if (imageFile) {
          await projectsService.uploadProjectImage(project.id, imageFile);
        }

        const updatePayload = imageRemoved && !imageFile
          ? { ...payload, image: null as string | null }
          : payload;

        await updateMutation.mutateAsync({ id: project.id, data: updatePayload });
        router.push(ROUTES.ADMIN.PROJECTS);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    } else {
      setSubmitting(true);
      try {
        const slug = toUrlSlug(result.data.title_ka) || `project-${Date.now()}`;

        const created = await projectsService.createProject({
          ...payload,
          slug,
        });

        // Upload cover image after creation
        if (imageFile) {
          await projectsService.uploadProjectImage(created.id, imageFile);
        }

        // Upload pending content images and replace blob URLs
        if (pendingImagesRef.current.size > 0) {
          let updatedContent = content;
          for (const [blobUrl, file] of pendingImagesRef.current) {
            const uploadResult = await projectsService.uploadContentImage(created.id, file);
            updatedContent = updatedContent.replaceAll(blobUrl, uploadResult.url);
          }
          await projectsService.updateProject(created.id, { content: updatedContent });
          pendingImagesRef.current.clear();
        }

        toast.success('პროექტი შეიქმნა');
        queryClient.invalidateQueries({ queryKey: projectKeys.all });
        router.push(ROUTES.ADMIN.PROJECTS);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setSubmitting(false);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {/* Cover Image */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-1">გარეკანი <InfoTooltip text="პროექტის მთავარი სურათი — JPG, PNG ან WebP ფორმატში" /></span>
          <p className="text-xs text-muted-foreground mb-3">რეკომენდებული: 1200×800px. მინ. 960×540px.</p>
          <div className="flex items-center gap-3">
            {imagePreview && (
              <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-muted">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-black/80 transition-colors"
                  aria-label="სურათის წაშლა"
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
              disabled={isPending}
            >
              ატვირთვა
            </Button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />
          </div>
        </div>

        {/* Title (3 languages) */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">სათაური <InfoTooltip text="პროექტის სახელი სამ ენაზე. ქართული სავალდებულოა" /></span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className={labelClass}>KA</Label>
              <Input name="title_ka" defaultValue={project?.title.ka} placeholder="ქართულად" className={errors.title_ka ? 'border-destructive' : ''} />
              {errors.title_ka && <p className="text-xs text-destructive mt-1">{errors.title_ka}</p>}
            </div>
            <div>
              <Label className={labelClass}>RU</Label>
              <Input name="title_ru" defaultValue={project?.title.ru} placeholder="По-русски" />
            </div>
            <div>
              <Label className={labelClass}>EN</Label>
              <Input name="title_en" defaultValue={project?.title.en} placeholder="In English" />
            </div>
          </div>
        </div>

        {/* Excerpt (3 languages) */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">მოკლე აღწერა <InfoTooltip text="პროექტის მოკლე აღწერა — გამოჩნდება პროექტების სიაში" /></span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className={labelClass}>KA</Label>
              <Textarea name="excerpt_ka" defaultValue={project?.excerpt.ka} placeholder="ქართულად" rows={2} className="resize-y" />
            </div>
            <div>
              <Label className={labelClass}>RU</Label>
              <Textarea name="excerpt_ru" defaultValue={project?.excerpt.ru} placeholder="По-русски" rows={2} className="resize-y" />
            </div>
            <div>
              <Label className={labelClass}>EN</Label>
              <Textarea name="excerpt_en" defaultValue={project?.excerpt.en} placeholder="In English" rows={2} className="resize-y" />
            </div>
          </div>
        </div>

        {/* Location (3 languages) */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">მდებარეობა <InfoTooltip text="პროექტის მისამართი / ადგილმდებარეობა სამ ენაზე" /></span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className={labelClass}>KA</Label>
              <Input name="location_ka" defaultValue={project?.location.ka} placeholder="ქართულად" className={errors.location_ka ? 'border-destructive' : ''} />
              {errors.location_ka && <p className="text-xs text-destructive mt-1">{errors.location_ka}</p>}
            </div>
            <div>
              <Label className={labelClass}>RU</Label>
              <Input name="location_ru" defaultValue={project?.location.ru} placeholder="По-русски" />
            </div>
            <div>
              <Label className={labelClass}>EN</Label>
              <Input name="location_en" defaultValue={project?.location.en} placeholder="In English" />
            </div>
          </div>
        </div>

        {/* Type + Cameras + Year + Active */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">დეტალები <InfoTooltip text="პროექტის ტექნიკური დეტალები" /></span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className={labelClass}>ტიპი</Label>
              <Select value={typeValue} onValueChange={setTypeValue}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">კომერციული</SelectItem>
                  <SelectItem value="residential">საცხოვრებელი</SelectItem>
                  <SelectItem value="retail">სავაჭრო</SelectItem>
                  <SelectItem value="office">საოფისე</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>კამერები</Label>
              <Input name="cameras" type="number" min="0" defaultValue={project?.cameras ?? 0} className={errors.cameras ? 'border-destructive' : ''} />
              {errors.cameras && <p className="text-xs text-destructive mt-1">{errors.cameras}</p>}
            </div>
            <div>
              <Label className={labelClass}>წელი</Label>
              <Input name="year" type="text" defaultValue={project?.year ?? new Date().getFullYear().toString()} className={errors.year ? 'border-destructive' : ''} />
              {errors.year && <p className="text-xs text-destructive mt-1">{errors.year}</p>}
            </div>
            <div className="flex items-end pb-1">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  aria-label="აქტიური"
                />
                <Label className="text-xs text-muted-foreground cursor-pointer">აქტიური</Label>
              </div>
            </div>
          </div>
        </div>

        {/* WYSIWYG Editor */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">შინაარსი <InfoTooltip text="პროექტის დეტალური აღწერა — შეგიძლიათ გამოიყენოთ ფორმატირება, სურათები და ბმულები" /></span>
          <RichTextEditor
            content={initialContent}
            onChange={setBodyHtml}
            onImageUpload={handleImageUpload}
          />
        </div>
      </div>

      <Button type="submit" className="mt-4" disabled={isPending}>
        {isPending ? 'იტვირთება...' : isEdit ? 'ცვლილებების შენახვა' : 'პროექტის შექმნა'}
      </Button>
    </form>
  );
}
