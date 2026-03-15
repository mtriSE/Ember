import { BarChart3, Bot, Flame, Loader2, MessageSquare, Send, Settings, Trash2, User } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import CostDashboard from './components/CostDashboard'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface Model {
  id: string
  name: string
  provider: string
}

interface ServerInfo {
  name: string
  version: string
  llm_provider: string
  default_model: string
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [models, setModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [activeView, setActiveView] = useState<'chat' | 'dashboard'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Fetch server info and models on mount
  useEffect(() => {
    fetchServerInfo()
    fetchModels()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const fetchServerInfo = async () => {
    try {
      const res = await fetch('/api/v1/info')
      const data = await res.json()
      setServerInfo(data)
      setSelectedModel(data.default_model)
    } catch (err) {
      console.error('Failed to fetch server info:', err)
    }
  }

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/v1/models')
      const data = await res.json()
      setModels(data.models)
    } catch (err) {
      console.error('Failed to fetch models:', err)
    }
  }

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setStreamingContent('')

    try {
      // Use streaming endpoint
      const response = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          model: selectedModel,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!response.ok) throw new Error('Request failed')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.event === 'chunk' && data.content) {
                fullContent += data.content
                setStreamingContent(fullContent)
              } else if (data.event === 'error') {
                throw new Error(data.error)
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fullContent,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setStreamingContent('')
    } catch (err) {
      console.error('Chat error:', err)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, selectedModel])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setStreamingContent('')
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Flame className="w-8 h-8 text-orange-500" />
          <div>
            <h1 className="text-xl font-bold text-white">Ember AI</h1>
            {serverInfo && (
              <p className="text-xs text-gray-400">
                v{serverInfo.version} | {serverInfo.llm_provider}
              </p>
            )}
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-gray-700/50 rounded-lg p-1">
          <button
            onClick={() => setActiveView('chat')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeView === 'chat'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Chat"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </button>
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeView === 'dashboard'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Dashboard"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeView === 'chat' && (
            <>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="px-3 py-1.5 text-sm bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                title="Select Model"
                aria-label="Select Model"
              >
                {models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={clearChat}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                title="Clear Chat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <div className="flex-1 overflow-hidden">
          <CostDashboard />
        </div>
      )}

      {/* Chat View */}
      {activeView === 'chat' && (
        <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingContent && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Flame className="w-16 h-16 mb-4 text-orange-500/50" />
            <p className="text-lg">Start a conversation with Ember</p>
            <p className="text-sm mt-2">Type a message below to begin</p>
          </div>
        )}

        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-orange-500" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="markdown-content">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {/* Streaming message */}
        {streamingContent && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-orange-500" />
            </div>
            <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-gray-800 text-gray-100">
              <div className="markdown-content">
                <ReactMarkdown>{streamingContent}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingContent && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-orange-500" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-gray-800">
              <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            style={{ minHeight: '48px', maxHeight: '200px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
        </>
      )}
    </div>
  )
}
