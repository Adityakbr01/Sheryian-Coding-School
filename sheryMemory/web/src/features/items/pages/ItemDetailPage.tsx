import { useQuery } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Calendar,
  ChevronRight,
  Edit3,
  History,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Network,
  Share2,
  Trash2,
  Wand2
} from 'lucide-react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useTheme } from 'next-themes'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSocket } from '../../../hooks/useSocket'
import { useAuth } from '../../auth/hooks/useAuth'
import { HighlightableContent } from '../components/HighlightableContent'
import { MarkdownHighlightableContent } from '../components/MarkdownHighlightableContent'
import { useDeleteItem, useItem } from '../hooks/useItems'
import { API_URL } from '@/constants/api'

// ── Related Items Sidebar Component ──────────────────────────────
interface RelatedItem {
  id: string
  title: string
  url: string
  type: string
  summary: string | null
  similarity: number
  tags: string[]
}

// Extracts a YouTube video ID from common URL patterns (watch, youtu.be, embed)
const getYouTubeId = (videoUrl: string): string | null => {
  try {
    const u = new URL(videoUrl)
    const vParam = u.searchParams.get('v')
    if (vParam) return vParam

    if (u.hostname.includes('youtu.be')) {
      const path = u.pathname.replace(/^\//, '')
      if (path) return path.split('/')[0]
    }

    const pathParts = u.pathname.split('/')
    const embedIndex = pathParts.findIndex((p) => p === 'embed')
    if (embedIndex >= 0 && pathParts[embedIndex + 1]) return pathParts[embedIndex + 1]
  } catch (e) {
    // ignore malformed URL
  }

  const regexMatch = videoUrl.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)
  return regexMatch ? regexMatch[1] : null
}

function ConnectedItemsList({ itemId }: { itemId: string }) {
  const { data: related = [], isLoading } = useQuery<RelatedItem[]>({
    queryKey: ['related-items', itemId],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/graph/related/${itemId}?limit=3`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token') || ''}`,
          },
        },
      )
      if (!res.ok) return []
      const json = await res.json()
      return json.data || []
    },
    enabled: !!itemId,
    staleTime: 60 * 1000,
  })

  const getStrengthLabel = (score: number) => {
    if (score >= 0.85) return { text: 'Strong', color: '#10b981' }
    if (score >= 0.75) return { text: 'Medium', color: '#f59e0b' }
    return { text: 'Weak', color: '#8b5cf6' }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-(--accent)" />
      </div>
    )
  }

  if (related.length === 0) {
    return (
      <div className="py-6 text-center">
        <Network className="mx-auto mb-3 h-8 w-8 text-(--text-muted) opacity-40" />
        <p className="text-xs font-bold tracking-wider text-(--text-muted) uppercase">
          No connections yet
        </p>
        <p className="mt-1 text-[10px] text-(--text-muted)">
          Connections appear when items share semantic similarity
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-5">
        {related.map((item) => {
          const strength = getStrengthLabel(item.similarity)
          return (
            <Link
              key={item.id}
              to={`/items/${item.id}`}
              className="group block"
            >
              <div className="mb-1 flex items-center gap-2">
                {item.tags.length > 0 && (
                  <span
                    className="text-[10px] font-bold tracking-wider uppercase"
                    style={{ color: strength.color }}
                  >
                    {item.tags[0]}
                  </span>
                )}
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase"
                  style={{
                    backgroundColor: `${strength.color}20`,
                    color: strength.color,
                  }}
                >
                  {Math.round(item.similarity * 100)}% match
                </span>
              </div>
              <h4 className="text-sm leading-tight font-bold text-(--text-primary) transition-colors group-hover:text-(--accent)">
                {item.title || 'Untitled'}
              </h4>
              {item.summary && (
                <p className="mt-1.5 line-clamp-2 text-[11px] font-medium text-(--text-secondary) italic">
                  "{item.summary.slice(0, 120)}..."
                </p>
              )}
            </Link>
          )
        })}
      </div>
    </>
  )
}

