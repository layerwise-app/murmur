// Images added with `pnpm add-images`. This file is rewritten by that
// script; refer to an image by its name, like `{ image: 'player-screen' }`.

export type ImageAsset = {
  /** Largest version. */
  src: string;
  /** Every width, for `srcset`. GIFs have one entry. */
  srcSet: string;
  width: number;
  height: number;
  /** A tiny blurred version shown while the image loads. */
  blurDataURL: string;
};

// <generated:images>
export const images: Record<string, ImageAsset> = {};
// </generated:images>
