'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import ImageResize from 'tiptap-extension-resize-image';
import { useState, useRef, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ImageGrid, ImageGridCell } from './extensions/ImageGrid';
import { YouTubeEmbed } from './extensions/YouTubeEmbed';
import type { GridLayout } from './extensions/ImageGrid';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string | null>;
}

const GRID_LAYOUTS: { layout: GridLayout; label: string; icon: React.ReactNode }[] = [
  {
    layout: '2-equal',
    label: '2 თანაბარი',
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="13" height="22" rx="2" />
        <rect x="18" y="1" width="13" height="22" rx="2" />
      </svg>
    ),
  },
  {
    layout: '3-equal',
    label: '3 თანაბარი',
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="8" height="22" rx="2" />
        <rect x="12" y="1" width="8" height="22" rx="2" />
        <rect x="23" y="1" width="8" height="22" rx="2" />
      </svg>
    ),
  },
  {
    layout: '1-2',
    label: 'პატარა + დიდი',
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="9" height="22" rx="2" />
        <rect x="13" y="1" width="18" height="22" rx="2" />
      </svg>
    ),
  },
  {
    layout: '2-1',
    label: 'დიდი + პატარა',
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="18" height="22" rx="2" />
        <rect x="22" y="1" width="9" height="22" rx="2" />
      </svg>
    ),
  },
  {
    layout: '2-1-stack',
    label: '2 მარცხნივ + 1 მარჯვნივ',
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="13" height="10" rx="2" />
        <rect x="1" y="13" width="13" height="10" rx="2" />
        <rect x="18" y="1" width="13" height="22" rx="2" />
      </svg>
    ),
  },
  {
    layout: '1-2-stack',
    label: '1 მარცხნივ + 2 მარჯვნივ',
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="13" height="22" rx="2" />
        <rect x="18" y="1" width="13" height="10" rx="2" />
        <rect x="18" y="13" width="13" height="10" rx="2" />
      </svg>
    ),
  },
];

function GridLayoutPicker({ onSelect }: { onSelect: (layout: GridLayout) => void }): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="icon-xs" className="p-1.5 rounded text-sm transition-colors cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted" title="სურათის გრიდი">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start" side="bottom">
        <p className="text-xs text-muted-foreground mb-2 px-1">აირჩიე განლაგება</p>
        <div className="grid grid-cols-3 gap-1.5">
          {GRID_LAYOUTS.map((item) => (
            <button
              key={item.layout}
              type="button"
              onClick={() => { onSelect(item.layout); setOpen(false); }}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              title={item.label}
            >
              <div className="text-muted-foreground">{item.icon}</div>
              <span className="text-[10px] text-muted-foreground leading-tight text-center">{item.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1).split('/')[0] || null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/')[2] || null;
      }
      return parsed.searchParams.get('v');
    }
    return null;
  } catch {
    return null;
  }
}

