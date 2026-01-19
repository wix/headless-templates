import useResizeObserver from "@react-hook/resize-observer"
import { useLayoutEffect, useState } from "react"
import '@/components/ui/image.css'

type Size = {
  width: number
  height: number
}

export const useSize = (ref: React.RefObject<HTMLElement>, threshold: number = 50): Size | null => {

  const [size, setSize] = useState<Size | null>(null)

  const updateSize = (newSize: Size): void => {
    if (!size) {
      setSize(newSize)
      return
    }

    const widthDiff = Math.abs(newSize.width - size.width)
    const heightDiff = Math.abs(newSize.height - size.height)

    if (widthDiff > threshold || heightDiff > threshold) {
      setSize(newSize)
    }
  }

  useLayoutEffect(() => {
      if (ref.current) {
          const { width, height } = ref.current.getBoundingClientRect()
          updateSize({ width, height })
      }
  }, [ref.current, size])

  useResizeObserver(ref, (entry) => {
      const { width, height } = entry.contentRect
      if (size.width !== width || size.height !== height) {
        updateSize({ width, height })
      }
  })

  return size
}
