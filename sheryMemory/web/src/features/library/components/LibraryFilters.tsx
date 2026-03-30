import { Filter } from 'lucide-react'
import { CustomSelect } from '../../../components/CustomSelect'

interface LibraryFiltersProps {
  filterType: string
  setFilterType: (val: string) => void
  filterStatus: string
  setFilterStatus: (val: string) => void
  filterCollection: string
  setFilterCollection: (val: string) => void
  collectionOptions: { value: string; label: string }[]
  onClear?: () => void
}

export function LibraryFilters({
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  filterCollection,
  setFilterCollection,
  collectionOptions,
}: LibraryFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-(--border-subtle) bg-(--bg-surface) p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
      {/* Type Filter */}
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-(--text-secondary)">
          <Filter className="h-4 w-4 text-(--text-muted)" />
          <span>Type:</span>
        </div>
        <CustomSelect
          value={filterType}
          onChange={setFilterType}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'article', label: 'Articles' },
            { value: 'video', label: 'Videos' },
            { value: 'pdf', label: 'PDFs' },
            { value: 'image', label: 'Images' },
            { value: 'tweet', label: 'Tweets' },
          ]}
          className="w-full sm:w-40"
        />
      </div>

      {/* Status Filter */}
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
        <span className="text-sm font-semibold text-(--text-secondary)">Status:</span>
        <CustomSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'processed', label: 'Processed' },
            { value: 'pending', label: 'Pending' },
          ]}
          className="w-full sm:w-40"
        />
      </div>

      {/* Collection Filter */}
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2 sm:col-span-2 lg:col-span-1">
        <span className="text-sm font-semibold text-(--text-secondary)">Collection:</span>
        <CustomSelect
          value={filterCollection}
          onChange={setFilterCollection}
          options={collectionOptions}
          className="w-full sm:flex-1 lg:w-48"
        />
      </div>
    </div>
  )
}
