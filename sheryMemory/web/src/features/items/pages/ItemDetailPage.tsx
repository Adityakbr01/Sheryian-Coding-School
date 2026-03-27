import appInfo from '@/constants/appInfo';
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  BookOpen,
  Calendar,
  ChevronRight,
  Edit3,
  History,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Moon,
  Network,
  Search,
  Share2,
  Sparkles,
  Sun,
  Trash2,
  Wand2
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../../../hooks/useSocket';
import { useAuth } from '../../auth/hooks/useAuth';
import { HighlightableContent } from '../components/HighlightableContent';
import { useDeleteItem, useItem } from '../hooks/useItems';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

// ── Related Items Sidebar Component ──────────────────────────────
interface RelatedItem {
  id: string;
  title: string;
  url: string;
  type: string;
  summary: string | null;
  similarity: number;
  tags: string[];
}

function ConnectedItemsList({ itemId }: { itemId: string }) {
  const { data: related = [], isLoading } = useQuery<RelatedItem[]>({
    queryKey: ['related-items', itemId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:5000/api/graph/related/${itemId}?limit=3`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token') || ''}`,
        },
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!itemId,
    staleTime: 60 * 1000,
  });

  const getStrengthLabel = (score: number) => {
    if (score >= 0.85) return { text: 'Strong', color: '#10b981' };
    if (score >= 0.75) return { text: 'Medium', color: '#f59e0b' };
    return { text: 'Weak', color: '#8b5cf6' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />
      </div>
    );
  }

  if (related.length === 0) {
    return (
      <div className="text-center py-6">
        <Network className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">No connections yet</p>
        <p className="text-[10px] text-[var(--text-muted)] mt-1">Connections appear when items share semantic similarity</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {related.map((item) => {
          const strength = getStrengthLabel(item.similarity);
          return (
            <Link
              key={item.id}
              to={`/items/${item.id}`}
              className="group block"
            >
              <div className="flex items-center gap-2 mb-1">
                {item.tags.length > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: strength.color }}>
                    {item.tags[0]}
                  </span>
                )}
                <span
                  className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${strength.color}20`, color: strength.color }}
                >
                  {Math.round(item.similarity * 100)}% match
                </span>
              </div>
              <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-tight">
                {item.title || 'Untitled'}
              </h4>
              {item.summary && (
                <p className="text-[11px] text-[var(--text-secondary)] mt-1.5 line-clamp-2 italic font-medium">
                  "{item.summary.slice(0, 120)}..."
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}

// ── Main Component ──────────────────────────────────────────────
export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  useSocket(); // Tracks backend real-time updates directly on this independent route

  const { item, isLoading, error } = useItem(id || '');
  const deleteMutation = useDeleteItem();

  const { scrollY } = useScroll();
  const sidebarY = useTransform(scrollY, [0, 800], [0, -40]);
  const smoothSidebarY = useSpring(sidebarY, { damping: 20, stiffness: 100 });
  const contentY = useTransform(scrollY, [0, 500], [0, 20]);
  const contentFade = useTransform(scrollY, [0, 400], [1, 0.8]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-[var(--error-text)] mb-2">Failed to load memory</h2>
        <p className="text-[var(--text-secondary)] mb-6">The item you are looking for does not exist or you lack access.</p>
        <Link to="/dashboard" className="px-6 py-2 bg-[var(--accent)] text-[var(--text-on-accent)] rounded-full font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('Delete this memory definitively?')) {
      deleteMutation.mutate(item.id, {
        onSuccess: () => navigate('/dashboard')
      });
    }
  }

  return (
    <div className="bg-[var(--bg-base)] font-body text-[var(--text-primary)] min-h-screen selection:bg-[var(--accent)]/20">

      {/* add a back button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)}
        className="px-4 py-1.5 bg-[var(--accent)] text-[var(--text-on-accent)] rounded-full fixed top-6 left-6 z-[60] shadow-xl shadow-[var(--accent)]/20 group transition-transform flex items-center gap-2 cursor-pointer font-bold text-sm"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Go Back
      </motion.button>

      <motion.main
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="pt-24 pb-20 max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12"
      >
        {/* Focused Reading Area */}
        <motion.article
          style={{ y: contentY }}
          className="flex flex-col items-center"
        >
          <div className="max-w-2xl w-full">

            {/* Header & Breadcrumbs */}
            <header className="mb-12">
              <nav className="flex items-center gap-2 mb-6 text-[var(--text-secondary)] uppercase tracking-widest text-[10px] font-semibold">
                <Link to="/dashboard">COLLECTIONS</Link>
                <ChevronRight className="w-3 h-3" />
                <Link to={`/collections/${item.collection?.id}`}>{item.collection?.name || 'UNCATEGORIZED'}</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[var(--accent)]">ITEM</span>
              </nav>
              <HighlightableContent
                content={item.title || item.url}
                itemId={item.id}
                section="title"
                className="font-manrope text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.1] mb-6"
              />
              <div className="flex flex-wrap items-center gap-4">
                <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] transition-colors px-3 py-1.5 rounded-full text-[var(--text-primary)] text-xs font-semibold border border-[var(--border-subtle)]">
                  <LinkIcon className="w-4 h-4" />
                  Visit Source
                </a>
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs font-medium">
                  <Calendar className="w-4 h-4" />
                  Saved {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            </header>

            {/* Main Content Canvas */}
            <div className="space-y-8 font-body text-[var(--text-secondary)] leading-relaxed text-lg">
              <HighlightableContent
                content={item.content || "This item has not been summarized yet. A background worker will process the main content shortly."}
                itemId={item.id}
                section="content"
                className="text-[var(--text-primary)] font-medium text-xl leading-snug"
              />

              {/* Highlighted Text with Annotation */}
              {item.highlights && item.highlights.length > 0 && (
                <div className="relative group mt-8">
                  <blockquote className="bg-[var(--accent)]/10 border-l-4 border-[var(--accent)] pl-6 py-4 rounded-r-xl transition-all duration-300">
                    <span className="text-[var(--text-primary)] font-medium italic">
                      "{item.highlights[0].text}"
                    </span>
                  </blockquote>

                  <div className="absolute -right-56 top-0 w-48 hidden xl:block opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-[var(--bg-surface)] p-4 rounded-xl shadow-lg shadow-[var(--border-subtle)]/50 border border-[var(--border-subtle)]">
                      <p className="text-[10px] uppercase font-bold text-[var(--accent)] mb-1">AI INSIGHT</p>
                      <p className="text-xs text-[var(--text-secondary)] leading-snug">{item.highlights[0].annotation}</p>
                    </div>
                  </div>
                </div>
              )}

              {item.aiInsight && (
                <p className="mt-8 text-[var(--text-secondary)] italic">
                  {item.aiInsight}
                </p>
              )}

              {item.imageUrl && (
                <figure className="my-12">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl mb-3 border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-center justify-center">
                    <img src={item.imageUrl} alt={item.title || "Cover graphic"} className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all" />
                  </div>
                  <figcaption className="text-center text-xs text-[var(--text-muted)] font-medium">Cover Graphic</figcaption>
                </figure>
              )}

              {item.summary && (
                <div className="bg-[var(--bg-elevated)] p-8 rounded-2xl relative overflow-hidden border border-[var(--border-subtle)]">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--accent)]/20 rounded-full blur-[60px]"></div>

                  <h3 className="font-manrope font-bold text-xl mb-6 flex items-center gap-2 text-[var(--text-primary)]">
                    <BookOpen className="w-6 h-6 text-[var(--accent)]" />
                    Executive Summary
                  </h3>
                  <HighlightableContent
                    content={item.summary}
                    itemId={item.id}
                    section="summary"
                    className="text-base text-[var(--text-primary)] font-medium leading-relaxed"
                  />
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <footer className="mt-16 pt-8 border-t border-[var(--border-subtle)] flex justify-between items-center">
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[var(--text-on-accent)] rounded-full shadow-lg shadow-[var(--accent)]/20 hover:scale-[1.02] active:scale-95 transition-all">
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm font-bold tracking-wide">Annotate</span>
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-full hover:bg-[var(--border-subtle)] transition-colors border border-[var(--border-subtle)] font-bold text-sm">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
              <button
                onClick={handleDelete}
                className="p-3 text-[var(--text-muted)] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded-full transition-colors cursor-pointer"
                title="Delete memory"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </footer>

          </div>
        </motion.article>

        {/* Sidebar: Connections & Metadata */}
        <motion.aside
          style={{ y: smoothSidebarY }}
          className="space-y-8 lg:sticky lg:top-12 h-fit"
        >

          {/* Connection Graph Card — Real Semantic Connections */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[var(--bg-surface)] p-6 rounded-3xl shadow-xl shadow-[var(--border-strong)]/5 border border-[var(--border-subtle)]"
          >
            <h3 className="font-manrope text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-6 flex justify-between items-center">
              Connected to this
              <Network className="w-4 h-4" />
            </h3>

            <ConnectedItemsList itemId={item.id} />
          </motion.section>

          {/* Metadata Bento */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="font-manrope text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--text-secondary)] pl-2">Properties</h3>
            <div className="grid grid-cols-1 gap-3">

              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl flex items-center gap-4 border border-[var(--border-subtle)]">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-[var(--accent)] shadow-sm border border-[var(--border-subtle)]">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Smart Tags</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {(item as any).tags && (item as any).tags.length > 0 ? (
                      (item as any).tags.map((t: any) => (
                        <span key={t.tag.name} className="px-2 py-0.5 bg-[var(--bg-surface)] text-[var(--text-primary)] rounded border border-[var(--border-subtle)] text-[9px] font-bold uppercase">
                          {t.tag.name}
                        </span>
                      ))
                    ) : (
                      <>
                        <span className="px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded border border-[var(--border-subtle)] text-[9px] font-bold uppercase">AI</span>
                        <span className="px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded border border-[var(--border-subtle)] text-[9px] font-bold uppercase">{item.type || 'Web'}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl flex items-center gap-4 border border-[var(--border-subtle)]">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-[var(--accent)] shadow-sm border border-[var(--border-subtle)]">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Last Viewed</p>
                  <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">Just now</p>
                </div>
              </div>

              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl flex items-center gap-4 border border-[var(--border-subtle)]">
                <div className="w-10 h-10 rounded-full bg-[var(--success-bg)] flex items-center justify-center text-[var(--success-text)] shadow-sm">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Origin Status</p>
                  <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5 leading-snug">
                    <span className={`block uppercase ${item.status === 'processed' ? 'text-[var(--success-text)]' :
                      item.status === 'failed' ? 'text-[var(--error-text)]' :
                        'text-[#d97706]'
                      }`}>{item.status}</span>
                  </p>
                </div>
              </div>

            </div>
          </motion.section>

          {/* Minimal Map/Location Insight */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[var(--bg-surface)] p-5 rounded-3xl relative overflow-hidden group cursor-pointer border border-[var(--border-subtle)]"
          >
            <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-[var(--accent)]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold mb-1.5 text-[var(--text-muted)] uppercase tracking-widest">Thought Origin</p>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-[var(--accent)]" />
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  {(() => {
                    try {
                      return new URL(item.url).hostname.replace(/^www\./, '');
                    } catch {
                      return 'Unknown Origin';
                    }
                  })()}
                </p>
              </div>
              <div className="h-24 rounded-2xl overflow-hidden grayscale opacity-60 mix-blend-multiply group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 bg-[var(--bg-elevated)] flex items-center justify-center">
                <img
                  src={`https://www.google.com/s2/favicons?sz=128&domain=${item.url}`}
                  alt="Source Origin"
                  className="w-16 h-16 object-contain drop-shadow-lg"
                />
              </div>
            </div>
          </motion.section>

        </motion.aside>
      </motion.main>

      {/* SideNavBar Trigger (Subtle) */}
      <div className="fixed left-6 bottom-6 z-50">
        <button onClick={() => navigate('/dashboard')} className="w-14 h-14 bg-[var(--bg-surface)] shadow-2xl shadow-[var(--border-strong)]/20 border border-[var(--border-subtle)] rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:scale-110 transition-transform cursor-pointer">
          <Network className="w-6 h-6" />
        </button>
      </div>

    </div>
  );
}
