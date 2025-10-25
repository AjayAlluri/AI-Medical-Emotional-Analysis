'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEmotionStore } from '@/lib/store'
import CameraCapture from '@/components/camera/CameraCapture'
import EmotionGauge from '@/components/emotion/EmotionGauge'
import AudioRecorder from '@/components/audio/AudioRecorder'
import RAGSearch from '@/components/rag/RAGSearch'

export default function Home() {
  const [isRecording, setIsRecording] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const { 
    currentEmotion, 
    currentValence, 
    currentArousal, 
    summaries, 
    addSummary,
    setCurrentEmotion,
    setCurrentValence,
    setCurrentArousal
  } = useEmotionStore()

  // Generate session ID on mount
  useEffect(() => {
    setSessionId(`session_${Date.now()}`)
  }, [])

  const handleFrameCapture = useCallback((imageData: string) => {
    // TODO: Send frame to FastAPI ingest service
    console.log('Frame captured:', imageData.substring(0, 50) + '...')
    
    // Simulate emotion detection for demo
    const emotions = ['happiness', 'sadness', 'anger', 'fear', 'surprise', 'neutral']
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
    const randomValence = (Math.random() - 0.5) * 2 // -1 to 1
    const randomArousal = (Math.random() - 0.5) * 2 // -1 to 1
    
    setCurrentEmotion(randomEmotion)
    setCurrentValence(randomValence)
    setCurrentArousal(randomArousal)
  }, [setCurrentEmotion, setCurrentValence, setCurrentArousal])

  const handleAudioChunk = useCallback((audioData: string, sampleRate: number) => {
    // TODO: Send audio to FastAPI ingest service
    console.log('Audio chunk captured:', audioData.substring(0, 50) + '...', 'Sample rate:', sampleRate)
  }, [])

  const handleRecordingStart = useCallback(() => {
    setIsRecording(true)
    console.log('Recording started for session:', sessionId)
  }, [sessionId])

  const handleRecordingStop = useCallback(() => {
    setIsRecording(false)
    console.log('Recording stopped for session:', sessionId)
    
    // Simulate adding a summary
    if (currentEmotion && currentValence !== null && currentArousal !== null) {
      const summary = {
        id: `summary_${Date.now()}`,
        timestamp: new Date(),
        emotion: currentEmotion,
        valence: currentValence,
        arousal: currentArousal,
        text: `User showed ${currentEmotion} emotions with ${currentValence > 0 ? 'positive' : 'negative'} valence and ${currentArousal > 0 ? 'high' : 'low'} arousal.`,
        transcript: 'This is a sample transcript of the conversation.'
      }
      addSummary(summary)
    }
  }, [sessionId, currentEmotion, currentValence, currentArousal, addSummary])

  const handleRAGSearch = useCallback((query: string) => {
    console.log('RAG search query:', query)
    // TODO: Implement actual RAG search
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">EmotionSense</h1>
          <p className="text-lg text-gray-600">Real-time emotion and voice-tone analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera Feed */}
          <div className="space-y-6">
            <CameraCapture
              onFrameCapture={handleFrameCapture}
              onRecordingStart={handleRecordingStart}
              onRecordingStop={handleRecordingStop}
              isRecording={isRecording}
            />
            
            <AudioRecorder
              onAudioChunk={handleAudioChunk}
              onRecordingStart={handleRecordingStart}
              onRecordingStop={handleRecordingStop}
              isRecording={isRecording}
            />
          </div>

          {/* Emotion Analysis */}
          <div className="space-y-6">
            <EmotionGauge
              emotion={currentEmotion}
              valence={currentValence}
              arousal={currentArousal}
              confidence={0.85}
            />
            
            {/* Recent Summaries */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Summaries</CardTitle>
                <CardDescription>
                  AI-generated conversation insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {summaries.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No summaries yet. Start recording to see analysis.
                    </p>
                  ) : (
                    summaries.slice(-5).map((summary, index) => (
                      <div key={summary.id} className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-800">
                            {summary.emotion}
                          </span>
                          <span className="text-xs text-gray-500">
                            {summary.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{summary.text}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Valence: {Math.round(summary.valence * 100)}%</span>
                          <span>Arousal: {Math.round(summary.arousal * 100)}%</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RAG Search */}
        <div className="mt-8">
          <RAGSearch
            onSearch={handleRAGSearch}
            isLoading={false}
          />
        </div>
      </div>
    </div>
  )
}
