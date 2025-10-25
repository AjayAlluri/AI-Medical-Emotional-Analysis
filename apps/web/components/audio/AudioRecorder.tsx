'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Square, Play, Volume2, VolumeX } from 'lucide-react'

interface AudioRecorderProps {
  onAudioChunk?: (audioData: string, sampleRate: number) => void
  onRecordingStart?: () => void
  onRecordingStop?: () => void
  isRecording?: boolean
}

export default function AudioRecorder({ 
  onAudioChunk, 
  onRecordingStart, 
  onRecordingStop,
  isRecording = false 
}: AudioRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  
  const [hasPermission, setHasPermission] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  const startAudioContext = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      })
      
      // Create audio context for analysis
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      
      // Start audio level monitoring
      startAudioLevelMonitoring()
      
      setHasPermission(true)
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.')
      console.error('Audio error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const startAudioLevelMonitoring = useCallback(() => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    
    const updateLevel = () => {
      if (!analyserRef.current) return
      
      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
      setAudioLevel(average)
      
      animationRef.current = requestAnimationFrame(updateLevel)
    }
    
    updateLevel()
  }, [])

  const stopAudioContext = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (analyserRef.current) {
      analyserRef.current = null
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    setHasPermission(false)
    setAudioLevel(0)
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      const audioChunks: Blob[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        const arrayBuffer = await audioBlob.arrayBuffer()
        const audioData = new Uint8Array(arrayBuffer)
        
        // Convert to base64
        const base64Audio = btoa(String.fromCharCode(...audioData))
        
        if (onAudioChunk) {
          onAudioChunk(base64Audio, 16000)
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // Collect data every second
      
      if (onRecordingStart) {
        onRecordingStart()
      }
    } catch (err) {
      setError('Failed to start recording')
      console.error('Recording error:', err)
    }
  }, [onAudioChunk, onRecordingStart])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
    
    if (onRecordingStop) {
      onRecordingStop()
    }
  }, [onRecordingStop])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
  }, [isMuted])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudioContext()
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [stopAudioContext])

  const handleStartRecording = () => {
    if (!hasPermission) {
      startAudioContext()
    } else {
      startRecording()
    }
  }

  const handleStopRecording = () => {
    stopRecording()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Audio Recording
        </CardTitle>
        <CardDescription>
          Real-time speech transcription and prosody analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audio Level Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Audio Level</span>
            <div className="flex items-center gap-2">
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-red-500" />
              ) : (
                <Volume2 className="h-4 w-4 text-green-500" />
              )}
              <span className="text-xs text-gray-500">
                {Math.round(audioLevel)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-100 ${
                audioLevel > 50 ? 'bg-red-500' : 
                audioLevel > 20 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
            />
          </div>
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!hasPermission ? (
              <Button 
                onClick={startAudioContext}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Mic className="h-4 w-4 mr-2" />
                {isLoading ? 'Starting...' : 'Start Microphone'}
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
                
                <Button 
                  onClick={toggleMute}
                  variant="outline"
                  size="sm"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2">
            <Badge variant={hasPermission ? "default" : "secondary"}>
              {hasPermission ? "Mic On" : "Mic Off"}
            </Badge>
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                Recording
              </Badge>
            )}
            {isMuted && (
              <Badge variant="outline" className="text-red-600">
                Muted
              </Badge>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-700">
              <MicOff className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Audio Info */}
        {hasPermission && (
          <div className="text-xs text-gray-500 space-y-1">
            <div>Sample Rate: 16kHz</div>
            <div>Channels: Mono</div>
            <div>Format: WebM/Opus</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
