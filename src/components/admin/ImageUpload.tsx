'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'

interface ImageUploadProps {
  label: string
  value?: string
  onChange: (url: string) => void
  placeholder?: string
}

export function ImageUpload({ label, value, onChange, placeholder }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.success) {
        onChange(result.url)
      } else {
        setError(result.error || 'アップロードに失敗しました')
      }
    } catch (err) {
      setError('アップロードに失敗しました')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    onChange('')
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload area */}
      {!value ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="space-y-3">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <Button
                type="button"
                onClick={handleButtonClick}
                disabled={isUploading}
                className="mb-2"
              >
                {isUploading ? 'アップロード中...' : '画像を選択'}
              </Button>
              <p className="text-sm text-gray-500">
                {placeholder || 'JPG, PNG, GIF (最大5MB)'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Preview */
        <div className="space-y-3">
          <div className="relative inline-block">
            <Image
              src={value}
              alt="アップロード画像"
              width={200}
              height={120}
              className="rounded-lg object-cover border"
            />
            <Button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 bg-red-600 hover:bg-red-700 text-white text-xs"
            >
              ×
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              type="button"
              onClick={handleButtonClick}
              disabled={isUploading}
              variant="outline"
              size="sm"
            >
              {isUploading ? 'アップロード中...' : '画像を変更'}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            画像URL: {value}
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}