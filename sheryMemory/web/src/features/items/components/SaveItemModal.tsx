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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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
      <div className="animation-fade-in w-full max-w-md rounded-2xl border border-(--border-subtle) bg-(--bg-surface) shadow-2xl">
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

          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-(--text-secondary)">
              Collection (Optional)
            </label>
            <div
              className="w-full cursor-pointer flex items-center justify-between rounded-lg border border-(--border-subtle) bg-(--bg-base) px-4 py-3 text-(--text-primary) transition-colors hover:border-(--accent)"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {collectionId
                  ? collections?.find((c: any) => c.id === collectionId)?.name || '-- No Collection --'
                  : '-- No Collection --'}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
            </div>
            
            {isDropdownOpen && (
              <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-(--border-subtle) bg-(--bg-elevated) p-1 shadow-2xl animation-fade-in">
                <div
                  className={`cursor-pointer rounded-lg px-4 py-2.5 text-sm text-(--text-primary) transition-colors hover:bg-(--bg-surface) ${collectionId === '' ? 'bg-(--accent)/10 text-(--accent) font-bold' : ''}`}
                  onClick={() => { setCollectionId(''); setIsDropdownOpen(false) }}
                >
                  -- No Collection --
                </div>
                {collections?.map((col: any) => (
                  <div
                    key={col.id}
                    className={`cursor-pointer rounded-lg px-4 py-2.5 text-sm text-(--text-primary) transition-colors hover:bg-(--bg-surface) ${collectionId === col.id ? 'bg-(--accent)/10 text-(--accent) font-bold' : ''}`}
                    onClick={() => { setCollectionId(col.id); setIsDropdownOpen(false) }}
                  >
                    {col.name}
                  </div>
                ))}
              </div>
            )}
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
