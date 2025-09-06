'use client'

import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Camera,
  Download,
  Copy as CopyIcon,
  Link as LinkIcon,
  ExternalLink,
  Share2,
} from 'lucide-react'

export interface ImageMenuProps {
  // 图片地址：可为 dataURL 或可跨域访问的绝对/相对地址
  imageUrl?: string
}

export function ImageMenu({ imageUrl }: ImageMenuProps) {
  // 下载图片
  const handleDownload = useCallback(async () => {
    if (!imageUrl) return
    const res = await fetch(imageUrl)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chart.png'
    a.click()
    URL.revokeObjectURL(url)
  }, [imageUrl])

  // 复制图片到剪贴板（受浏览器权限及类型支持限制）
  const handleCopyImage = useCallback(async () => {
    if (!imageUrl || !('ClipboardItem' in window)) return
    try {
      const blob = await fetch(imageUrl).then((r) => r.blob())
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
    } catch (e) {
      console.error('复制图片失败: ', e)
    }
  }, [imageUrl])

  // 复制链接
  const handleCopyLink = useCallback(async () => {
    if (!imageUrl) return
    try {
      await navigator.clipboard.writeText(imageUrl)
    } catch (e) {
      console.error('复制链接失败: ', e)
    }
  }, [imageUrl])

  // 新标签页打开
  const handleOpenNewTab = useCallback(() => {
    if (!imageUrl) return
    window.open(imageUrl, '_blank', 'noopener,noreferrer')
  }, [imageUrl])

  // 推特分享（X）
  const handleShareTwitter = useCallback(() => {
    if (!imageUrl) return
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent('Chart image')}`
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
  }, [imageUrl])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="图表图片菜单">
          <Camera className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
        <DropdownMenuLabel>图表快照</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          <span>下载图片</span>
          <DropdownMenuShortcut>Ctrl+Alt+S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyImage}>
          <CopyIcon className="mr-2 h-4 w-4" />
          <span>复制图片</span>
          <DropdownMenuShortcut>Ctrl+Shift+S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          <LinkIcon className="mr-2 h-4 w-4" />
          <span>复制链接</span>
          <DropdownMenuShortcut>Alt+S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOpenNewTab}>
          <ExternalLink className="mr-2 h-4 w-4" />
          <span>在新标签页中打开</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareTwitter}>
          <Share2 className="mr-2 h-4 w-4" />
          <span>推特图表图片</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}