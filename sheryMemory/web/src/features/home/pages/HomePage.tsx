import { SlideButton } from '@/components/SlideButton'
import { Brain, Globe, Search, Shield, Sparkles, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { FeatureCard } from '../components/FeatureCard'
import { useState } from 'react'

/* ================== ANIMATION SYSTEM ================== */

const container = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const item = {
  initial: {
    opacity: 0,
    y: 20,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
  },
  transition: {
    duration: 0.5,
    ease: 'easeOut',
  },
}

/* ================== TOOLTIP COMPONENT ================== */

function Tooltip({
  children,
  text,
}: {
  children: React.ReactNode
  text: string
}) {
  const [show, setShow] = useState(false)

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{
          opacity: show ? 1 : 0,
          y: show ? 0 : 10,
          scale: show ? 1 : 0.95,
        }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none absolute top-1/2 left-full ml-3 -translate-y-1/2 rounded-lg border border-(--border-subtle) bg-(--bg-surface)/90 px-3 py-1.5 text-xs whitespace-nowrap text-(--text-primary) shadow-xl backdrop-blur-md"
      >
        {text}
      </motion.div>
    </div>
  )
}

/* ================== HOME ================== */

export function HomePage() {
  return (
    <div className="relative -mt-20 flex flex-col items-center justify-center overflow-hidden bg-(--bg-base)">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-1/4 h-[400px] w-[400px] rounded-full bg-(--accent)/10 blur-[80px]" />
        <div className="absolute -right-1/4 -bottom-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[80px]" />
      </div>

      {/* Main */}
      <motion.main
        variants={container}
        initial="initial"
        animate="animate"
        className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 pt-16 pb-20 md:px-8 md:pt-24 lg:pb-32"
      >
        {/* Badge */}
        <motion.div
          variants={item}
          className="group inline-flex items-center gap-2 rounded-full border border-(--border-subtle) bg-(--bg-surface)/40 px-4 py-2 text-[11px] font-bold tracking-[0.15em] text-(--accent) uppercase backdrop-blur-md"
        >
          <div className="h-1 w-1 rounded-full bg-(--accent)" />
          <Sparkles className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-12" />
          The Intelligent Digital Curator
        </motion.div>

        {/* Firefox Button with Tooltip + Live */}
        <motion.div variants={item} className="mt-6">
          <Tooltip text="Install extension to save your knowledge instantly 🚀">
            <a
              href="https://addons.mozilla.org/en-US/firefox/addon/sherymemory-saver/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 rounded-full border border-(--border-subtle) bg-(--bg-surface)/40 px-8 py-2 text-[11px] font-bold tracking-[0.15em] text-(--accent) uppercase backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
            >
              {/* Live Status */}
              <span className="absolute top-2.5 left-3 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
              </span>
              {/* <Globe className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-6" /> */}
              Add to Firefox
            </a>
          </Tooltip>
        </motion.div>

        {/* Hero */}
        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center space-y-6 text-center"
        >
          <h1 className="font-manrope text-[40px] leading-[1.1] font-[900] tracking-tight text-(--text-primary) sm:text-6xl md:text-7xl">
            Design your <br className="hidden sm:block" />
            <span className="via-accent/40 bg-gradient-to-tr from-(--accent) to-(--accent-hover) bg-clip-text text-transparent">
              Second Brain.
            </span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-(--text-secondary) sm:text-lg">
            SheryMemory is a private vault for your thoughts, studies, and
            inspirations. Powered by AI, it seamlessly catalogs everything you
            learn.
          </p>

          {/* Buttons */}
          <div className="flex w-full flex-col items-center gap-4 pt-6 sm:w-auto sm:flex-row">
            <Link to="/register" className="w-full sm:w-auto">
              <SlideButton
                size="lg"
                fullWidth
                className="h-14 px-10 font-bold shadow-lg transition-transform hover:scale-[1.02]"
              >
                Start Building Now
              </SlideButton>
            </Link>

            <Link to="/login" className="w-full sm:w-auto">
              <SlideButton
                variant="secondary"
                fullWidth
                size="lg"
                className="h-14 px-10 font-bold transition-transform hover:scale-[1.02]"
              >
                Access Vault
              </SlideButton>
            </Link>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          variants={container}
          className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {[
            {
              icon: Brain,
              title: 'AI Extraction',
              desc: 'Automatically extracts tags, summaries, and highlights.',
            },
            {
              icon: Shield,
              title: 'Privacy First',
              desc: 'End-to-end encryption keeps your data safe.',
            },
            {
              icon: Zap,
              title: 'Instant Retrieval',
              desc: 'Find notes instantly with semantic search.',
            },
            {
              icon: Search,
              title: 'Smart Filter',
              desc: 'Organize and filter your knowledge easily.',
            },
            {
              icon: Globe,
              title: 'Cloud Sync',
              desc: 'Access your data from any device.',
            },
            {
              icon: Sparkles,
              title: 'Semantic Discovery',
              desc: 'AI connects related ideas automatically.',
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              variants={item}
              className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <FeatureCard icon={f.icon} title={f.title} description={f.desc} />
            </motion.div>
          ))}
        </motion.div>
      </motion.main>

      {/* Divider */}
      <div className="h-px w-full max-w-7xl bg-gradient-to-r from-transparent via-(--border-subtle) to-transparent opacity-20" />
    </div>
  )
}