function VideoInsertButton({ onInsert }: {
  onInsert: (videoId: string) => void;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [urlValue, setUrlValue] = useState('');

  const videoId = urlValue.trim() ? extractYouTubeId(urlValue.trim()) : null;

  const handleSubmit = (): void => {
    if (!videoId) return;
    onInsert(videoId);
    setUrlValue('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="xs" className="p-1.5 rounded text-sm transition-colors cursor-pointer text-muted-foreground hover:text-[#ff0000] hover:bg-red-50 dark:hover:bg-red-950/30 gap-1" title="YouTube ვიდეო">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span className="text-xs">YouTube</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start" side="bottom">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">YouTube ბმულის ჩასმა</p>
          <input
            type="url"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); } }}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {urlValue.trim() && !videoId && (
            <p className="text-[10px] text-destructive">არასწორი YouTube ბმული</p>
          )}
          <Button
            type="button"
            variant="default"
            size="sm"
            className="w-full"
            disabled={!videoId}
            onClick={handleSubmit}
          >
            ვიდეოს დამატება
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ImageInsertButton({ onFileClick, onUrlInsert }: {
  onFileClick: () => void;
  onUrlInsert: (url: string) => void;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [urlValue, setUrlValue] = useState('');

  const handleUrlSubmit = (): void => {
    const trimmed = urlValue.trim();
    if (!trimmed) return;
    try {
      const parsed = new URL(trimmed);
      if (!['http:', 'https:'].includes(parsed.protocol)) return;
      onUrlInsert(trimmed);
      setUrlValue('');
      setOpen(false);
    } catch {
      // invalid URL — ignore
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="xs" className="p-1.5 rounded text-sm transition-colors cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted" title="სურათი">
          სურ.
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start" side="bottom">
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => { onFileClick(); setOpen(false); }}
          >
            ფაილის ატვირთვა
          </Button>

          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] text-muted-foreground uppercase">ან</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-1.5">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUrlSubmit(); } }}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button
              type="button"
              variant="default"
              size="sm"
              className="w-full"
              disabled={!urlValue.trim()}
              onClick={handleUrlSubmit}
            >
              ბმულით დამატება
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function RichTextEditor({ content, onChange, onImageUpload }: RichTextEditorProps): React.ReactElement {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      ImageResize.configure({
        inline: false,
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      YouTubeEmbed,
      ImageGrid,
      ImageGridCell,
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[300px] px-4 py-3 focus:outline-none prose-a:text-primary prose-a:underline',
      },
    },
  });

  const addImage = useCallback(async (file: File) => {
    if (!onImageUpload || !editor) return;
    const url = await onImageUpload(file);
    if (url) {
      editor.commands.insertContent(`<img src="${url}" />`);
    }
  }, [editor, onImageUpload]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) addImage(file);
    if (fileRef.current) fileRef.current.value = '';
  }, [addImage]);

  const handleLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL:', prev || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return <div className="h-[300px] bg-muted/50 rounded-lg animate-pulse" />;

  const btnClass = (active: boolean): string =>
    `p-1.5 rounded text-sm transition-colors cursor-pointer ${
      active
        ? 'bg-foreground text-background'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    }`;

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-border bg-muted/50">
        <Button type="button" variant="ghost" size="icon-xs" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="მუქი">
          <strong className="text-xs">B</strong>
        </Button>
        <Button type="button" variant="ghost" size="icon-xs" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="დახრილი">
          <em className="text-xs">I</em>
        </Button>
        <Button type="button" variant="ghost" size="icon-xs" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))} title="ხაზგასმული">
          <u className="text-xs">U</u>
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        <Button type="button" variant="ghost" size="xs" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))} title="H1">
          H1
        </Button>
        <Button type="button" variant="ghost" size="xs" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))} title="H2">
          H2
        </Button>
        <Button type="button" variant="ghost" size="xs" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive('heading', { level: 3 }))} title="H3">
          H3
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        <Button type="button" variant="ghost" size="xs" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="მარკირებული სია">
          &#8226; სია
        </Button>
        <Button type="button" variant="ghost" size="xs" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="ნუმერაციული სია">
          1. სია
        </Button>
        <Button type="button" variant="ghost" size="xs" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))} title="ციტატა">
          &ldquo; ციტატა
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Text Alignment */}
        <Button type="button" variant="ghost" size="icon-xs" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnClass(editor.isActive({ textAlign: 'left' }))} title="მარცხნივ">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
        </Button>
        <Button type="button" variant="ghost" size="icon-xs" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnClass(editor.isActive({ textAlign: 'center' }))} title="ცენტრში">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>
        </Button>
        <Button type="button" variant="ghost" size="icon-xs" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btnClass(editor.isActive({ textAlign: 'right' }))} title="მარჯვნივ">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        <Button type="button" variant="ghost" size="xs" onClick={handleLink} className={btnClass(editor.isActive('link'))} title="ბმული">
          ბმული
        </Button>
        {onImageUpload && (
          <ImageInsertButton
            onFileClick={() => fileRef.current?.click()}
            onUrlInsert={(url) => {
              if (editor) {
                editor.commands.insertContent(`<img src="${url}" />`);
              }
            }}
          />
        )}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />
        <VideoInsertButton onInsert={(videoId) => {
          if (editor) editor.commands.insertYouTube(videoId);
        }} />

        <div className="w-px h-5 bg-border mx-1" />

        {/* Image Grid Layouts */}
        <GridLayoutPicker onSelect={(layout) => editor.chain().focus().insertImageGrid(layout).run()} />
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
