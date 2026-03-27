import { useState } from 'react';
import { useItems } from '../hooks/useItems';
import { useCollections } from '../../collections/hooks/useCollections';

interface SaveItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SaveItemModal({ isOpen, onClose }: SaveItemModalProps) {
  const [url, setUrl] = useState('');
  const [collectionId, setCollectionId] = useState('');
  
  const { saveItem, isSaving, saveError } = useItems();
  const { collections } = useCollections();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    saveItem({ 
      url,
      collectionId: collectionId.trim() !== '' ? collectionId : undefined
    }, {
      onSuccess: () => {
        setUrl('');
        setCollectionId('');
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animation-fade-in">
        <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Save to Memory</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">URL / Link</label>
            <input 
              type="url" 
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article" 
              className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Collection (Optional)</label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none"
            >
              <option value="">-- No Collection --</option>
              {collections?.map((col: any) => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
          </div>
          
          {saveError && (
             <p className="text-red-400 text-sm">{saveError.message}</p>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving || !url}
              className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center min-w-[100px]"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
