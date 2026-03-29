import { useState, useRef, useCallback } from 'react'
import { Mic, MicOff, Send, AlertTriangle, Loader2 } from 'lucide-react'
import { useVoice, type VoiceStatus } from '../hooks/useVoice'

interface Props {
  isSending: boolean
  isVoiceOn: boolean
  onSend: (msg: string) => void
}

const STATUS_LABELS: Record<VoiceStatus, { label: string; color: string }> = {
  idle: { label: '', color: '' },
  loading_model: { label: 'Loading AI speech model...', color: 'text-blue-500' },
  recording: { label: 'Listening...', color: 'text-red-500' },
  transcribing: { label: 'Transcribing with AI...', color: 'text-purple-500' },
  error: { label: 'Error', color: 'text-red-600' },
}

export function ChatInput({ isSending, isVoiceOn, onSend }: Props) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFinalTranscript = useCallback((text: string) => {
    console.log(`[ChatInput] ✅ Whisper transcript: "${text}"`)
    setInput((prev) => (prev ? `${prev} ${text}`.trim() : text))
  }, [])

  const {
    isListening,
    status,
    errorMsg,
    modelProgress,
    liveTranscript,
    startListening,
    stopListening,
  } = useVoice(handleFinalTranscript)

  const handleSend = () => {
    if (!input.trim() || isSending) return
    onSend(input.trim())
    setInput('')
  }

  const toggleVoice = async () => {
    if (isListening) {
      await stopListening()
    } else {
      await startListening()
    }
  }

  const isActive = status === 'recording' || status === 'transcribing' || status === 'loading_model'
  const statusInfo = STATUS_LABELS[status]

  return (
    <div className="relative border-t border-(--border-default) p-3">
      {/* ── Voice Activity Overlay ──────────────────────────────── */}
      {isActive && (
        <div className="absolute inset-x-0 bottom-full z-20 overflow-hidden rounded-t-xl border border-b-0 border-(--border-default) bg-(--card-bg) px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* Icon / Animation */}
            {status === 'recording' ? (
              <div className="flex items-end gap-[3px]">
                {[3, 4, 2, 5, 3].map((_, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-red-500"
                    style={{
                      width: 3,
                      animation: `voice-bar 0.4s ease-in-out ${i * 0.08}s infinite alternate`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <Loader2 size={18} className="animate-spin text-purple-500" />
            )}

            <div className="flex-1 overflow-hidden">
              {/* Status Label */}
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${statusInfo.color}`}>
                {status === 'recording' && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                )}
                {statusInfo.label}
              </div>

              {/* Progress / Transcript */}
              <div className="mt-0.5 truncate text-xs text-(--text-muted)">
                {status === 'loading_model' && (modelProgress || 'First-time download (~40MB)...')}
                {status === 'recording' && 'Speak now — click mic again when done'}
                {status === 'transcribing' && (liveTranscript || 'Processing your speech with Whisper AI...')}
              </div>
            </div>

            {/* Stop / Cancel */}
            {status === 'recording' && (
              <button
                type="button"
                onClick={toggleVoice}
                className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow transition-transform hover:scale-105 active:scale-95"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Error Banner ─────────────────────────────────────────── */}
      {errorMsg && !isActive && (
        <div className="absolute inset-x-0 bottom-full z-20 flex items-start gap-2 rounded-t-xl border border-b-0 border-amber-400/30 bg-amber-50 px-4 py-2.5 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold">Voice Error</div>
            <div className="mt-0.5">{errorMsg}</div>
          </div>
        </div>
      )}

      {/* ── Input Row ────────────────────────────────────────────── */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={
            isListening
              ? '🎤 Listening... click mic when done'
              : status === 'transcribing'
                ? '⚙️ Transcribing...'
                : 'Make your offer or negotiate...'
          }
          className="flex-1 rounded-lg border border-(--border-default) bg-(--input) px-3 py-2 text-sm text-(--text-primary) outline-none focus:border-(--accent)"
          disabled={isSending}
        />

        {/* Voice Toggle Button */}
        <button
          type="button"
          onClick={toggleVoice}
          disabled={isSending || !isVoiceOn || status === 'transcribing' || status === 'loading_model'}
          title={
            !isVoiceOn
              ? 'Enable Voice from the toolbar first'
              : isListening
                ? 'Click to stop & transcribe'
                : 'Click to start listening'
          }
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
            isListening
              ? 'animate-pulse bg-red-500 text-white shadow-lg shadow-red-500/30'
              : status === 'transcribing' || status === 'loading_model'
                ? 'border border-purple-400 bg-purple-50 text-purple-600 dark:bg-purple-900/20'
                : isVoiceOn
                  ? 'border border-(--border-default) bg-(--card-bg) text-(--text-primary) hover:bg-(--accent)/10 hover:text-(--accent)'
                  : 'border border-(--border-default) bg-(--card-bg) text-(--text-muted) opacity-40'
          }`}
        >
          {status === 'transcribing' || status === 'loading_model' ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isListening ? (
            <MicOff size={18} />
          ) : (
            <Mic size={18} />
          )}
        </button>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || isSending}
          className="flex h-10 items-center gap-1.5 rounded-lg bg-(--accent) px-4 text-sm font-bold text-white transition-colors disabled:opacity-40"
        >
          <Send size={16} />
          Send
        </button>
      </div>

      <style>{`
        @keyframes voice-bar {
          0%   { height: 4px; }
          100% { height: 20px; }
        }
      `}</style>
    </div>
  )
}
