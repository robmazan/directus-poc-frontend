/** A brick_texts item */
export interface BrickText {
  id: string;
  content: string; // HTML rich text
}

/** A brick_images item */
export interface BrickImage {
  id: string;
  image: string; // UUID referencing directus_files
}

/** A resolved M2A brick entry from the stack_bricks junction */
export interface StackBrick {
  id: string;
  sort: number | null;
  collection: 'brick_texts' | 'brick_images';
  item: BrickText | BrickImage;
}

/** A stacks item with resolved bricks */
export interface Stack {
  id: string;
  name: string;
  sort: number | null;
  bricks: StackBrick[];
}

/** A rows item with resolved stacks */
export interface Row {
  id: string;
  name: string | null;
  sort: number | null;
  stacks: Stack[];
}

/** A pages item for the index listing (no nested data) */
export interface Page {
  id: string;
  title: string;
  slug: string;
}

/** A pages item with full nested rows/stacks/bricks for rendering */
export interface PageWithRows extends Page {
  rows: Row[];
}
