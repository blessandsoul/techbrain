import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Supported grid layouts:
 * - "2-equal"   → 2 equal columns (1fr 1fr)
 * - "3-equal"   → 3 equal columns (1fr 1fr 1fr)
 * - "1-2"       → narrow left + wide right (1fr 2fr)
 * - "2-1"       → wide left + narrow right (2fr 1fr)
 * - "2-1-stack" → 2 stacked cells left + 1 tall cell right
 * - "1-2-stack" → 1 tall cell left + 2 stacked cells right
 */
export type GridLayout = '2-equal' | '3-equal' | '1-2' | '2-1' | '2-1-stack' | '1-2-stack';

/**
 * Inline grid styles per layout.
 * Stacked layouts use grid-template-areas so cells are placed by name.
 */
const LAYOUT_STYLES: Record<GridLayout, string> = {
  '2-equal':   'display:grid;grid-template-columns:1fr 1fr;gap:0.75rem',
  '3-equal':   'display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem',
  '1-2':       'display:grid;grid-template-columns:1fr 2fr;gap:0.75rem',
  '2-1':       'display:grid;grid-template-columns:2fr 1fr;gap:0.75rem',
  '2-1-stack': 'display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;grid-template-areas:"a c" "b c";gap:0.75rem',
  '1-2-stack': 'display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;grid-template-areas:"a b" "a c";gap:0.75rem',
};

/**
 * For stacked layouts, each cell needs a grid-area name.
 * Maps layout → array of grid-area values per cell index.
 */
const STACKED_CELL_AREAS: Record<string, string[]> = {
  '2-1-stack': ['a', 'b', 'c'],
  '1-2-stack': ['a', 'b', 'c'],
};

/** Number of cells each layout creates */
const LAYOUT_CELL_COUNT: Record<GridLayout, number> = {
  '2-equal': 2,
  '3-equal': 3,
  '1-2': 2,
  '2-1': 2,
  '2-1-stack': 3,
  '1-2-stack': 3,
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageGrid: {
      insertImageGrid: (layout: GridLayout) => ReturnType;
    };
  }
}

/**
 * Grid cell — each cell in the grid is an independently editable area.
 * For stacked layouts, cells have a `placement` attribute rendered as
 * inline `style="grid-area: <name>"`.
 */
export const ImageGridCell = Node.create({
  name: 'imageGridCell',
  group: '',
  content: 'block+',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      placement: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const s = element.getAttribute('style') || '';
          const match = s.match(/grid-area:\s*([^;]+)/);
          return match ? match[1].trim() : null;
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div.image-grid-cell' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const placement = node.attrs.placement as string | null;
    const cellStyle = placement ? `grid-area:${placement}` : undefined;

    return [
      'div',
      mergeAttributes(
        { class: 'image-grid-cell', ...(cellStyle ? { style: cellStyle } : {}) },
        HTMLAttributes,
      ),
      0,
    ];
  },
});

/**
 * Grid wrapper — renders as a CSS grid with a specific layout.
 * Only accepts imageGridCell nodes as children.
 *
 * Grid styles are applied inline to avoid Tailwind v4 tree-shaking CSS
 * attribute selectors. The data-layout attribute is kept for identification.
 */
export const ImageGrid = Node.create({
  name: 'imageGrid',
  group: 'block',
  content: 'imageGridCell+',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      layout: {
        default: '2-equal',
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-layout') || element.getAttribute('data-cols') || '2-equal',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div.image-grid' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const layout = (node.attrs.layout as string) || '2-equal';
    const gridStyle = LAYOUT_STYLES[layout as GridLayout] || LAYOUT_STYLES['2-equal'];

    return [
      'div',
      mergeAttributes(
        { class: 'image-grid', 'data-layout': layout, style: gridStyle },
        HTMLAttributes,
      ),
      0,
    ];
  },

  addCommands() {
    return {
      insertImageGrid:
        (layout: GridLayout) =>
        ({ commands }) => {
          const cellCount = LAYOUT_CELL_COUNT[layout] || 2;
          const cellAreas = STACKED_CELL_AREAS[layout];

          const cells = Array.from({ length: cellCount }, (_, i) => ({
            type: 'imageGridCell' as const,
            attrs: cellAreas?.[i] ? { placement: cellAreas[i] } : {},
            content: [{ type: 'paragraph' as const }],
          }));

          return commands.insertContent({
            type: this.name,
            attrs: { layout },
            content: cells,
          });
        },
    };
  },
});
