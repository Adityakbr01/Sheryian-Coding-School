import { useCollections } from '../hooks/useCollections';
import { 
  FolderPlus, Brain, MoreVertical, Layout, Rocket, 
  GripVertical, ScrollText, Wallet, FileText, ImageIcon, 
  Check, LayoutGrid, List, Edit2, Trash2 
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CollectionsGrid() {
  const { collections, isLoading, createCollection, updateCollection, deleteCollection } = useCollections();
  const navigate = useNavigate();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleCreate = () => {
    const name = window.prompt("Enter new collection name:");
    if (name && name.trim().length > 0) createCollection(name);
  };

  const gradients = [
    'bg-gradient-to-br from-[#4648d4] to-[#6063ee]',
    'bg-gradient-to-br from-[#8127cf] to-[#9c48ea]',
    'bg-gradient-to-br from-[#505f76] to-[#767586]',
    'bg-emerald-500',
    'bg-[#f59e0b]'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  return (
    <div className="pt-8 px-2 md:px-8 pb-12 w-full max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Knowledge Library</span>
          <h2 className="text-4xl font-manrope font-extrabold text-[var(--text-primary)] tracking-tight">Collections</h2>
        </div>
        <div className="flex items-center gap-3 bg-[var(--bg-elevated)] p-1.5 rounded-2xl border border-[var(--border-subtle)]">
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              viewMode === 'grid' ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <LayoutGrid className="w-5 h-5 fill-current" />
            Grid
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              viewMode === 'list' ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <List className="w-5 h-5" />
            List
          </button>
        </div>
      </div>

      {/* Dynamic Layout Wrapper */}
      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
        
        {/* Action Card: New Collection */}
        <div 
          onClick={handleCreate}
          className={`group relative bg-[var(--bg-surface)] border-2 border-dashed border-[var(--border-subtle)] rounded-2xl flex items-center cursor-pointer hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 transition-all ${
            viewMode === 'grid' ? 'p-8 flex-col justify-center text-center h-[280px]' : 'p-6 flex-row gap-6 h-auto'
          }`}
        >
          <div className="w-16 h-16 shrink-0 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-secondary)] group-hover:scale-110 group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
            <FolderPlus className="w-8 h-8" />
          </div>
          <div>
            <h3 className={`font-manrope font-bold text-lg text-[var(--text-primary)] ${viewMode === 'list' ? 'text-left' : ''}`}>New Collection</h3>
            <p className={`text-sm text-[var(--text-secondary)] mt-1 ${viewMode === 'list' ? 'text-left' : ''}`}>Create a container for your ideas</p>
          </div>
        </div>

        {/* Dynamic Collections Cards */}
        {collections.map((col: any, i: number) => {
           const bgClass = gradients[i % gradients.length];
           return (
             <div 
               key={col.id} 
               onClick={() => navigate(`/collections/${col.id}`)}
               className={`group relative bg-[var(--bg-surface)]/70 backdrop-blur-xl rounded-2xl shadow-[0_4px_20px_rgba(70,72,212,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all border border-[var(--border-subtle)] cursor-pointer flex ${
                 viewMode === 'grid' ? 'p-6 flex-col justify-between h-[280px]' : 'p-4 md:p-6 flex-row items-center gap-6 h-auto'
               }`}
             >
              <div className={`flex justify-between relative ${viewMode === 'grid' ? 'items-start mb-6 w-full' : 'items-center shrink-0'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${bgClass}`}>
                    <FolderPlus className="w-6 h-6 fill-[white]/20" />
                  </div>
                  
                  {/* Replaces naked button with active toggle menu */}
                  {viewMode === 'grid' && (
                  <div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === col.id ? null : col.id);
                      }}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] p-1.5 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {activeMenuId === col.id && (
                      <div className="absolute top-10 right-0 w-40 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-2xl rounded-xl p-1 z-20 py-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            const newName = window.prompt("Edit Collection name:", col.name);
                            if (newName && newName.trim().length > 0) updateCollection({ id: col.id, name: newName });
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--accent)] rounded-lg transition-colors text-left"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            if(window.confirm(`Delete collection "${col.name}"? This action cannot be undone.`)) deleteCollection(col.id);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-[var(--error-text)] hover:bg-[#ffdad6] rounded-lg transition-colors text-left mt-1"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                  )}
              </div>
              
              <div className={viewMode === 'list' ? 'flex-1 min-w-0' : 'flex-1'}>
                <h3 className={`font-manrope font-extrabold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors ${viewMode === 'grid' ? 'text-xl' : 'text-lg truncate'}`}>{col.name}</h3>
                <p className={`text-sm text-[var(--text-secondary)] mt-1 ${viewMode === 'grid' ? 'line-clamp-2 mt-2 leading-relaxed' : 'truncate'}`}>
                  Curated thoughts and structured links regarding {col.name.toLowerCase()}.
                </p>
              </div>

              <div className={`flex items-center justify-between ${viewMode === 'grid' ? 'mt-6 w-full' : 'gap-6 shrink-0 ml-auto'}`}>
                {viewMode === 'grid' && (
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-[var(--bg-surface)] bg-slate-100 overflow-hidden">
                      <img alt="User" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0jz_yEyjS9IyOE9i2iS3k6s5cdlzAd1sH9k6CJg-zW7KzIMtZADwLFt8jXfix6bdncByTQt6SlfSXgBHx78frZzXv0efxWuI0ErHVSGpYtAwCi2zktyrH-ijBUvOZMgJ5yE4i_xuF6bYPTH6KwxHWsyskOMWdoSUcGGM2ktMjqs5rgDPP4M800yi6TA0VXkvWnn0_kmKdY4-X60exlSBvJASwJbSji4uF2nZS5ZRhrDkHSCc_TK4y_aNss2Fs0fSa0oudawJBHX4" />
                    </div>
                  </div>
                )}
                <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-full uppercase tracking-wider">{col._count?.items || 0} Items</span>

                {viewMode === 'list' && (
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === col.id ? null : col.id);
                      }}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] p-2 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {activeMenuId === col.id && (
                      <div className="absolute top-10 right-0 w-40 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-2xl rounded-xl p-1 z-20 py-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            const newName = window.prompt("Edit Collection name:", col.name);
                            if (newName && newName.trim().length > 0) updateCollection({ id: col.id, name: newName });
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--accent)] rounded-lg transition-colors text-left"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            if(window.confirm(`Delete collection "${col.name}"? This action cannot be undone.`)) deleteCollection(col.id);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-[var(--error-text)] hover:bg-[#ffdad6] rounded-lg transition-colors text-left mt-1"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
             </div>
           );
        })}

        {/* Empty State / Future Template Card */}
        {collections.length < 2 && (
          <div className="group bg-[var(--bg-elevated)] rounded-2xl p-6 border-2 border-transparent hover:border-[var(--accent)]/20 flex flex-col justify-between h-[280px] transition-all">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-secondary)] shadow-sm border border-[var(--border-subtle)]">
                  <Rocket className="w-6 h-6" />
                </div>
                <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <h3 className="font-manrope font-extrabold text-xl text-[var(--text-primary)]">Future Projects</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded uppercase">Personal</span>
                <span className="text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-subtle)] uppercase">Upcoming</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 italic">
                <GripVertical className="w-4 h-4" /> Drop thoughts here
              </div>
              <span className="text-xs font-bold text-[var(--text-muted)] bg-[var(--bg-surface)] px-3 py-1 rounded-full border border-[var(--border-subtle)] uppercase tracking-wider">0 Items</span>
            </div>
          </div>
        )}

      </div>

      {/* Drag and Drop Guide Overlay */}
      <div className="mt-16 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col md:flex-row items-center gap-10">
        <div className="w-full md:w-1/3 aspect-video rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center relative overflow-hidden border border-[var(--border-subtle)]">
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-[#4648d4] to-[#6063ee]"></div>
          <div className="relative z-10 flex gap-4">
            <div className="w-12 h-14 bg-[var(--bg-surface)] rounded-lg shadow-xl border border-[var(--border-subtle)] animate-pulse flex items-center justify-center">
              <FileText className="text-[var(--accent)] w-6 h-6" />
            </div>
            <div className="w-12 h-14 bg-[var(--bg-surface)]/60 rounded-lg shadow-sm border border-[var(--border-subtle)] rotate-6 flex items-center justify-center">
              <ImageIcon className="text-[var(--text-muted)] w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <h4 className="text-2xl font-manrope font-bold text-[var(--text-primary)]">Effortless Organization</h4>
          <p className="text-[var(--text-secondary)] leading-relaxed max-w-xl">
            Drag any note, bookmark, or media directly onto a collection card to categorize it instantly. Use the 'New Thought' button to capture ideas before they escape, then move them here when you're ready to curate.
          </p>
          <div className="flex gap-6 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-[var(--text-secondary)]">Smart Auto-Tagging</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-[var(--text-secondary)]">Batch Sorting</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
