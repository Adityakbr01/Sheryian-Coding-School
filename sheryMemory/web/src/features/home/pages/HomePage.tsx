import { SlideButton } from '@/components/SlideButton'
import { Brain, Globe, Search, Shield, Sparkles, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { FeatureCard } from '../components/FeatureCard'

export function HomePage() {
  return (
    <div className="relative flex flex-col items-center -mt-20 justify-center overflow-hidden bg-(--bg-base)">

      {/* ✅ LIGHTWEIGHT BACKGROUND (no infinite animation) */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 h-[400px] w-[400px] rounded-full bg-(--accent)/10 blur-[80px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[80px]" />
      </div>

      {/* Main */}
      <main className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 pt-16 pb-20 md:px-8 md:pt-24 lg:pb-32">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="group inline-flex items-center gap-2 rounded-full border border-(--border-subtle) bg-(--bg-surface)/40 px-4 py-2 text-[11px] font-bold tracking-[0.15em] text-(--accent) uppercase"
        >
          <div className="h-1 w-1 rounded-full bg-(--accent)" />
          <Sparkles className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-12" />
          The Intelligent Digital Curator
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-10 flex flex-col items-center space-y-6 text-center"
        >
          <h1 className="font-manrope text-[40px] font-[900] leading-[1.1] tracking-tight text-(--text-primary) sm:text-6xl md:text-7xl">
            Design your <br className="hidden sm:block" />
            <span className="bg-gradient-to-tr from-(--accent) via-accent/40 to-(--accent-hover) bg-clip-text text-transparent">
              Second Brain.
            </span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-(--text-secondary) sm:text-lg">
            SheryMemory is a private vault for your thoughts, studies, and inspirations.
            Powered by AI, it seamlessly catalogs everything you learn.
          </p>

          {/* Buttons */}
          <div className="flex w-full flex-col items-center gap-4 pt-6 sm:w-auto sm:flex-row">
            <Link to="/register" className="w-full sm:w-auto">
              <SlideButton size="lg" fullWidth className="h-14 px-10 font-bold shadow-lg">
                Start Building Now
              </SlideButton>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <SlideButton variant="secondary" fullWidth size="lg" className="h-14 px-10 font-bold">
                Access Vault
              </SlideButton>
            </Link>
          </div>
        </motion.div>

        {/* Features (❌ removed heavy motion) */}
        <div className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon={Brain} title="AI Extraction" description="Automatically extracts tags, summaries, and highlights." />
          <FeatureCard icon={Shield} title="Privacy First" description="End-to-end encryption keeps your data safe." />
          <FeatureCard icon={Zap} title="Instant Retrieval" description="Find notes instantly with semantic search." />
          <FeatureCard icon={Search} title="Smart Filter" description="Organize and filter your knowledge easily." />
          <FeatureCard icon={Globe} title="Cloud Sync" description="Access your data from any device." />
          <FeatureCard icon={Sparkles} title="Semantic Discovery" description="AI connects related ideas automatically." />
        </div>
      </main>

      {/* Divider */}
      <div className="h-px w-full max-w-7xl bg-gradient-to-r from-transparent via-(--border-subtle) to-transparent opacity-20" />
    </div>
  )
}