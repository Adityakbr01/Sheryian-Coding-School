function ConfirmDialog({ open, title, description, onConfirm, onCancel }: {
    open: boolean
    title: string
    description?: string
    onConfirm: () => void
    onCancel: () => void
}) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="rounded-xl bg-(--bg-surface) p-6 shadow-xl w-full max-w-xs">
                <h2 className="mb-2 text-lg font-bold text-(--text-primary)">{title}</h2>
                {description && <p className="mb-4 text-sm text-(--text-secondary)">{description}</p>}
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        className="rounded-md px-4 py-2 text-sm font-medium bg-(--bg-elevated) text-(--text-secondary) border border-(--border-subtle) hover:bg-(--bg-surface)"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="rounded-md px-4 py-2 text-sm font-medium bg-(--error-bg) text-(--error-text) border border-(--error-bg) hover:bg-(--error-bg)/80"
                        onClick={onConfirm}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}


export default ConfirmDialog