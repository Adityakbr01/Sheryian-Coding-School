import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNegotiateStore } from '../store/negotiate.store'
import { negotiateApi } from '../api/negotiate.api'
import { ChatWindow } from '../components/ChatWindow'
import { ChatInput } from '../components/ChatInput'
import { MoodIndicator } from '../components/MoodIndicator'
import { PriceMeter } from '../components/PriceMeter'
import { useFaceDetection } from '../hooks/useFaceDetection'
import { Mic, MicOff, Video, VideoOff } from 'lucide-react'
import { speakText } from '../hooks/useVoice'

export default function GamePage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const {
    session,
    messages,
    isSending,
    setSession,
    addMessages,
    updatePrice,
    updateMood,
    updateRound,
    addTactic,
    setSending,
    setLoading,
    completeSession,
    setError,
    isVoiceOn,
    isCameraOn,
    toggleVoice,
    toggleCamera,
  } = useNegotiateStore()

  const [streamingReply, setStreamingReply] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const { videoRef, currentEmotion } = useFaceDetection(isCameraOn)

  useEffect(() => {
    if (!sessionId) return
    if (!session || session.sessionId !== sessionId) {
      setLoading(true)
      negotiateApi
        .getSession(sessionId)
        .then((r) => setSession(r.data))
        .catch(() => navigate('/'))
        .finally(() => setLoading(false))
    }
  }, [sessionId])

  // Cleanup pending request on unmount
  useEffect(
    () => () => {
      abortRef.current?.abort()
    },
    [],
  )

  const handleSend = (msg: string) => {
    if (!msg.trim() || isSending || !session || session.isComplete) return
    setSending(true)
    setStreamingReply('')
    addMessages([
      { role: 'user', content: msg, timestamp: new Date().toISOString() },
    ])

    let metaData: any = null

    abortRef.current = negotiateApi.negotiate(
      session.sessionId,
      msg,
      {
        onMeta: (meta) => {
          metaData = meta
          updatePrice(meta.newPrice)
          updateMood(meta.mood)
          updateRound(meta.roundNumber)
          addTactic(meta.tactic)
        },
        onChunk: (chunk) => {
          setStreamingReply((prev) => prev + chunk)
        },
        onDone: (result) => {
          setStreamingReply('')
          addMessages([
            {
              role: 'ai',
              content: result.reply,
              mood: metaData?.mood,
              priceAtRound: metaData?.newPrice,
              tactic: metaData?.tactic,
              timestamp: new Date().toISOString(),
            },
          ])
          if (result.isWalkaway || result.dealClosed) {
            completeSession(
              !result.isWalkaway,
              result.isWalkaway,
              metaData?.newPrice,
            )
            setTimeout(() => navigate(`/results/${session.sessionId}`), 1500)
          }
          setSending(false)
          if (isVoiceOn) {
            speakText(result.reply)
          }
        },
        onError: (errMsg) => {
          setStreamingReply('')
          setError(errMsg)
          addMessages([
            {
              role: 'ai',
              content: '⚠️ Something went wrong. Please try again.',
              timestamp: new Date().toISOString(),
            },
          ])
          setSending(false)
        },
      },
      currentEmotion,
    )
  }

  const handleAccept = async () => {
    if (!session || session.isComplete) return
    try {
      await negotiateApi.acceptDeal(session.sessionId)
      completeSession(true, false, session.currentPrice)
      navigate(`/results/${session.sessionId}`)
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (!session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-(--text-muted)">
        Loading session...
      </div>
    )
  }

  const roundsLeft = session.maxRounds - session.totalRounds

  return (
    <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-5xl flex-col gap-4 py-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between rounded-xl border border-(--border-default) bg-(--card-bg) px-4 py-3">
        <div>
          <div className="font-bold text-(--text-primary)">
            {session.productEmoji} {session.productName}
          </div>
          <div className="text-xs text-(--text-muted)">
            Round {session.totalRounds}/{session.maxRounds} ·{' '}
            {session.difficulty}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={toggleVoice}
              className={`rounded-full p-2 transition-colors ${isVoiceOn ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-(--bg-elevated) text-(--text-muted)'}`}
              title="Toggle Voice"
            >
              {isVoiceOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button
              onClick={toggleCamera}
              className={`rounded-full p-2 transition-colors ${isCameraOn ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-(--bg-elevated) text-(--text-muted)'}`}
              title="Toggle Camera"
            >
              {isCameraOn ? <Video size={18} /> : <VideoOff size={18} />}
            </button>
          </div>
          <MoodIndicator
            mood={session.mood}
            moodHistory={session.moodHistory}
          />
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-3">
        {/* Chat (left/main) */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-(--border-default) bg-(--card-bg) lg:col-span-2">
          <div className="flex-1 overflow-y-auto p-4">
            <ChatWindow
              messages={messages}
              isSending={isSending}
              streamingReply={streamingReply}
            />
          </div>

          {/* Input */}
          {!session.isComplete ? (
            <ChatInput
              isSending={isSending}
              isVoiceOn={isVoiceOn}
              onSend={handleSend}
            />
          ) : (
            <div className="border-t border-(--border-default) p-3 text-center text-sm font-semibold text-(--text-muted)">
              Negotiation complete
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-3">
          {/* Camera PIP Preview */}
          {isCameraOn && (
            <div className="relative overflow-hidden rounded-xl border border-(--border-default) bg-black">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="h-32 w-full object-cover"
              />
              <div className="absolute top-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur">
                {currentEmotion ? currentEmotion.toUpperCase() : 'NO FACE'}
              </div>
            </div>
          )}

          <PriceMeter
            basePrice={session.basePrice}
            currentPrice={session.currentPrice}
          />

          <div className="rounded-xl border border-(--border-default) bg-(--card-bg) p-4 text-sm">
            <div className="mb-2 font-semibold text-(--text-primary)">
              📊 Stats
            </div>
            <div className="space-y-1 text-(--text-secondary)">
              <div>
                Rounds left:{' '}
                <span className="font-bold text-(--accent)">{roundsLeft}</span>
              </div>
              <div>
                Tactics used:{' '}
                <span className="font-bold">
                  {session.tacticsUsed?.length ?? 0}
                </span>
              </div>
            </div>
          </div>

          {!session.isComplete && session.totalRounds > 0 && (
            <button
              onClick={handleAccept}
              className="w-full rounded-xl border-2 border-green-500 bg-green-50 py-3 font-bold text-green-700 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400"
            >
              ✅ Accept Deal — ₹{session.currentPrice.toLocaleString()}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
