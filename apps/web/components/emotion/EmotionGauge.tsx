'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Zap, TrendingUp, TrendingDown } from 'lucide-react'

interface EmotionGaugeProps {
  emotion: string | null
  valence: number | null
  arousal: number | null
  confidence: number | null
}

export default function EmotionGauge({ emotion, valence, arousal, confidence }: EmotionGaugeProps) {
  const [animatedValence, setAnimatedValence] = useState(0)
  const [animatedArousal, setAnimatedArousal] = useState(0)

  // Animate values smoothly
  useEffect(() => {
    if (valence !== null) {
      const timer = setTimeout(() => {
        setAnimatedValence(valence)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [valence])

  useEffect(() => {
    if (arousal !== null) {
      const timer = setTimeout(() => {
        setAnimatedArousal(arousal)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [arousal])

  const getEmotionColor = (emotion: string) => {
    const colors = {
      'happiness': 'bg-yellow-500',
      'sadness': 'bg-blue-500',
      'anger': 'bg-red-500',
      'fear': 'bg-purple-500',
      'surprise': 'bg-orange-500',
      'disgust': 'bg-green-500',
      'contempt': 'bg-gray-500',
      'neutral': 'bg-gray-400',
      'no_face': 'bg-gray-300',
      'error': 'bg-red-300'
    }
    return colors[emotion as keyof typeof colors] || 'bg-gray-400'
  }

  const getEmotionIcon = (emotion: string) => {
    if (emotion === 'happiness') return '😊'
    if (emotion === 'sadness') return '😢'
    if (emotion === 'anger') return '😠'
    if (emotion === 'fear') return '😨'
    if (emotion === 'surprise') return '😲'
    if (emotion === 'disgust') return '🤢'
    if (emotion === 'contempt') return '😏'
    if (emotion === 'neutral') return '😐'
    return '❓'
  }

  const formatValue = (value: number) => {
    return (value * 100).toFixed(0)
  }

  const getValenceColor = (value: number) => {
    if (value > 0.3) return 'text-green-600'
    if (value < -0.3) return 'text-red-600'
    return 'text-gray-600'
  }

  const getArousalColor = (value: number) => {
    if (value > 0.3) return 'text-orange-600'
    if (value < -0.3) return 'text-blue-600'
    return 'text-gray-600'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Current Emotion */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Current Emotion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl mb-2">
              {emotion ? getEmotionIcon(emotion) : '❓'}
            </div>
            <div className="text-lg font-semibold mb-1">
              {emotion || 'Unknown'}
            </div>
            {confidence && (
              <div className="text-sm text-gray-500">
                Confidence: {(confidence * 100).toFixed(0)}%
              </div>
            )}
            <Badge 
              className={`mt-2 ${emotion ? getEmotionColor(emotion) : 'bg-gray-400'}`}
            >
              {emotion || 'No Detection'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Valence Gauge */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {valence && valence > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            Valence (Mood)
          </CardTitle>
          <CardDescription className="text-xs">
            Negative ← → Positive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              <span className={valence ? getValenceColor(valence) : 'text-gray-400'}>
                {valence ? formatValue(valence) : '0'}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  valence ? (valence > 0 ? 'bg-green-500' : 'bg-red-500') : 'bg-gray-400'
                }`}
                style={{ 
                  width: valence ? `${Math.abs(valence) * 100}%` : '0%',
                  marginLeft: valence && valence < 0 ? `${50 - Math.abs(valence) * 50}%` : '0%'
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Negative</span>
              <span>Neutral</span>
              <span>Positive</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arousal Gauge */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Arousal (Energy)
          </CardTitle>
          <CardDescription className="text-xs">
            Calm ← → Excited
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              <span className={arousal ? getArousalColor(arousal) : 'text-gray-400'}>
                {arousal ? formatValue(arousal) : '0'}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  arousal ? (arousal > 0 ? 'bg-orange-500' : 'bg-blue-500') : 'bg-gray-400'
                }`}
                style={{ 
                  width: arousal ? `${Math.abs(arousal) * 100}%` : '0%',
                  marginLeft: arousal && arousal < 0 ? `${50 - Math.abs(arousal) * 50}%` : '0%'
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Calm</span>
              <span>Neutral</span>
              <span>Excited</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combined Emotional State */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Emotional State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold mb-1">Mood</div>
              <div className={`text-sm ${
                valence && valence > 0.3 ? 'text-green-600' :
                valence && valence < -0.3 ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {valence && valence > 0.3 ? 'Positive' :
                 valence && valence < -0.3 ? 'Negative' :
                 'Neutral'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold mb-1">Energy</div>
              <div className={`text-sm ${
                arousal && arousal > 0.3 ? 'text-orange-600' :
                arousal && arousal < -0.3 ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                {arousal && arousal > 0.3 ? 'High Energy' :
                 arousal && arousal < -0.3 ? 'Low Energy' :
                 'Balanced'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
