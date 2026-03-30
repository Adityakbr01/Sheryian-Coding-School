import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { negotiateApi } from '../api/negotiate.api'
import { useNegotiateStore } from '../store/negotiate.store'
import { useAuthStore } from '../../auth/store/auth.store'
import type { Difficulty, Product } from '../types/negotiate.types'

const DIFFICULTY_INFO = {
  easy: { label: '🟢 Easy', desc: 'Generous seller, big discounts possible' },
  medium: { label: '🟡 Medium', desc: 'Balanced seller, fair negotiations' },
  hard: { label: '🔴 Hard', desc: 'Tough seller, minimal discounts' },
}

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  console.log(isAuthenticated)
  const { setSession, setLoading } = useNegotiateStore()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [starting, setStarting] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => negotiateApi.listProducts(),
  })

  const products = data?.data ?? []

  const handleStart = async () => {
    if (!selectedProduct) return
    if (!isAuthenticated) return navigate('/login')
    setStarting(true)
    try {
      setLoading(true)
      const res = await negotiateApi.startSession(
        selectedProduct.id,
        difficulty,
      )
      setSession({ ...res.data, messages: [] })
      navigate(`/game/${res.data.sessionId}`)
    } catch (e: any) {
      console.log(e)
      // alert(e.message)
    } finally {
      setStarting(false)
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 py-8">
      <div className="text-center">
        <h1 className="font-HelveticaNow mb-3 text-4xl font-bold text-(--text-primary)">
          🛒 NegotiateAI
        </h1>
        <p className="text-lg text-(--text-secondary)">
          Master the art of bargaining against an adaptive AI seller.
        </p>
      </div>

      {/* Product Selection */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-(--text-primary)">
          Choose a Product
        </h2>
        {!isAuthenticated && (
          <div className="mb-4 rounded-xl border border-yellow-400 bg-yellow-50 p-4 text-sm text-yellow-800">
            🔒 Login is required to create a negotiation session. Please log in
            and then choose a product.
          </div>
        )}
        {isLoading ? (
          <div className="text-center text-(--text-muted)">
            Loading products...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${selectedProduct?.id === p.id
                  ? 'border-(--accent) bg-(--accent-muted)'
                  : 'border-(--border-default) bg-(--card-bg) hover:border-(--accent)'
                  }`}
              >
                <div className="mb-1 text-3xl">{p.emoji}</div>
                <div className="font-semibold text-(--text-primary)">
                  {p.name}
                </div>
                <div className="mt-1 text-xs text-(--text-muted)">
                  {p.description}
                </div>
                <div className="mt-2 font-bold text-(--accent)">
                  ₹{p.basePrice.toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Difficulty */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-(--text-primary)">
          Select Difficulty
        </h2>
        <div className="flex gap-3">
          {(
            Object.entries(DIFFICULTY_INFO) as [
              Difficulty,
              typeof DIFFICULTY_INFO.easy,
            ][]
          ).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setDifficulty(key)}
              className={`flex-1 rounded-xl border-2 p-3 text-center transition-all ${difficulty === key
                ? 'border-(--accent) bg-(--accent-muted)'
                : 'border-(--border-default) bg-(--card-bg) hover:border-(--accent)'
                }`}
            >
              <div className="font-semibold text-(--text-primary)">
                {info.label}
              </div>
              <div className="mt-1 text-xs text-(--text-muted)">
                {info.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={!selectedProduct || starting}
        className="w-full rounded-xl bg-(--accent) py-4 text-lg font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {starting ? 'Starting...' : '🤝 Start Negotiation'}
      </button>
    </div>
  )
}
