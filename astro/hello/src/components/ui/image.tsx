import { type FittingType, getPlaceholder, type ImageTransformOptions, sdk, STATIC_MEDIA_URL } from '@wix/image-kit'
import { forwardRef, type ImgHTMLAttributes, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useSize } from '@/hooks/use-size'
import './image.css'

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

const getImageData = (url: string, imageProps: ImageProps): ImageData | undefined => {
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
      const focalPoint = typeof imageProps.focalPointX === 'number' && typeof imageProps.focalPointY === 'number' ? {
        x: imageProps.focalPointX,
        y: imageProps.focalPointY
      } : undefined

      return {
        id: uri,
        width: originWidth,
        height: originHeight,
        focalPoint
      }
    }
  }
}

export type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fittingType?: FittingType
  originWidth?: number
  originHeight?: number
  focalPointX?: number
  focalPointY?: number
}

type WixImageProps = Omit<ImageProps, 'src'> & { data: ImageData }
const WixImage = forwardRef<HTMLImageElement, WixImageProps>(
  ({ data, fittingType = 'fill', ...imgProps }, parentRef) => {
    const ref = useRef<HTMLImageElement | null>(null)
    const size = useSize(ref)
    const { width, height, focalPoint } = data

    // Expose the ref to the parent component
    useImperativeHandle(parentRef, () => ref.current as HTMLImageElement)

    if (!size) {
      const { uri, ...placeholder } = getPlaceholder(fittingType ?? 'fit', data, { htmlTag: 'img' })
      // @ts-expect-error placeholder.css.img properties are not typed correctly.
      return <img ref={ref} src={`${STATIC_MEDIA_URL}${uri}`} style={placeholder.css.img} {...placeholder.attr}  {...imgProps} />
    }

    const scale = fittingType === 'fit' ? sdk.getScaleToFitImageURL : sdk.getScaleToFillImageURL
    const targetHeight = size.height || height * (size.width / width) || height
    const targetWidth = size.width || width * (size.height / height) || width
    const transformOptions: ImageTransformOptions = focalPoint ? { focalPoint } : undefined
    const src = scale(data.id, data.width, data.height, targetWidth, targetHeight, transformOptions)

    return <img ref={ref} {...imgProps} src={src} />
  }
)
WixImage.displayName = 'WixImage'

export const Image = forwardRef<HTMLImageElement, ImageProps>(({ src, ...props }, ref) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src)

  useEffect(() => {
    // If src prop changes, update the imgSrc state
    setImgSrc((prev) => {
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
  const imageData = getImageData(imgSrc, imageProps)

  if (!imageData) {
    return <img data-error-image={imgSrc === FALLBACK_IMAGE_URL} ref={ref} src={imgSrc} {...imageProps} />
  }

  return <WixImage ref={ref} data={imageData} {...imageProps} />
})
Image.displayName = 'Image'
