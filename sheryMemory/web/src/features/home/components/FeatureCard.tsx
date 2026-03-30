import type { LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  delay?: number
}

export function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5 }}
      className="group relative flex flex-col gap-4 rounded-3xl border border-(--border-subtle) bg-(--bg-surface)/40 p-6 shadow-sm backdrop-blur-md transition-all hover:border-(--accent)/30 hover:bg-(--bg-surface)/60 hover:shadow-xl"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--accent)/10 text-(--accent) group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-manrope text-base font-bold text-(--text-primary)">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-(--text-muted)">
          {description}
        </p>
      </div>
    </motion.div>
  )
}
