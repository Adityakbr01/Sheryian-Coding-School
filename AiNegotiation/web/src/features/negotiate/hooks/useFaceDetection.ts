import { useState, useEffect, useRef, useCallback } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

export function useFaceDetection(isCameraOn: boolean) {
  const [isModelsLoaded, setIsModelsLoaded] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<string | undefined>(
    undefined,
  )
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const landmarkerRef = useRef<FaceLandmarker | null>(null)
  const animationRef = useRef<number | null>(null)

  // Initialize MediaPipe FaceLandmarker
  useEffect(() => {
    let isMounted = true
    const initModel = async () => {
      try {
        console.log('[MediaPipe] Initializing FilesetResolver...')
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
        )

        console.log('[MediaPipe] Creating FaceLandmarker...')
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 1,
        })

        if (isMounted) {
          landmarkerRef.current = landmarker
          setIsModelsLoaded(true)
          console.log('[MediaPipe] Models loaded successfully!')
        }
      } catch (err) {
        console.error('[MediaPipe] Error loading face landmark models:', err)
        if (isMounted) setError('Failed to load Face AI models.')
      }
    }
    initModel()
    return () => {
      isMounted = false
    }
  }, [])

  const detectFace = useCallback(() => {
    if (!landmarkerRef.current || !videoRef.current) return

    if (
      videoRef.current.currentTime > 0 &&
      !videoRef.current.paused &&
      !videoRef.current.ended
    ) {
      const results = landmarkerRef.current.detectForVideo(
        videoRef.current,
        performance.now(),
      )

      if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
        const blendshapes = results.faceBlendshapes[0].categories

        const getScore = (name: string) =>
          blendshapes.find((b) => b.categoryName === name)?.score || 0

        const smileLeft = getScore('mouthSmileLeft')
        const smileRight = getScore('mouthSmileRight')
        const jawOpen = getScore('jawOpen')
        const browUp = getScore('browInnerUp')
        const frownLeft = getScore('mouthFrownLeft')
        const frownRight = getScore('mouthFrownRight')

        let detectedExpr = 'neutral'
        if (smileLeft > 0.5 && smileRight > 0.5) {
          detectedExpr = 'happy'
        } else if (jawOpen > 0.2 && browUp > 0.2) {
          detectedExpr = 'surprised'
        } else if (frownLeft > 0.1 && frownRight > 0.1) {
          // You had 0.0001 in your sample, but 0.1 is more robust to avoid micro-sadness
          detectedExpr = 'sad'
        }

        // Only trigger React state update if the emotion has actually changed
        // This stops typing lag memory leak!
        setCurrentEmotion((prev) => {
          if (prev !== detectedExpr) {
            console.log(
              `[FaceDetection] Emotion changed from ${prev} to ${detectedExpr}`,
            )
            return detectedExpr
          }
          return prev
        })
      }
    }

    // Keep loop going
    if (isCameraOn) {
      animationRef.current = requestAnimationFrame(detectFace)
    }
  }, [isCameraOn])

  // Manage webcam stream
  const startCamera = async () => {
    if (!videoRef.current || streamRef.current) return
    try {
      console.log('[Webcam] Accessing camera...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
      videoRef.current.srcObject = stream
      streamRef.current = stream

      videoRef.current.onloadeddata = () => {
        console.log('[Webcam] Stream loaded. Starting detection loop.')
        if (animationRef.current) cancelAnimationFrame(animationRef.current)
        detectFace() // Kick off detection loop
      }
    } catch (err) {
      console.error('[Webcam] Error accessing webcam:', err)
      setError('Camera permission denied.')
    }
  }

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      console.log('[Webcam] Stopping camera.')
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    setCurrentEmotion(undefined)
  }, [])

  useEffect(() => {
    if (isCameraOn && isModelsLoaded) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [isCameraOn, isModelsLoaded, stopCamera])

  return {
    videoRef,
    isModelsLoaded,
    currentEmotion,
    error,
  }
}
