import { type FittingType, getPlaceholder, type ImageTransformOptions, sdk, STATIC_MEDIA_URL } from '@wix/image-kit'
import { forwardRef, type ImgHTMLAttributes, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useSize } from '@/hooks/use-size'
import './image.css'
import { cn } from '@/lib/utils';

const FALLBACK_IMAGE_URL = "https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png";

type ImageData = {
  id: string
  width: number
  height: number
  focalPoint?: {
    x: number
    y: number
  }
}

type WixImageDataProps = {
  fittingType?: FittingType;
  originWidth?: number;
  originHeight?: number;
  focalPointX?: number;
  focalPointY?: number;
};

const getImageData = (url: string, imageProps: WixImageDataProps): ImageData | undefined => {
  // wix:image://v1/${uri}/${filename}#originWidth=${width}&originHeight=${height}
  const wixImagePrefix = 'wix:image://v1/'
  if (url.startsWith(wixImagePrefix)) {
    const uri = url.replace(wixImagePrefix, '').split('#')[0].split('/')[0]

    const params = new URLSearchParams(url.split('#')[1] || '')
    const width = parseInt(params.get('originWidth') || '0', 10)
    const height = parseInt(params.get('originHeight') || '0', 10)

    return { id: uri, width, height }
  } else if (url.startsWith(STATIC_MEDIA_URL)) {
    const { pathname, searchParams } = new URL(url)
    const originWidth = imageProps.originWidth || parseInt(searchParams.get('originWidth') || '0', 10)
    const originHeight = imageProps.originHeight || parseInt(searchParams.get('originHeight') || '0', 10)
    if (originWidth && originHeight) {
      const uri = pathname.split('/').slice(2).join('/')
      const focalPoint =
        typeof imageProps.focalPointX === 'number' && typeof imageProps.focalPointY === 'number'
          ? {
            x: imageProps.focalPointX,
            y: imageProps.focalPointY,
          }
          : undefined

      return {
        id: uri,
        width: originWidth,
        height: originHeight,
        focalPoint,
      }
    }
  }
}

export type ImageProps = ImgHTMLAttributes<HTMLImageElement> & WixImageDataProps

type ImageWrapperProps = {
  data: ImageData
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

const ImageWrapper = forwardRef<HTMLSpanElement, ImageWrapperProps>(({ data, className, style, children }, ref) => {
  const { width, height } = data

  // Calculate aspect ratio from original dimensions to prevent zero-height issues
  // when height: auto is used. The CSS uses :where() for zero specificity,
  // allowing Tailwind classes like aspect-square to override.
  const aspectRatio = width && height ? `${width} / ${height}` : undefined

  // Default width for when no explicit dimensions are set (intrinsic sizing)
  // This ensures the wrapper has a non-zero size even without CSS width/height
  const defaultWidth = width ? `${width}px` : undefined

  return (
    <span
      ref={ref}
      className={cn('inline-block relative', className)}
      style={
        {
          '--img-aspect-ratio': aspectRatio,
          '--img-default-width': defaultWidth,
          ...style,
        } as React.CSSProperties
      }
    >
      {children}
    </span>
  )
})
ImageWrapper.displayName = 'ImageWrapper'

type WixImageProps = Omit<ImageProps, 'src'> & { data: ImageData }

const WixImage = forwardRef<HTMLImageElement, WixImageProps>(
  ({ data, fittingType = 'fill', className, style, ...props }, parentRef) => {
    const wrapperRef = useRef<HTMLSpanElement | null>(null)
    const imgRef = useRef<HTMLImageElement | null>(null)
    const size = useSize(wrapperRef)
    const { width, height, focalPoint } = data

    // Expose the img ref to the parent component
    useImperativeHandle(parentRef, () => imgRef.current as HTMLImageElement)

    const imgProps = { ...props } as ImgHTMLAttributes<HTMLImageElement>
    // Add src (and other props if needed)to the img props
    if (size) {
      const scale = fittingType === 'fit' ? sdk.getScaleToFitImageURL : sdk.getScaleToFillImageURL
      const targetHeight = size.height || height * (size.width / width) || height
      const targetWidth = size.width || width * (size.height / height) || width
      const transformOptions: ImageTransformOptions = focalPoint ? { focalPoint } : undefined
      imgProps.src = scale(data.id, data.width, data.height, targetWidth, targetHeight, transformOptions)
    } else {
      // Use a small thumbnail as placeholder until we have the actual size
      const { uri, ...placeholder } = getPlaceholder(fittingType ?? 'fit', data, { htmlTag: 'img' })
      imgProps.style = placeholder.css.img as React.CSSProperties
      imgProps.src = `${STATIC_MEDIA_URL}${uri}`
      imgProps['data-placeholder-image'] = true
    }

    return (
      <ImageWrapper ref={wrapperRef} data={data} className={className} style={style}>
        <img
          ref={imgRef}
          className={`w-full h-full inset-0 absolute ${fittingType === 'fit' ? 'object-contain' : 'object-cover'}`}
          {...imgProps}
        />
      </ImageWrapper>
    )
  }
)
WixImage.displayName = 'WixImage'

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ src, fittingType, originWidth, originHeight, focalPointX, focalPointY, ...props }, ref) => {
    const [imgSrc, setImgSrc] = useState<string | undefined>(src)
    const additionalImgProps = { fittingType, originWidth, originHeight, focalPointX, focalPointY }

    useEffect(() => {
      // If src prop changes, update the imgSrc state
      setImgSrc(prev => {
        if (prev !== src) {
          return src
        }
        return prev
      })
    }, [src])

    if (!src) {
      return <div data-empty-image ref={ref} {...props} />
    }

    const imageProps = { ...props, onError: () => setImgSrc(FALLBACK_IMAGE_URL) }
    const imageData = getImageData(imgSrc, additionalImgProps)

    if (!imageData) {
      const isErrorUrl = imgSrc === FALLBACK_IMAGE_URL
      return <img ref={ref} src={imgSrc} {...imageProps} data-error-image={isErrorUrl} />
    }

    return <WixImage ref={ref} data={imageData} {...imageProps} />
  }
)
Image.displayName = 'Image'
