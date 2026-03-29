import { FileText, ImageIcon, Check } from 'lucide-react'

export function CollectionsGuide() {
  return (
    <div className="mt-16 flex flex-col items-center gap-10 rounded-3xl border border-(--border-subtle) bg-(--bg-surface) p-8 md:flex-row">
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-elevated) md:w-1/3">
        <div className="absolute inset-0 bg-linear-to-br from-[#4648d4] to-[#6063ee] opacity-20"></div>
        <div className="relative z-10 flex gap-4">
          <div className="flex h-14 w-12 animate-pulse items-center justify-center rounded-lg border border-(--border-subtle) bg-(--bg-surface) shadow-xl">
            <FileText className="h-6 w-6 text-(--accent)" />
          </div>
          <div className="flex h-14 w-12 rotate-6 items-center justify-center rounded-lg border border-(--border-subtle) bg-(--bg-surface)/60 shadow-sm">
            <ImageIcon className="h-6 w-6 text-(--text-muted)" />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4">
        <h4 className="font-manrope text-2xl font-bold text-(--text-primary)">
          Effortless Organization
        </h4>
        <p className="max-w-xl leading-relaxed text-(--text-secondary)">
          Drag any note, bookmark, or media directly onto a collection card to
          categorize it instantly. Use the 'New Thought' button to capture
          ideas before they escape, then move them here when you're ready to
          curate.
        </p>
        <div className="flex gap-6 pt-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--accent)/10 text-(--accent)">
              <Check className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-(--text-secondary)">
              Smart Auto-Tagging
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--accent)/10 text-(--accent)">
              <Check className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-(--text-secondary)">
              Batch Sorting
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
