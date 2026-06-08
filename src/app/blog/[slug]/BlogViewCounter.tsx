'use client'

import { useEffect, useRef } from 'react'
import { getDeviceFingerprintHash } from '@/lib/device-fingerprint'
import { recordBlogPostView } from '@/features/blog/actions'

type BlogViewCounterProps = {
  postId: string
  isPreview?: boolean
  onViewCount?: (count: number) => void
}

export function BlogViewCounter({ postId, isPreview, onViewCount }: BlogViewCounterProps) {
  const fired = useRef(false)

  useEffect(() => {
    if (isPreview || fired.current) return
    fired.current = true

    void (async () => {
      let viewerKey = ''
      try {
        viewerKey = await getDeviceFingerprintHash()
      } catch {
        viewerKey = `session-${postId}`
      }

      const result = await recordBlogPostView({ postId, viewerKey })
      if (result.success && onViewCount) onViewCount(result.viewCount)
    })()
  }, [postId, isPreview, onViewCount])

  return null
}
