import React from 'react';
import { MediaGallery as MediaGalleryPrimitive } from '@wix/media/components';
import { cn } from '@/lib/utils';

export const Root: React.FC<
  React.ComponentProps<typeof MediaGalleryPrimitive.Root>
> = props => <MediaGalleryPrimitive.Root {...props} />;

export const Viewport: React.FC<
  React.ComponentProps<typeof MediaGalleryPrimitive.Viewport>
> = ({ className, ...props }) => (
  <MediaGalleryPrimitive.Viewport
    className={cn(
      'w-full h-full flex items-center justify-center [&>img]:max-w-full [&>img]:max-h-full [&>img]:object-contain',
      className
    )}
    emptyState={
      <div className="w-full h-full flex items-center justify-center">
        <svg
          className="w-24 h-24 text-content-subtle"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    }
    {...props}
  />
);

export const Indicator: React.FC<
  React.ComponentProps<typeof MediaGalleryPrimitive.Indicator>
> = ({ className, ...props }) => (
  <MediaGalleryPrimitive.Indicator
    className={cn(
      'absolute bottom-4 right-4 bg-surface-tooltip text-nav px-3 py-1 rounded-full text-sm',
      className
    )}
    {...props}
  />
);

export const Previous: React.FC<
  React.ComponentProps<typeof MediaGalleryPrimitive.Previous>
> = ({ className, ...props }) => (
  <MediaGalleryPrimitive.Previous
    className={cn(
      'absolute left-4 top-1/2 -translate-y-1/2 btn-nav p-2 rounded-full transition-all',
      className
    )}
    {...props}
  >
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 19l-7-7 7-7"
      />
    </svg>
  </MediaGalleryPrimitive.Previous>
);

export const Next: React.FC<
  React.ComponentProps<typeof MediaGalleryPrimitive.Next>
> = ({ className, ...props }) => (
  <MediaGalleryPrimitive.Next
    className={cn(
      'absolute right-4 top-1/2 -translate-y-1/2 btn-nav p-2 rounded-full transition-all',
      className
    )}
    {...props}
  >
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 5l7 7-7 7"
      />
    </svg>
  </MediaGalleryPrimitive.Next>
);

export const Thumbnails: React.FC<
  React.ComponentProps<typeof MediaGalleryPrimitive.Thumbnails>
> = ({ children, ...props }) => (
  <MediaGalleryPrimitive.Thumbnails {...props}>
    {children}
  </MediaGalleryPrimitive.Thumbnails>
);

export const ThumbnailRepeater: React.FC<
  React.ComponentProps<typeof MediaGalleryPrimitive.ThumbnailRepeater>
> = ({ children, ...props }) => (
  <div className="grid grid-cols-4 gap-4">
    <MediaGalleryPrimitive.ThumbnailRepeater {...props}>
      {children}
    </MediaGalleryPrimitive.ThumbnailRepeater>
  </div>
);

export const ThumbnailItem: React.FC<
  React.ComponentProps<typeof MediaGalleryPrimitive.ThumbnailItem>
> = ({ className, ...props }) => (
  <MediaGalleryPrimitive.ThumbnailItem
    className={cn(
      'aspect-square bg-surface-primary rounded-lg border cursor-pointer transition-all data-[active=true]:border-brand-medium data-[active=true]:ring-2 data-[active=true]:ring-brand-light data-[active=false]:border-brand-subtle data-[active=false]:hover:border-brand-light',
      className
    )}
    emptyState={
      <div className="w-full h-full flex items-center justify-center">
        <svg
          className="w-6 h-6 text-content-subtle"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    }
    {...props}
  />
);
