import { ChevronDown, Cpu, Zap } from 'lucide-react'
import { useState } from 'react'

interface Model {
  id: string
  name: string
  provider: string
  description?: string
  contextWindow?: number
  speed?: 'fast' | 'medium' | 'slow'
}

interface ModelSelectorProps {
  models: Model[]
  selectedModel: string
  onModelChange: (modelId: string) => void
  disabled?: boolean
}

const PROVIDER_COLORS: Record<string, string> = {
  openai: 'bg-green-600',
  anthropic: 'bg-orange-600',
  ollama: 'bg-blue-600',
  groq: 'bg-purple-600',
  gemini: 'bg-red-600',
  deepseek: 'bg-cyan-600',
  mistral: 'bg-yellow-600',
  openrouter: 'bg-pink-600',
  xai: 'bg-indigo-600',
}

export default function ModelSelector({
  models,
  selectedModel,
  onModelChange,
  disabled = false,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentModel = models.find(m => m.id === selectedModel)

  // Group models by provider
  const groupedModels = models.reduce((acc, model) => {
    const provider = model.provider || 'other'
    if (!acc[provider]) acc[provider] = []
    acc[provider].push(model)
    return acc
  }, {} as Record<string, Model[]>)

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 min-w-[200px]
          bg-gray-700 border border-gray-600 rounded-lg
          text-white text-sm
          hover:bg-gray-600 hover:border-gray-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        `}
      >
        {currentModel && (
          <span
            className={`w-2 h-2 rounded-full ${
              PROVIDER_COLORS[currentModel.provider] || 'bg-gray-500'
            }`}
          />
        )}
        <span className="flex-1 text-left truncate">
          {currentModel?.name || selectedModel || 'Select model'}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute z-20 mt-2 w-80 max-h-96 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
            {Object.entries(groupedModels).map(([provider, providerModels]) => (
              <div key={provider}>
                {/* Provider Header */}
                <div className="sticky top-0 px-3 py-2 bg-gray-900/90 backdrop-blur border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        PROVIDER_COLORS[provider] || 'bg-gray-500'
                      }`}
                    />
                    <span className="text-xs font-semibold text-gray-400 uppercase">
                      {provider}
                    </span>
                  </div>
                </div>

                {/* Models */}
                {providerModels.map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onModelChange(model.id)
                      setIsOpen(false)
                    }}
                    className={`
                      w-full px-3 py-2 text-left
                      hover:bg-gray-700 transition-colors
                      ${selectedModel === model.id ? 'bg-gray-700' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">{model.name}</span>
                      <div className="flex items-center gap-1">
                        {model.speed === 'fast' && (
                          <Zap className="w-3 h-3 text-yellow-500" aria-label="Fast" />
                        )}
                        {model.contextWindow && (
                          <span className="text-xs text-gray-500">
                            {Math.round(model.contextWindow / 1000)}K
                          </span>
                        )}
                      </div>
                    </div>
                    {model.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {model.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            ))}

            {models.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                <Cpu className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No models available</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}