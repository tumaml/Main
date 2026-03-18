'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Hash, Lock, Globe, Users } from 'lucide-react'
import { Button } from '@/components/shared/button'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function CreatePage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.webm'] },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024,
  })

  const handleUpload = async () => {
    if (!file || !caption.trim()) {
      toast.error('Add a caption before posting!')
      return
    }
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const presignRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      })
      const { publicUrl } = await presignRes.json() as { uploadUrl?: string; publicUrl?: string }

      const interval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 10, 90))
      }, 200)

      // PUT to uploadUrl when Cloudflare R2 is configured
      // await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      clearInterval(interval)
      setUploadProgress(100)

      await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: publicUrl ?? `https://example.com/videos/${Date.now()}.mp4`,
          caption,
          privacy,
        }),
      })

      toast.success('Video posted!')
      router.push('/')
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
  }

  const privacyOptions = [
    { value: 'public', label: 'Everyone', icon: Globe },
    { value: 'friends', label: 'Friends', icon: Users },
    { value: 'private', label: 'Only me', icon: Lock },
  ]

  return (
    <div className="min-h-[100dvh] bg-black">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={() => router.back()} className="text-white/70 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-white font-bold text-lg">Post</h1>
        <div className="w-6" />
      </div>

      <div className="px-4 py-6 space-y-6">
        {!file ? (
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors',
              isDragActive ? 'border-[#FE2C55] bg-[#FE2C55]/10' : 'border-white/20 hover:border-white/40'
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">Select video to upload</p>
                <p className="text-white/50 text-sm mt-1">Or drag and drop here</p>
              </div>
              <div className="text-white/40 text-xs space-y-1">
                <p>MP4, MOV, WebM supported</p>
                <p>Up to 60 minutes · Max 4GB</p>
              </div>
              <Button variant="outline" size="sm">Select file</Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="aspect-[9/16] max-h-[40vh] bg-black rounded-2xl overflow-hidden flex items-center justify-center mx-auto w-fit">
              <video src={preview!} className="h-full max-h-[40vh] rounded-2xl object-cover" controls />
            </div>
            <button
              onClick={removeFile}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-white/70 text-sm font-medium">Caption</label>
          <div className="relative">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe your video, add hashtags..."
              rows={3}
              maxLength={2200}
              className="w-full bg-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/40 outline-none focus:bg-white/15 transition-colors resize-none"
            />
            <div className="flex items-center justify-between mt-1">
              <button className="flex items-center gap-1 text-white/50 text-xs hover:text-white/80">
                <Hash className="w-3.5 h-3.5" />
                Add hashtag
              </button>
              <span className="text-white/30 text-xs">{caption.length}/2200</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-white/70 text-sm font-medium">Who can watch this video</label>
          <div className="flex gap-2">
            {privacyOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setPrivacy(value as 'public' | 'friends' | 'private')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  privacy === value
                    ? 'bg-[#FE2C55] text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/15'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/60">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FE2C55] rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full h-12 text-base font-bold"
        >
          {isUploading ? 'Posting...' : 'Post Video'}
        </Button>
      </div>
    </div>
  )
}
