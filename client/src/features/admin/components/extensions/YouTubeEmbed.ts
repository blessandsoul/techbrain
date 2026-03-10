import { Node, mergeAttributes } from '@tiptap/core';

export interface YouTubeEmbedOptions {
  allowFullscreen: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    youtubeEmbed: {
      insertYouTube: (videoId: string) => ReturnType;
    };
  }
}

export const YouTubeEmbed = Node.create<YouTubeEmbedOptions>({
  name: 'youtubeEmbed',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      allowFullscreen: true,
    };
  },

  addAttributes() {
    return {
      videoId: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-youtube-video]',
        getAttrs(node) {
          const el = node as HTMLElement;
          const iframe = el.querySelector('iframe');
          if (!iframe) return false;
          const src = iframe.getAttribute('src') ?? '';
          const match = src.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
          if (!match) return false;
          return { videoId: match[1] };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const videoId = node.attrs.videoId as string;
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-youtube-video': '',
        style: 'position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;border-radius:12px;margin:1rem 0',
      }),
      [
        'iframe',
        {
          src: embedUrl,
          style: 'position:absolute;top:0;left:0;width:100%;height:100%;border:0',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowfullscreen: this.options.allowFullscreen ? '' : undefined,
        },
      ],
    ];
  },

  addCommands() {
    return {
      insertYouTube:
        (videoId: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { videoId },
          });
        },
    };
  },
});
