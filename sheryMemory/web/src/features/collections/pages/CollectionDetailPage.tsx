import { useParams, useNavigate } from 'react-router-dom';
import { ItemsGrid } from '../../items/components/ItemsGrid';
import { useCollection } from '../hooks/useCollections';
import { ArrowLeft, FolderOpen } from 'lucide-react';

export default function CollectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { collection, isLoading } = useCollection(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 min-h-screen bg-[var(--bg-base)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-base)] min-h-screen font-body selection:bg-[var(--accent)]/20">
      <div className="max-w-7xl mx-auto pt-8 px-6 md:px-10 pb-12 w-full">
        {/* Navigation / Header */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent)] mb-10 font-bold transition-colors cursor-pointer text-sm tracking-wide uppercase"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        
        <div className="flex items-center gap-4 mb-10 border-b border-[var(--border-subtle)] pb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4648d4] to-[#6063ee] flex items-center justify-center text-white shadow-xl shadow-[#4648d4]/20">
             <FolderOpen className="w-8 h-8 fill-white/20" />
          </div>
          <div>
            <h1 className="text-4xl font-manrope font-extrabold text-[var(--text-primary)] tracking-tight">
              {collection?.name || 'Collection'}
            </h1>
            <p className="text-[var(--text-secondary)] mt-2 font-medium">
              Mapping nodes and resources curated within this domain.
            </p>
          </div>
        </div>

        {/* Dynamic Masonry Grid mapping explicitly to this Collection */}
        <div className="mt-8">
           <ItemsGrid filter="recent" collectionId={id} />
        </div>
      </div>
    </div>
  );
}
