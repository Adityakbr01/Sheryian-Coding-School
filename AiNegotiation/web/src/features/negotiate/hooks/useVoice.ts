import {
  pipeline,
  type AutomaticSpeechRecognitionPipeline,
} from '@huggingface/transformers'
import { useCallback, useEffect, useRef, useState } from 'react'

/* ─── Color-coded Logger ─────────────────────────────────────────────── */
const log = (tag: string, ...args: unknown[]) =>
  console.log(`%c[Voice/${tag}]`, 'color:#22d3ee;font-weight:bold', ...args)
const warn = (tag: string, ...args: unknown[]) =>
  console.warn(`%c[Voice/${tag}]`, 'color:#facc15;font-weight:bold', ...args)
const err = (tag: string, ...args: unknown[]) =>
  console.error(`%c[Voice/${tag}]`, 'color:#ef4444;font-weight:bold', ...args)

/* ─── Status type for UI feedback ────────────────────────────────────── */
export type VoiceStatus =
  | 'idle'
  | 'loading_model' // First time: downloading Whisper (~40MB)
  | 'recording' // Mic is hot, user is speaking
  | 'transcribing' // Audio captured, Whisper is processing
  | 'error'

/* ─── Singleton Whisper Pipeline ─────────────────────────────────────── */
let whisperPipeline: AutomaticSpeechRecognitionPipeline | null = null
let pipelineLoading = false

async function getWhisperPipeline(
  onProgress?: (msg: string) => void,
): Promise<AutomaticSpeechRecognitionPipeline> {
  if (whisperPipeline) return whisperPipeline

  if (pipelineLoading) {
    log('Model', '⏳ Pipeline already loading, waiting...')
    while (pipelineLoading) {
      await new Promise((r) => setTimeout(r, 200))
    }
    if (whisperPipeline) return whisperPipeline
    throw new Error('Pipeline failed to load in another process')
  }

  pipelineLoading = true
  log('Model', '📦 Loading Whisper tiny model (first time only, ~40MB)...')
  onProgress?.('Downloading AI speech model...')

  try {
    // In v3, we can configure environment for better browser behavior
    const { env } = await import('@huggingface/transformers')
    env.allowLocalModels = false
    // If not using workers, proxy should be disabled
    if (env.backends?.onnx?.wasm) {
      env.backends.onnx.wasm.proxy = false
    }
    //@ts-ignore
    whisperPipeline = await pipeline(
      'automatic-speech-recognition',
      'onnx-community/whisper-tiny.en',
      {
        dtype: 'q8', // q8 is fast and small for wasm
        device: 'wasm',
      },
    ) as AutomaticSpeechRecognitionPipeline
    log('Model', '✅ Whisper model loaded successfully!')
    return whisperPipeline!
  } catch (e) {
    err('Model', '💥 Failed to load Whisper:', e)
    pipelineLoading = false // Reset so we can retry
    throw e
  } finally {
    pipelineLoading = false
  }
}

/* ─── Audio Helpers ──────────────────────────────────────────────────── */
async function recordAudio(
  streamRef: React.MutableRefObject<MediaStream | null>,
): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    if (!streamRef.current) {
      reject(new Error('No media stream'))
      return
    }

    const audioContext = new AudioContext({ sampleRate: 16000 })
    // CRITICAL: Must resume especially on newer browsers/security policies
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch((e) => warn('Audio', 'Failed to resume context:', e))
    }

    const source = audioContext.createMediaStreamSource(streamRef.current)
    const processor = audioContext.createScriptProcessor(4096, 1, 1)
    const chunks: Float32Array[] = []

    processor.onaudioprocess = (e) => {
      chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)))
    }

    source.connect(processor)
    processor.connect(audioContext.destination)

      // Store cleanup so stopRecording can call it
      ; (streamRef as any).__stopCapture = () => {
        processor.disconnect()
        source.disconnect()
        audioContext.close()

        // Merge all chunks
        const totalLen = chunks.reduce((acc, c) => acc + c.length, 0)
        const merged = new Float32Array(totalLen)
        let offset = 0
        for (const chunk of chunks) {
          merged.set(chunk, offset)
          offset += chunk.length
        }
        log(
          'Audio',
          `📊 Captured ${(totalLen / 16000).toFixed(1)}s of audio (${totalLen} samples)`,
        )
        resolve(merged)
      }
  })
}

