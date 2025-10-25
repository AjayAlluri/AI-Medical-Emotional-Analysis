'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Video, Square, Play, Camera, CameraOff } from 'lucide-react'

interface CameraCaptureProps {
  onFrameCapture?: (imageData: string) => void
  onRecordingStart?: () => void
  onRecordingStop?: () => void
  isRecording?: boolean
}

export default function CameraCapture({ 
  onFrameCapture, 
  onRecordingStart, 
  onRecordingStop,
  isRecording = false 
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const [hasPermission, setHasPermission] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fps, setFps] = useState(0)
  const [frameCount, setFrameCount] = useState(0)

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: true
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setHasPermission(true)
      }
    } catch (err) {
      setError('Failed to access camera. Please check permissions.')
      console.error('Camera error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setHasPermission(false)
    setFps(0)
    setFrameCount(0)
  }, [])

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert to base64 JPEG
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    
    // Call the callback with the frame data
    if (onFrameCapture) {
      onFrameCapture(imageData)
    }
    
    setFrameCount(prev => prev + 1)
  }, [onFrameCapture])

  const startFrameCapture = useCallback(() => {
    if (intervalRef.current) return
    
    // Capture frames at 2-5 fps
    const captureInterval = 200 // 5 fps
    intervalRef.current = setInterval(captureFrame, captureInterval)
    
    if (onRecordingStart) {
      onRecordingStart()
    }
  }, [captureFrame, onRecordingStart])

  const stopFrameCapture = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    if (onRecordingStop) {
      onRecordingStop()
    }
  }, [onRecordingStop])

  // Calculate FPS
  useEffect(() => {
    if (!isRecording) return
    
    const fpsInterval = setInterval(() => {
      setFps(frameCount)
      setFrameCount(0)
    }, 1000)
    
    return () => clearInterval(fpsInterval)
  }, [isRecording, frameCount])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  const handleStartRecording = () => {
    if (!hasPermission) {
      startCamera()
    } else {
      startFrameCapture()
    }
  }

  const handleStopRecording = () => {
    stopFrameCapture()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Live Camera Feed
        </CardTitle>
        <CardDescription>
          Real-time emotion detection and analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera Video */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-64 object-cover ${!hasPermission ? 'hidden' : ''}`}
          />
          
          {/* Hidden canvas for frame capture */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Loading/Error States */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
              <div className="text-center text-white">
                <Camera className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                <p>Starting camera...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-75">
              <div className="text-center text-white p-4">
                <CameraOff className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">{error}</p>
                <Button 
                  onClick={startCamera}
                  className="mt-2"
                  size="sm"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}
          
          {!hasPermission && !isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
              <div className="text-center text-white">
                <Camera className="h-8 w-8 mx-auto mb-2" />
                <p>Camera not started</p>
              </div>
            </div>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!hasPermission ? (
              <Button 
                onClick={startCamera}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="h-4 w-4 mr-2" />
                {isLoading ? 'Starting...' : 'Start Camera'}
              </Button>
            ) : (
              <div className="flex gap-2">
                {!isRecording ? (
                  <Button 
                    onClick={handleStartRecording}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStopRecording}
                    variant="destructive"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2">
            <Badge variant={hasPermission ? "default" : "secondary"}>
              {hasPermission ? "Camera On" : "Camera Off"}
            </Badge>
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                Recording
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        {isRecording && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>FPS: {fps}</span>
            <span>Frames: {frameCount}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
