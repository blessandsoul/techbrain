'use client';

import { useState } from 'react';

import { AdminGuard } from '@/features/admin/components/AdminGuard';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/features/tags/hooks/useTags';

import type { ITag } from '@/features/tags/types/tag.types';

// ── Inline Create / Edit Form ───────────────────────

interface TagFormProps {
  tag?: ITag;
  onCancel: () => void;
}

function TagForm({ tag, onCancel }: TagFormProps): React.ReactElement {
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const isPending = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const ka = (fd.get('name_ka') as string).trim();
    const ru = (fd.get('name_ru') as string).trim();
    const en = (fd.get('name_en') as string).trim();

    if (!ka) return;

    if (tag) {
      await updateMutation.mutateAsync({
        id: tag.id,
        data: { name: { ka, ru: ru || undefined, en: en || undefined } },
      });
    } else {
      await createMutation.mutateAsync({
        name: { ka, ru: ru || undefined, en: en || undefined },
      });
    }
    onCancel();
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border border-border rounded-xl bg-card">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div>
          <Label className="text-xs text-muted-foreground">KA *</Label>
          <Input name="name_ka" defaultValue={tag?.name.ka ?? ''} placeholder="ქართულად" autoFocus />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">RU</Label>
          <Input name="name_ru" defaultValue={tag?.name.ru ?? ''} placeholder="По-русски" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">EN</Label>
          <Input name="name_en" defaultValue={tag?.name.en ?? ''} placeholder="In English" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'შენახვა...' : tag ? 'განახლება' : 'შექმნა'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
          გაუქმება
        </Button>
      </div>
    </form>
  );
}

// ── Delete Confirmation ─────────────────────────────

function DeleteTagButton({ tag }: { tag: ITag }): React.ReactElement {
  const deleteMutation = useDeleteTag();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="თეგის წაშლა"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>თეგის წაშლა</AlertDialogTitle>
          <AlertDialogDescription>
            ნამდვილად გსურთ &ldquo;{tag.name.ka}&rdquo; თეგის წაშლა? ეს მოქმედება წაშლის თეგს ყველა სტატიიდან და პროექტიდან.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>გაუქმება</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteMutation.mutate(tag.id)}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            წაშლა
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Main Content ────────────────────────────────────

function TagsContent(): React.ReactElement {
  const { data: tags, isLoading } = useTags();
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<ITag | null>(null);

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="rounded-xl border border-border bg-card">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">თეგები ({tags?.length ?? 0})</h1>
        {!showForm && !editingTag && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            ახალი თეგი
          </Button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mb-6">
          <TagForm onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Edit form */}
      {editingTag && (
        <div className="mb-6">
          <TagForm tag={editingTag} onCancel={() => setEditingTag(null)} />
        </div>
      )}

      {(!tags || tags.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground mb-3">თეგები ჯერ არ არის.</p>
          {!showForm && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              შექმენით პირველი თეგი
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto bg-card">
          <Table className="min-w-[500px]">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">სახელი (KA)</TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">RU</TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">EN</TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Slug</TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="px-3 py-2">
                    <span className="text-sm text-foreground font-medium">{tag.name.ka}</span>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <span className="text-sm text-muted-foreground">{tag.name.ru || '—'}</span>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <span className="text-sm text-muted-foreground">{tag.name.en || '—'}</span>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <span className="text-xs text-muted-foreground font-mono">{tag.slug}</span>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => { setEditingTag(tag); setShowForm(false); }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="თეგის რედაქტირება"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <DeleteTagButton tag={tag} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────

export default function AdminTagsPage(): React.ReactElement {
  return (
    <AdminGuard>
      <AdminHeader />
      <TagsContent />
    </AdminGuard>
  );
}
