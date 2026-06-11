'use client';
import { Carousel, Flowbite, useTheme } from 'flowbite-react';
import { productsV3 } from '@wix/stores';
import { PLACEHOLDER_IMAGE } from '@app/constants';
import { WixMediaImage } from '@app/components/Image/WixMediaImage';
export function ImageGalleryClient({
  items,
}: {
  items: productsV3.ProductMedia[];
}) {
  const { theme } = useTheme();
  const images = items.length ? items : [{ image: PLACEHOLDER_IMAGE }];
  return (
    <div className="h-56 sm:h-96 max-h-96 max-w-xl mx-auto">
      <Flowbite
        theme={{
          theme: {
            carousel: {
              scrollContainer: {
                ...theme.carousel.scrollContainer,
                base: theme.carousel.scrollContainer.base + ' rounded-none',
              },
            },
          },
        }}
      >
        <Carousel slide={false}>
          {images.map((media, index) => (
            <WixMediaImage
              key={index}
              media={media.image || ''}
              alt={media.altText ?? ''}
              width={600}
              height={400}
            />
          ))}
        </Carousel>
      </Flowbite>
    </div>
  );
}
