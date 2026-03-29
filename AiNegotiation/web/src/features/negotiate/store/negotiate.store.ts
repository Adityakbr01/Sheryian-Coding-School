import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NegotiationSession, Message, Mood, Tactic, Difficulty } from '../types/negotiate.types'

interface NegotiateState {
  session: NegotiationSession | null
  messages: Message[]
  isLoading: boolean
  isSending: boolean
  error: string | null

  isVoiceOn: boolean
  isCameraOn: boolean

  setSession: (session: NegotiationSession) => void
  addMessages: (msgs: Message[]) => void
  updatePrice: (price: number) => void
  updateMood: (mood: Mood) => void
  updateRound: (round: number) => void
  addTactic: (tactic: Tactic) => void
  setLoading: (v: boolean) => void
  setSending: (v: boolean) => void
  setError: (e: string | null) => void
  completeSession: (success: boolean, isWalkaway: boolean, finalPrice?: number) => void
  resetSession: () => void
  toggleVoice: () => void
  toggleCamera: () => void
}

export const useNegotiateStore = create<NegotiateState>()(
  persist(
    (set) => ({
      session: null,
      messages: [],
      isLoading: false,
      isSending: false,
      error: null,
      isVoiceOn: false,
      isCameraOn: false,

      setSession: (session) =>
        set({
          session: {
            ...session,
            messages: session.messages ?? [],
            tacticsUsed: session.tacticsUsed ?? [],
            moodHistory: session.moodHistory ?? [],
          },
          messages: session.messages ?? [],
          error: null,
        }),

      addMessages: (msgs) =>
        set((state) => ({ messages: [...state.messages, ...msgs] })),

      updatePrice: (price) =>
        set((state) =>
          state.session ? { session: { ...state.session, currentPrice: price } } : {},
        ),

      updateMood: (mood) =>
        set((state) =>
          state.session ? { session: { ...state.session, mood } } : {},
        ),

      updateRound: (round) =>
        set((state) =>
          state.session ? { session: { ...state.session, totalRounds: round } } : {},
        ),

      addTactic: (tactic) =>
        set((state) => {
          if (!state.session) return {}
          const alreadyHas = state.session.tacticsUsed.includes(tactic)
          return {
            session: {
              ...state.session,
              tacticsUsed: alreadyHas ? state.session.tacticsUsed : [...state.session.tacticsUsed, tactic],
            },
          }
        }),

      setLoading: (v) => set({ isLoading: v }),
      setSending: (v) => set({ isSending: v }),
      setError: (e) => set({ error: e }),

      completeSession: (success, isWalkaway, finalPrice) =>
        set((state) =>
          state.session
            ? {
                session: {
                  ...state.session,
                  isComplete: true,
                  success,
                  isWalkaway,
                  finalPrice: finalPrice ?? state.session.currentPrice,
                },
              }
            : {},
        ),

      resetSession: () =>
        set({ session: null, messages: [], isLoading: false, isSending: false, error: null }),
      toggleVoice: () => set((state) => ({ isVoiceOn: !state.isVoiceOn })),
      toggleCamera: () => set((state) => ({ isCameraOn: !state.isCameraOn })),
    }),
    {
      name: 'negotiate-preferences',
      // Only persist the voice/camera toggles — not session data or transient state
      partialize: (state) => ({
        isVoiceOn: state.isVoiceOn,
        isCameraOn: state.isCameraOn,
      }),
    },
  ),
)

// Selector helper
export const selectDifficulty = (s: NegotiateState): Difficulty =>
  s.session?.difficulty ?? 'medium'

