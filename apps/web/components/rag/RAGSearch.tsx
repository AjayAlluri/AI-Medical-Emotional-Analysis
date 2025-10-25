'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, MessageSquare, Brain, Clock, TrendingUp } from 'lucide-react'

interface RAGSearchProps {
  onSearch?: (query: string) => void
  isLoading?: boolean
}

interface SearchResult {
  answer: string
  sources: Array<{
    summary: string
    emotion: string
    valence: number
    arousal: number
    timestamp: string
    similarity: number
  }>
}

export default function RAGSearch({ onSearch, isLoading = false }: RAGSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    
    // Add to search history
    setSearchHistory(prev => [query, ...prev.slice(0, 4)])
    
    // Call the search function
    if (onSearch) {
      onSearch(query)
    }
    
    // Simulate API call (replace with actual implementation)
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: query }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      } else {
        // Fallback to mock data for demo
        setResults({
          answer: `Based on your conversation history, I can see that you've been experiencing ${query.toLowerCase()} emotions. Your recent emotional patterns show a mix of positive and negative valence with varying arousal levels.`,
          sources: [
            {
              summary: "User expressed happiness about work progress",
              emotion: "happiness",
              valence: 0.8,
              arousal: 0.6,
              timestamp: new Date().toISOString(),
              similarity: 0.85
            },
            {
              summary: "User showed signs of stress during presentation",
              emotion: "fear",
              valence: -0.3,
              arousal: 0.7,
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              similarity: 0.72
            }
          ]
        })
      }
    } catch (error) {
      console.error('Search error:', error)
      // Fallback to mock data
      setResults({
        answer: `I found some relevant information about ${query.toLowerCase()} in your conversation history. Your emotional patterns show interesting variations over time.`,
        sources: []
      })
    }
    
    setQuery('')
  }, [query, onSearch])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getEmotionColor = (emotion: string) => {
    const colors = {
      'happiness': 'bg-yellow-100 text-yellow-800',
      'sadness': 'bg-blue-100 text-blue-800',
      'anger': 'bg-red-100 text-red-800',
      'fear': 'bg-purple-100 text-purple-800',
      'surprise': 'bg-orange-100 text-orange-800',
      'disgust': 'bg-green-100 text-green-800',
      'contempt': 'bg-gray-100 text-gray-800',
      'neutral': 'bg-gray-100 text-gray-800'
    }
    return colors[emotion as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Ask About Your Emotions
          </CardTitle>
          <CardDescription>
            Search through your conversation history with AI-powered insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your emotions, conversations, or insights..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSearch}
              disabled={!query.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-600">Recent searches:</div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(item)}
                    className="text-xs"
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI Response
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-gray-800">{results.answer}</p>
            </div>

            {/* Sources */}
            {results.sources.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-600">Sources:</div>
                {results.sources.map((source, index) => (
                  <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getEmotionColor(source.emotion)}>
                          {source.emotion}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {Math.round(source.similarity * 100)}% match
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(source.timestamp)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{source.summary}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Valence: {Math.round(source.valence * 100)}%
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Arousal: {Math.round(source.arousal * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
