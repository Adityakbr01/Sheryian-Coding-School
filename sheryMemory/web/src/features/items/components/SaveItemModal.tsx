import { useState } from 'react'
import { useItems } from '../hooks/useItems'
import { useCollections } from '../../collections/hooks/useCollections'

interface SaveItemModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SaveItemModal({ isOpen, onClose }: SaveItemModalProps) {
  const [inputType, setInputType] = useState<'url' | 'file'>('url')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [collectionId, setCollectionId] = useState('')

  const { saveItem, saveFileItem, isSaving, saveError } = useItems()
  const { collections } = useCollections()

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const resolveSubmit = () => {
      setUrl('')
      setFile(null)
      setCollectionId('')
      onClose()
    }

    const payloadCollectionId = collectionId.trim() !== '' ? collectionId : undefined

    if (inputType === 'url') {
      if (!url) return
      saveItem(
        { url, collectionId: payloadCollectionId },
        { onSuccess: resolveSubmit },
      )
    } else {
      if (!file) return
      saveFileItem(
        { file, collectionId: payloadCollectionId },
        { onSuccess: resolveSubmit },
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animation-fade-in w-full max-w-md overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-surface) shadow-2xl">
        <div className="flex items-center justify-between border-b border-(--border-subtle) p-6">
          <h2 className="text-xl font-bold text-(--text-primary)">
            Save to Memory
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-(--text-muted) transition-colors hover:text-(--text-primary)"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <div className="flex gap-4 mb-2">
            <button
              type="button"
              onClick={() => setInputType('url')}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${inputType === 'url' ? 'bg-(--accent) text-(--text-on-accent)' : 'bg-(--bg-elevated) text-(--text-secondary)'}`}
            >
              Link / URL
            </button>
            <button
              type="button"
              onClick={() => setInputType('file')}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${inputType === 'file' ? 'bg-(--accent) text-(--text-on-accent)' : 'bg-(--bg-elevated) text-(--text-secondary)'}`}
            >
              File Upload
            </button>
          </div>

          {inputType === 'url' ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-(--text-secondary)">
                URL / Link
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-4 py-3 text-(--text-primary) placeholder-(--text-muted) transition-colors focus:border-(--accent) focus:outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-(--text-secondary)">
                File (PDF, Image, etc.)
              </label>
              <input
                type="file"
                required
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-4 py-3 text-(--text-primary) file:mr-4 file:rounded file:border-0 file:bg-(--accent)/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-(--accent) hover:file:bg-(--accent)/20 focus:border-(--accent) focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-(--text-secondary)">
              Collection (Optional)
            </label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full appearance-none rounded-lg border border-(--border-subtle) bg-(--bg-base) px-4 py-3 text-(--text-primary) transition-colors focus:border-(--accent) focus:outline-none"
            >
              <option value="">-- No Collection --</option>
              {collections?.map((col: any) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          {saveError && (
            <p className="text-sm text-red-400">{(saveError as Error).message}</p>
          )}

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-(--border-subtle) px-5 py-2.5 font-medium text-(--text-secondary) transition-colors hover:bg-(--bg-elevated)"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || (inputType === 'url' ? !url : !file)}
              className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg bg-(--accent) px-5 py-2.5 font-medium text-(--text-on-accent) transition-colors hover:bg-(--accent-hover) disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
