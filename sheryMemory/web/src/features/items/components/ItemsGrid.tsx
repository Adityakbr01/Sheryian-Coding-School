import type { Item } from '../types/items.types';
import { useItems } from '../hooks/useItems';
import { ExternalLink, Trash2, Video, FileText, Link as LinkIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import appInfo from '@/constants/appInfo';

export function ItemsGrid({ filter = 'recent' }: { filter?: 'recent' | 'relevant' }) {
  const { items, isLoading, deleteItem } = useItems();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-[var(--text-secondary)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center p-16 border-2 border-dashed border-[var(--border-default)] rounded-2xl bg-[var(--bg-surface)] mt-4">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No memories yet</h3>
        <p className="text-[var(--text-secondary)]">Save your first URL to start building your {appInfo.NAME}.</p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this memory?")) {
      deleteItem(id);
    }
  };

  const displayedItems = [...items].sort((a, b) => {
    if (filter === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      // Relevance heuristic: surface old/forgotten tags over newest ones (Resurfacing mechanic)
      const aScore = ((a as any).reviewCount || 0) * 1000 + new Date(a.createdAt).getTime();
      const bScore = ((b as any).reviewCount || 0) * 1000 + new Date(b.createdAt).getTime();
      return aScore - bScore;
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {displayedItems.map((item: Item) => (
        <ItemCard key={item.id} item={item} onDelete={() => handleDelete(item.id)} />
      ))}
    </div>
  );
}

function ItemCard({ item, onDelete }: { item: Item; onDelete: () => void }) {
  const TypeIcon = () => {
    switch (item.type) {
      case 'video': return <Video className="w-3 h-3 mr-1" />;
      case 'article': return <FileText className="w-3 h-3 mr-1" />;
      case 'tweet': return <X className="w-3 h-3 mr-1" />;
      default: return <LinkIcon className="w-3 h-3 mr-1" />;
    }
  }

  return (
    <article className="group relative bg-[var(--bg-surface)] rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-[var(--border-strong)]/10 transition-all duration-300 flex flex-col min-h-[200px] border border-[var(--border-subtle)]">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2">
            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${item.status === 'processed' ? 'bg-[var(--success-bg)] text-[var(--success-text)]' :
              item.status === 'failed' ? 'bg-[var(--error-bg)] text-[var(--error-text)]' :
                'bg-[#fbbf24]/10 text-[#d97706]'
              }`}>
              {item.status}
            </span>
            <span className="flex items-center px-2.5 py-1 bg-[var(--tab-bg)] text-[var(--tab-text)] text-[10px] font-bold rounded-md uppercase tracking-wider border border-[var(--tab-border)]">
              <TypeIcon />
              {item.type}
            </span>
          </div>
          <button onClick={onDelete} className="text-[var(--text-muted)] hover:text-[var(--error-text)] transition-colors p-1 cursor-pointer z-10 hover:bg-[var(--error-bg)] rounded-lg">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <Link to={`/items/${item.id}`}>
          <h3 className="font-manrope font-bold text-lg mb-2 text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent)] transition-colors cursor-pointer">
            {item.title || item.url}
          </h3>
        </Link>

        {item.content && (
          <p className="text-[var(--text-secondary)] text-sm line-clamp-2 mb-6 opacity-90">
            {item.content}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Added to memory</span>
          </div>
          <a href={item.url} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border-subtle)]">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
