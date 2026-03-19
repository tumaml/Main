'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Hash, Lock, Globe, Users, ChevronLeft, ChevronRight, MapPin, Package, Wrench, Tag } from 'lucide-react'
import { Button } from '@/components/shared/button'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type ListingType = 'product' | 'service'
type Condition = 'new' | 'used' | 'refurbished'
type Privacy = 'public' | 'friends' | 'private'
type Step = 1 | 2 | 3

const CATEGORIES = [
  'Electronics', 'Fashion', 'Beauty', 'Home & Garden',
  'Vehicles', 'Real Estate', 'Services', 'Food & Beverage', 'Other',
]

const CURRENCIES = ['JOD', 'USD', 'SAR', 'AED']

export default function CreatePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)

  // Step 1 — video
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  // Step 2 — listing details
  const [listingType, setListingType] = useState<ListingType>('product')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState<string>('JOD')
  const [category, setCategory] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState('')
  const [condition, setCondition] = useState<Condition>('new')
  const [inventory, setInventory] = useState('')
  const [location, setLocation] = useState('')

  // Step 3 — settings
  const [privacy, setPrivacy] = useState<Privacy>('public')
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

  const removeFile = () => {
    setFile(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
  }

  const addHashtag = () => {
    const tag = hashtagInput.replace(/^#/, '').trim()
    if (tag && !hashtags.includes(tag)) {
      setHashtags((prev) => [...prev, tag])
    }
    setHashtagInput('')
  }

  const removeHashtag = (tag: string) => setHashtags((prev) => prev.filter((t) => t !== tag))

  const handleHashtagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      addHashtag()
    }
  }

  const handleSubmit = async () => {
    if (!file || !title.trim()) {
      toast.error('Add a title before posting!')
      return
    }
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Step A: get upload URL
      const presignRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type, fileSize: file.size }),
      })
      const { uploadUrl, publicUrl } = await presignRes.json() as { uploadUrl?: string; publicUrl?: string }

      // Simulate upload progress
      const interval = setInterval(() => setUploadProgress((p) => Math.min(p + 10, 85)), 200)
      if (uploadUrl) {
        await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      }
      clearInterval(interval)
      setUploadProgress(90)

      // Step B: create video record with marketplace fields
      const captionWithTags = [description.trim(), ...hashtags.map((t) => `#${t}`)].filter(Boolean).join(' ')
      const videoRes = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: publicUrl ?? `https://example.com/videos/${Date.now()}.mp4`,
          caption: captionWithTags || title,
          privacy,
          listingType,
          title: title.trim(),
          price: price ? Math.round(parseFloat(price) * 100) : undefined,
          currency,
          condition: listingType === 'product' ? condition : undefined,
          location: listingType === 'service' ? location : undefined,
        }),
      })
      const videoData = await videoRes.json() as { video?: { id: string } }
      setUploadProgress(95)

      // Step C: if product listing, ensure store exists then create product + link
      if (listingType === 'product' && price && videoData.video) {
        // Ensure seller has a store
        let storeRes = await fetch('/api/stores')
        let storeData = await storeRes.json() as { store?: { id: string } | null }
        if (!storeData.store) {
          storeRes = await fetch('/api/stores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
          storeData = await storeRes.json() as { store?: { id: string } }
        }

        // Create product
        const productRes = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            price: Math.round(parseFloat(price) * 100),
            currency,
            category: category || null,
            listingType,
            condition,
            inventory: inventory ? parseInt(inventory) : undefined,
          }),
        })
        const productData = await productRes.json() as { product?: { id: string } }

        // Link product to video
        if (productData.product && videoData.video) {
          await fetch('/api/video-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId: videoData.video.id, productId: productData.product.id }),
          })
        }
      }

      setUploadProgress(100)
      toast.success('Listed! Your video is live.')
      router.push('/')
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const privacyOptions: { value: Privacy; label: string; icon: typeof Globe }[] = [
    { value: 'public', label: 'Everyone', icon: Globe },
    { value: 'friends', label: 'Friends', icon: Users },
    { value: 'private', label: 'Only me', icon: Lock },
  ]

  return (
    <div className="min-h-[100dvh] bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={() => (step > 1 ? setStep((s) => (s - 1) as Step) : router.back())} className="text-white/70 hover:text-white">
          {step > 1 ? <ChevronLeft className="w-6 h-6" /> : <X className="w-6 h-6" />}
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-white font-bold text-lg">Post Listing</h1>
          <div className="flex gap-1.5 mt-1">
            {([1, 2, 3] as Step[]).map((s) => (
              <div
                key={s}
                className={cn(
                  'w-6 h-1 rounded-full transition-colors',
                  s <= step ? 'bg-[#FE2C55]' : 'bg-white/20'
                )}
              />
            ))}
          </div>
        </div>
        <div className="w-6" />
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* ── Step 1: Video ─────────────────────────────────── */}
        {step === 1 && (
          <>
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
                    <p>Up to 60 minutes · Max 500MB</p>
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

            {file && (
              <Button
                onClick={() => setStep(2)}
                className="w-full h-12 text-base font-bold"
              >
                Next: Listing Details <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </>
        )}

        {/* ── Step 2: Listing Details ────────────────────────── */}
        {step === 2 && (
          <>
            {/* Type toggle */}
            <div className="flex gap-2">
              {(['product', 'service'] as ListingType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setListingType(t)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors',
                    listingType === t ? 'bg-[#FE2C55] text-white' : 'bg-white/10 text-white/60 hover:bg-white/15'
                  )}
                >
                  {t === 'product' ? <Package className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                  {t === 'product' ? 'Selling a Product' : 'Offering a Service'}
                </button>
              ))}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-white/70 text-sm font-medium">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={listingType === 'product' ? 'e.g. iPhone 13 Pro Max 256GB' : 'e.g. Web Design Services'}
                className="w-full bg-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/40 outline-none focus:bg-white/15 transition-colors"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-white/70 text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your listing in detail..."
                rows={3}
                maxLength={2200}
                className="w-full bg-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/40 outline-none focus:bg-white/15 transition-colors resize-none"
              />
              <p className="text-white/30 text-xs text-right">{description.length}/2200</p>
            </div>

            {/* Price + currency */}
            <div className="space-y-1.5">
              <label className="text-white/70 text-sm font-medium">Price</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/40 outline-none focus:bg-white/15 transition-colors"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-white/10 rounded-xl px-3 py-3 text-white text-sm outline-none focus:bg-white/15 transition-colors"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c} className="bg-black">{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product-specific: inventory + condition */}
            {listingType === 'product' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-white/70 text-sm font-medium">Condition</label>
                  <div className="flex gap-2">
                    {(['new', 'used', 'refurbished'] as Condition[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCondition(c)}
                        className={cn(
                          'flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-colors',
                          condition === c ? 'bg-white text-black' : 'bg-white/10 text-white/60 hover:bg-white/15'
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-white/70 text-sm font-medium">Inventory (optional)</label>
                  <input
                    type="number"
                    value={inventory}
                    onChange={(e) => setInventory(e.target.value)}
                    placeholder="How many units available?"
                    min="0"
                    className="w-full bg-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/40 outline-none focus:bg-white/15 transition-colors"
                  />
                </div>
              </>
            )}

            {/* Service-specific: location */}
            {listingType === 'service' && (
              <div className="space-y-1.5">
                <label className="text-white/70 text-sm font-medium">Location (optional)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Amman, Jordan · Online"
                    className="w-full bg-white/10 rounded-xl pl-9 pr-4 py-3 text-white text-sm placeholder:text-white/40 outline-none focus:bg-white/15 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Category */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat === category ? '' : cat)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                      category === cat ? 'bg-[#FE2C55] text-white' : 'bg-white/10 text-white/60 hover:bg-white/15'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Hashtags */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Hashtags</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={handleHashtagKeyDown}
                    placeholder="#trending"
                    className="w-full bg-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-white/40 outline-none focus:bg-white/15 transition-colors"
                  />
                </div>
                <button
                  onClick={addHashtag}
                  className="px-4 py-2.5 bg-white/10 rounded-xl text-white text-sm hover:bg-white/15 transition-colors"
                >
                  Add
                </button>
              </div>
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {hashtags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 bg-white/10 text-white/80 text-sm px-2.5 py-1 rounded-full">
                      #{tag}
                      <button onClick={() => removeHashtag(tag)} className="text-white/40 hover:text-white ml-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => setStep(3)}
              disabled={!title.trim()}
              className="w-full h-12 text-base font-bold"
            >
              Next: Settings <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </>
        )}

        {/* ── Step 3: Settings ───────────────────────────────── */}
        {step === 3 && (
          <>
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Who can see this listing</label>
              <div className="flex gap-2">
                {privacyOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setPrivacy(value)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      privacy === value ? 'bg-[#FE2C55] text-white' : 'bg-white/10 text-white/60 hover:bg-white/15'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white/5 rounded-2xl p-4 space-y-2">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">Listing summary</p>
              <p className="text-white font-semibold">{title}</p>
              {price && <p className="text-[#FE2C55] font-bold">{parseFloat(price).toFixed(2)} {currency}</p>}
              <p className="text-white/50 text-xs capitalize">{listingType} · {category || 'No category'} · {privacy}</p>
              {hashtags.length > 0 && (
                <p className="text-white/40 text-xs">{hashtags.map((t) => `#${t}`).join(' ')}</p>
              )}
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
              onClick={handleSubmit}
              disabled={!file || isUploading}
              className="w-full h-12 text-base font-bold"
            >
              {isUploading ? 'Posting...' : 'Post Listing'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