// ── Main Component ──────────────────────────────────────────────
export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  useAuth()
  useTheme()
  useSocket() // Tracks backend real-time updates directly on this independent route

  const { item, isLoading, error } = useItem(id || '')
  const deleteMutation = useDeleteItem()
  const youtubeId = item?.type === 'video' ? getYouTubeId(item.url || '') : null

  const { scrollY } = useScroll()
  const sidebarY = useTransform(scrollY, [0, 800], [0, -40])
  const smoothSidebarY = useSpring(sidebarY, { damping: 20, stiffness: 100 })
  const contentY = useTransform(scrollY, [0, 500], [0, 20])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg-base)">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-(--accent)"></div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-(--bg-base) p-6 text-center">
        <h2 className="mb-2 text-2xl font-bold text-(--error-text)">
          Failed to load memory
        </h2>
        <p className="mb-6 text-(--text-secondary)">
          The item you are looking for does not exist or you lack access.
        </p>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 rounded-full bg-(--accent) px-6 py-2 font-bold text-(--text-on-accent) shadow-md transition-transform"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Link>
      </div>
    )
  }

  const handleDelete = () => {
    if (window.confirm('Delete this memory definitively?')) {
      deleteMutation.mutate(item.id, {
        onSuccess: () => navigate('/dashboard'),
      })
    }
  }

  return (
    <div className="font-body min-h-screen bg-(--bg-base) text-(--text-primary) selection:bg-(--accent)/20">
      {/* add a back button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)}
        className="group fixed top-6 left-6 z-60 flex cursor-pointer items-center gap-2 rounded-full bg-(--accent) px-4 py-1.5 text-sm font-bold text-(--text-on-accent) shadow-(--accent)/20 shadow-xl transition-transform"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />{' '}
        Go Back
      </motion.button>

      <motion.main
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-6 pt-24 pb-20 lg:grid-cols-[1fr_320px]"
      >
        {/* Focused Reading Area */}
        <motion.article
          style={{ y: contentY }}
          className="flex flex-col items-center"
        >
          <div className="w-full max-w-2xl">
            {/* Header & Breadcrumbs */}
            <header className="mb-12">
              <nav className="mb-6 flex items-center gap-2 text-[10px] font-semibold tracking-widest text-(--text-secondary) uppercase">
                <Link to="/dashboard">COLLECTIONS</Link>
                <ChevronRight className="h-3 w-3" />
                <Link to={`/collections/${item.collection?.id}`}>
                  {item.collection?.name || 'UNCATEGORIZED'}
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-(--accent)">ITEM</span>
              </nav>
              <HighlightableContent
                content={item.title || item.url}
                itemId={item.id}
                section="title"
                className="font-manrope mb-6 text-4xl leading-[1.1] font-extrabold tracking-tight text-(--text-primary) md:text-5xl"
              />
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full border border-(--border-subtle) bg-(--bg-elevated) px-3 py-1.5 text-xs font-semibold text-(--text-primary) transition-colors hover:bg-(--border-subtle)"
                >
                  <LinkIcon className="h-4 w-4" />
                  Visit Source
                </a>
                <div className="flex items-center gap-2 text-xs font-medium text-(--text-secondary)">
                  <Calendar className="h-4 w-4" />
                  Saved {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            </header>

            {/* Main Content Canvas */}
            <div className="font-body space-y-8 text-lg leading-relaxed text-(--text-secondary)">

              {item.type === 'pdf' && (
                <div className="mb-8 w-full overflow-hidden rounded-2xl border border-(--border-subtle) shadow-xl bg-(--bg-elevated)">
                  <div className="border-b border-(--border-subtle) bg-(--bg-surface) p-3 flex justify-between items-center">
                    <span className="text-sm font-bold text-(--text-primary)">PDF Document</span>
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-(--accent) hover:underline">Open in new tab</a>
                  </div>
                  <iframe src={item.url} className="h-[700px] w-full" title={item.title || 'PDF View'} />
                </div>
              )}

              {item.type === 'video' && youtubeId && (
                <div className="mb-8 w-full overflow-hidden rounded-2xl border border-(--border-subtle) shadow-xl aspect-video bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title={item.title || 'Video Player'}
                  />
                  <div className="flex items-center justify-between bg-black/50 px-4 py-2 text-[11px] text-white">
                    <span className="truncate">{item.title || 'YouTube Video'}</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-(--accent) underline-offset-2 hover:underline"
                    >
                      Open on YouTube
                    </a>
                  </div>
                </div>
              )}

              {item.type === 'image' && (
                <div className="mb-8 flex w-full items-center justify-center overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-elevated) shadow-xl p-4">
                  <img src={item.url} alt={item.title || 'Uploaded Image'} className="max-w-full rounded-lg object-contain" />
                </div>
              )}

              {item.type === 'tweet' && (
                <div className="mb-8 w-full rounded-2xl border border-[#1DA1F2]/20 bg-[#1DA1F2]/5 p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="font-bold flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1DA1F2] text-xl text-white">𝕏</div>
                    <div>
                      <h4 className="font-bold text-(--text-primary)">Twitter Post</h4>
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#1DA1F2] hover:underline">View original post</a>
                    </div>
                  </div>
                  <p className="text-xl text-(--text-primary) font-medium">{item.content}</p>
                </div>
              )}

              {(item.type === 'article' || !['pdf', 'video', 'image', 'tweet'].includes(item.type)) && (
                <MarkdownHighlightableContent
                  content={
                    item.content ||
                    'This item has not been summarized yet. A background worker will process the main content shortly.'
                  }
                  itemId={item.id}
                  section="content"
                />
              )}

              {/* Highlighted Text with Annotation */}
              {item.highlights && item.highlights.length > 0 && (
                <div className="group relative mt-8">
                  <blockquote className="rounded-r-xl border-l-4 border-(--accent) bg-(--accent)/10 py-4 pl-6 transition-all duration-300">
                    <span className="font-medium text-(--text-primary) italic">
                      "{item.highlights[0].text}"
                    </span>
                  </blockquote>

                  <div className="absolute top-0 -right-56 hidden w-48 opacity-0 transition-opacity group-hover:opacity-100 xl:block">
                    <div className="rounded-xl border border-(--border-subtle) bg-(--bg-surface) p-4 shadow-(--border-subtle)/50 shadow-lg">
                      <p className="mb-1 text-[10px] font-bold text-(--accent) uppercase">
                        AI INSIGHT
                      </p>
                      <p className="text-xs leading-snug text-(--text-secondary)">
                        {item.highlights[0].annotation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {item.aiInsight && (
                <p className="mt-8 text-(--text-secondary) italic">
                  {item.aiInsight}
                </p>
              )}

              {item.imageUrl && item.type !== 'video' && (
                <figure className="my-12">
                  <div className="mb-3 flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-elevated) shadow-xl">
                    <img
                      src={item.imageUrl}
                      alt={item.title || 'Cover graphic'}
                      className="h-full w-full object-cover opacity-80 mix-blend-luminosity transition-all hover:mix-blend-normal"
                    />
                  </div>
                  <figcaption className="text-center text-xs font-medium text-(--text-muted)">
                    Cover Graphic
                  </figcaption>
                </figure>
              )}

              {item.summary && (
                <div className="relative overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-elevated) p-8">
                  <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-(--accent)/20 blur-[60px]"></div>

                  <h3 className="font-manrope mb-6 flex items-center gap-2 text-xl font-bold text-(--text-primary)">
                    <BookOpen className="h-6 w-6 text-(--accent)" />
                    Executive Summary
                  </h3>
                  <MarkdownHighlightableContent
                    content={item.summary}
                    itemId={item.id}
                    section="summary"
                  />
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <footer className="mt-16 flex items-center justify-between border-t border-(--border-subtle) pt-8">
              <div className="flex gap-4">
                <button className="flex items-center gap-2 rounded-full bg-(--accent) px-5 py-2.5 text-(--text-on-accent) shadow-(--accent)/20 shadow-lg transition-all hover:scale-[1.02] active:scale-95">
                  <Edit3 className="h-4 w-4" />
                  <span className="text-sm font-bold tracking-wide">
                    Annotate
                  </span>
                </button>
                <button className="flex items-center gap-2 rounded-full border border-(--border-subtle) bg-(--bg-elevated) px-5 py-2.5 text-sm font-bold text-(--text-primary) transition-colors hover:bg-(--border-subtle)">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>
              <button
                onClick={handleDelete}
                className="cursor-pointer rounded-full p-3 text-(--text-muted) transition-colors hover:bg-[#ffdad6] hover:text-[#ba1a1a]"
                title="Delete memory"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </footer>
          </div>
        </motion.article>

        {/* Sidebar: Connections & Metadata */}
        <motion.aside
          style={{ y: smoothSidebarY }}
          className="h-fit space-y-8 lg:sticky lg:top-12"
        >
          {/* Connection Graph Card — Real Semantic Connections */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-(--border-subtle) bg-(--bg-surface) p-6 shadow-(--border-strong)/5 shadow-xl"
          >
            <h3 className="font-manrope mb-6 flex items-center justify-between text-[11px] font-extrabold tracking-[0.2em] text-(--text-secondary) uppercase">
              Connected to this
              <Network className="h-4 w-4" />
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
            <h3 className="font-manrope pl-2 text-[11px] font-extrabold tracking-[0.2em] text-(--text-secondary) uppercase">
              Properties
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-4 rounded-2xl border border-(--border-subtle) bg-(--bg-elevated) p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-(--border-subtle) bg-(--bg-surface) text-(--accent) shadow-sm">
                  <Wand2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-(--text-muted) uppercase">
                    Smart Tags
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(item as any).tags && (item as any).tags.length > 0 ? (
                      (item as any).tags.map((t: any) => (
                        <span
                          key={t.tag.name}
                          className="rounded border border-(--border-subtle) bg-(--bg-surface) px-2 py-0.5 text-[9px] font-bold text-(--text-primary) uppercase"
                        >
                          {t.tag.name}
                        </span>
                      ))
                    ) : (
                      <>
                        <span className="rounded border border-(--border-subtle) bg-(--accent)/10 px-2 py-0.5 text-[9px] font-bold text-(--accent) uppercase">
                          AI
                        </span>
                        <span className="rounded border border-(--border-subtle) bg-(--accent)/10 px-2 py-0.5 text-[9px] font-bold text-(--accent) uppercase">
                          {item.type || 'Web'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-(--border-subtle) bg-(--bg-elevated) p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-(--border-subtle) bg-(--bg-surface) text-(--accent) shadow-sm">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-(--text-muted) uppercase">
                    Last Viewed
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-(--text-primary)">
                    Just now
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-(--border-subtle) bg-(--bg-elevated) p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--success-bg) text-(--success-text) shadow-sm">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-(--text-muted) uppercase">
                    Origin Status
                  </p>
                  <p className="mt-0.5 text-xs leading-snug font-bold text-(--text-primary)">
                    <span
                      className={`block uppercase ${item.status === 'processed'
                        ? 'text-(--success-text)'
                        : item.status === 'failed'
                          ? 'text-(--error-text)'
                          : 'text-[#d97706]'
                        }`}
                    >
                      {item.status}
                    </span>
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
            className="group relative cursor-pointer overflow-hidden rounded-3xl border border-(--border-subtle) bg-(--bg-surface) p-5"
          >
            <div className="absolute -right-4 -bottom-4 h-28 w-28 rounded-full bg-(--accent)/10 blur-2xl transition-transform duration-700 group-hover:scale-150"></div>
            <div className="relative z-10">
              <p className="mb-1.5 text-[10px] font-bold tracking-widest text-(--text-muted) uppercase">
                Thought Origin
              </p>
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-(--accent)" />
                <p className="text-sm font-bold text-(--text-primary)">
                  {(() => {
                    try {
                      return new URL(item.url).hostname.replace(/^www\./, '')
                    } catch {
                      return 'Unknown Origin'
                    }
                  })()}
                </p>
              </div>
              <div className="flex h-24 items-center justify-center overflow-hidden rounded-2xl bg-(--bg-elevated) opacity-60 mix-blend-multiply grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0">
                <img
                  src={`https://www.google.com/s2/favicons?sz=128&domain=${item.url}`}
                  alt="Source Origin"
                  className="h-16 w-16 object-contain drop-shadow-lg"
                />
              </div>
            </div>
          </motion.section>
        </motion.aside>
      </motion.main>

      {/* SideNavBar Trigger (Subtle) */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-(--border-subtle) bg-(--bg-surface) text-(--text-secondary) shadow-(--border-strong)/20 shadow-2xl transition-transform hover:scale-110 hover:text-(--accent)"
        >
          <Network className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