/* ─── Main Hook ──────────────────────────────────────────────────────── */
export function useVoice(onFinalTranscript?: (text: string) => void) {
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [modelProgress, setModelProgress] = useState<string | null>(null)
  const [liveTranscript, setLiveTranscript] = useState('')

  const streamRef = useRef<MediaStream | null>(null)
  const audioPromiseRef = useRef<Promise<Float32Array> | null>(null)

  // ── Start Recording ───────────────────────────────────────────
  const startListening = useCallback(async () => {
    try {
      setErrorMsg(null)
      setLiveTranscript('')

      // 1. Get mic access
      log('Start', '🎤 Requesting microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        },
      })
      streamRef.current = stream
      log('Start', '✅ Microphone access granted.')

      // 2. Pre-load whisper model in background (non-blocking if already cached)
      getWhisperPipeline((msg) => setModelProgress(msg)).catch(() => { })

      // 3. Start capturing audio
      setStatus('recording')
      audioPromiseRef.current = recordAudio(streamRef)
      log('Start', '🔴 Recording started. Speak now!')
    } catch (e: any) {
      err('Start', '💥 Failed:', e)
      setErrorMsg(e.message || 'Microphone access denied')
      setStatus('error')
    }
  }, [])

  // ── Stop Recording & Transcribe ───────────────────────────────
  const stopListening = useCallback(async () => {
    if (status !== 'recording') return

    try {
      log('Stop', '⏹️ Stopping recording...')

      // Stop the audio capture
      const stopCapture = (streamRef as any).__stopCapture
      if (stopCapture) stopCapture()

      // Stop mic tracks
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null

      // Wait for audio data
      const audioData = await audioPromiseRef.current
      if (!audioData || audioData.length < 1600) {
        // Less than 0.1s of audio
        warn('Stop', '⚠️ Audio too short, skipping transcription.')
        setStatus('idle')
        return
      }

      // Transcribe with Whisper
      setStatus('transcribing')
      log('Transcribe', '🧠 Running Whisper on captured audio...')

      const whisper = await getWhisperPipeline((msg) => {
        setModelProgress(msg)
        setStatus('loading_model')
      })

      const result = await whisper(audioData)
      // Result can be { text: '...' } or [{ text: '...' }] in v3
      const text = (Array.isArray(result) ? result[0]?.text : (result as any).text)?.trim() || ''

      log('Transcribe', `✅ Result: "${text}"`)
      setLiveTranscript(text)

      if (text && onFinalTranscript) {
        onFinalTranscript(text)
      } else if (!text) {
        warn(
          'Transcribe',
          '⚠️ Whisper returned empty — possibly silence or noise.',
        )
      }

      setStatus('idle')
    } catch (e: any) {
      err('Stop', '💥 Transcription failed:', e)
      setErrorMsg(e.message || 'Transcription failed')
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }, [status, onFinalTranscript])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return {
    isListening: status === 'recording',
    status,
    errorMsg,
    modelProgress,
    liveTranscript,
    isSupported: true, // Always supported — no browser dependency!
    isMicAvailable: true,
    startListening,
    stopListening,
  }
}

/* ─── TTS Utility ────────────────────────────────────────────────────── */
export const speakText = (text: string, rate = 1.0, pitch = 1.0) => {
  if (!('speechSynthesis' in window)) {
    warn('TTS', 'SpeechSynthesis not available.')
    return
  }
  log('TTS', `🔊 Speaking: "${text.slice(0, 80)}..."`)
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = rate
  utterance.pitch = pitch

  const speak = () => {
    const voices = window.speechSynthesis.getVoices()
    const preferred =
      voices.find((v) => v.lang.includes('en-IN')) ||
      voices.find((v) => v.lang.includes('en-GB')) ||
      voices.find((v) => v.lang.includes('en-US')) ||
      voices[0]

    if (preferred) {
      utterance.voice = preferred
      log('TTS', `Using voice: ${preferred.name} (${preferred.lang})`)
    }

    utterance.onend = () => log('TTS', '✅ Finished speaking.')
    utterance.onerror = (e) => err('TTS', 'Utterance error:', e)

    window.speechSynthesis.speak(utterance)
  }

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      speak()
      window.speechSynthesis.onvoiceschanged = null
    }
  } else {
    speak()
  }
}
