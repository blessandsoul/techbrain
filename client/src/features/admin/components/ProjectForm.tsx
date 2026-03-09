'use client';

import { useState, useRef } from 'react';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { InfoTooltip } from './InfoTooltip';
import { Input } from '@/components/ui/input';
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
import { ROUTES } from '@/lib/constants/routes';

import type { IProject } from '@/features/projects/types/projects.types';

const projectSchema = z.object({
  title_ka: z.string().min(1, 'ქართული სათაური სავალდებულოა'),
  title_ru: z.string().optional(),
  title_en: z.string().optional(),
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

  // Image state
  const [imagePreview, setImagePreview] = useState(
    project?.image ? getProjectImageUrl(project.image) : '',
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const labelClass = 'text-xs text-muted-foreground';
  const isPending = submitting || updateMutation.isPending;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('ფაილი ძალიან დიდია (მაქსიმუმ 10MB)');
      return;
    }
    // Revoke previous blob URL to prevent memory leak
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const raw = {
      title_ka: (formData.get('title_ka') as string) || '',
      title_ru: (formData.get('title_ru') as string) || '',
      title_en: (formData.get('title_en') as string) || '',
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

    const payload = {
      title: {
        ka: result.data.title_ka,
        ru: result.data.title_ru || '',
        en: result.data.title_en || '',
      },
      location: {
        ka: result.data.location_ka,
        ru: result.data.location_ru || '',
        en: result.data.location_en || '',
      },
      type: typeValue as IProject['type'],
      cameras: result.data.cameras,
      year: result.data.year,
      isActive,
    };

    if (isEdit) {
      try {
        // Upload new image if file selected
        if (imageFile) {
          await projectsService.uploadProjectImage(project.id, imageFile);
        }

        // Build update payload, include image: null if removed
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
        const created = await projectsService.createProject(payload);

        // Upload image after creation
        if (imageFile) {
          await projectsService.uploadProjectImage(created.id, imageFile);
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
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
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

        {/* Type + Cameras + Year */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">დეტალები <InfoTooltip text="პროექტის ტექნიკური დეტალები" /></span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className={labelClass}>ტიპი <InfoTooltip text="პროექტის ტიპი: კომერციული, საცხოვრებელი, სავაჭრო ან საოფისე" /></Label>
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
              <Label className={labelClass}>კამერები <InfoTooltip text="დამონტაჟებული კამერების რაოდენობა" /></Label>
              <Input name="cameras" type="number" min="0" defaultValue={project?.cameras ?? 0} className={errors.cameras ? 'border-destructive' : ''} />
              {errors.cameras && <p className="text-xs text-destructive mt-1">{errors.cameras}</p>}
            </div>
            <div>
              <Label className={labelClass}>წელი <InfoTooltip text="მონტაჟის / დასრულების წელი" /></Label>
              <Input name="year" type="text" defaultValue={project?.year ?? new Date().getFullYear().toString()} className={errors.year ? 'border-destructive' : ''} />
              {errors.year && <p className="text-xs text-destructive mt-1">{errors.year}</p>}
            </div>
          </div>
        </div>

        {/* Image Upload + Active */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">სურათი <InfoTooltip text="პროექტის მთავარი სურათი — JPG, PNG ან WebP ფორმატში" /></span>
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
            <div className="flex items-end pb-1">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  aria-label="აქტიური"
                />
                <Label className="text-xs text-muted-foreground cursor-pointer">აქტიური <InfoTooltip text="გამორთვისას პროექტი არ გამოჩნდება საიტზე" /></Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" className="mt-4" disabled={isPending}>
        {isPending ? 'იტვირთება...' : isEdit ? 'ცვლილებების შენახვა' : 'პროექტის შექმნა'}
      </Button>
    </form>
  );
}
