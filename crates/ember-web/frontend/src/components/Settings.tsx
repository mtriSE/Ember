import {
    AlertCircle,
    Check,
    ChevronRight,
    Cpu,
    Globe,
    Key,
    Moon,
    Palette,
    Save,
    Server,
    Sun,
    X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface ProviderConfig {
  id: string
  name: string
  enabled: boolean
  apiKey?: string
  baseUrl?: string
  models: string[]
}

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
}

const DEFAULT_PROVIDERS: ProviderConfig[] = [
  { id: 'openai', name: 'OpenAI', enabled: false, models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] },
  { id: 'anthropic', name: 'Anthropic', enabled: false, models: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'] },
  { id: 'ollama', name: 'Ollama (Local)', enabled: false, baseUrl: 'http://localhost:11434', models: [] },
  { id: 'groq', name: 'Groq', enabled: false, models: ['llama-3.1-70b', 'mixtral-8x7b'] },
  { id: 'gemini', name: 'Google Gemini', enabled: false, models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
  { id: 'deepseek', name: 'DeepSeek', enabled: false, models: ['deepseek-chat', 'deepseek-coder'] },
  { id: 'mistral', name: 'Mistral AI', enabled: false, models: ['mistral-large', 'mistral-medium'] },
  { id: 'openrouter', name: 'OpenRouter', enabled: false, models: [] },
  { id: 'xai', name: 'xAI (Grok)', enabled: false, models: ['grok-beta'] },
]

type SettingsTab = 'general' | 'providers' | 'appearance' | 'advanced'

export default function Settings({
  isOpen,
  onClose,
  theme,
  onThemeChange,
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [providers, setProviders] = useState<ProviderConfig[]>(DEFAULT_PROVIDERS)
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Settings state
  const [settings, setSettings] = useState({
    streamResponses: true,
    showTimestamps: true,
    enableSounds: false,
    autoSaveConversations: true,
    maxContextLength: 128000,
    temperature: 0.7,
    systemPrompt: 'You are a helpful AI assistant.',
  })

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('ember-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch {
        // Ignore parse errors
      }
    }

    const savedProviders = localStorage.getItem('ember-providers')
    if (savedProviders) {
      try {
        setProviders(JSON.parse(savedProviders))
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      localStorage.setItem('ember-settings', JSON.stringify(settings))
      localStorage.setItem('ember-providers', JSON.stringify(providers))
      setHasChanges(false)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const updateProvider = (id: string, updates: Partial<ProviderConfig>) => {
    setProviders(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    )
    setHasChanges(true)
  }

  if (!isOpen) return null

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Cpu className="w-4 h-4" /> },
    { id: 'providers', label: 'Providers', icon: <Server className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'advanced', label: 'Advanced', icon: <Globe className="w-4 h-4" /> },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="flex items-center gap-2 px-4 py-2 bg-orange-700 hover:bg-orange-600 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : saveStatus === 'saved' ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved
                  </>
                ) : saveStatus === 'error' ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Error
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <nav className="w-48 border-r border-gray-700 p-4 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'bg-orange-700/20 text-orange-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">General Settings</h3>
                  
                  <div className="space-y-4">
                    <ToggleSetting
                      label="Stream responses"
                      description="Show responses as they are generated"
                      checked={settings.streamResponses}
                      onChange={v => updateSetting('streamResponses', v)}
                    />
                    
                    <ToggleSetting
                      label="Show timestamps"
                      description="Display timestamps on messages"
                      checked={settings.showTimestamps}
                      onChange={v => updateSetting('showTimestamps', v)}
                    />
                    
                    <ToggleSetting
                      label="Enable sounds"
                      description="Play sounds for notifications"
                      checked={settings.enableSounds}
                      onChange={v => updateSetting('enableSounds', v)}
                    />
                    
                    <ToggleSetting
                      label="Auto-save conversations"
                      description="Automatically save conversations to history"
                      checked={settings.autoSaveConversations}
                      onChange={v => updateSetting('autoSaveConversations', v)}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-4">System Prompt</h3>
                  <textarea
                    value={settings.systemPrompt}
                    onChange={e => updateSetting('systemPrompt', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent resize-none"
                    placeholder="Enter a default system prompt..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'providers' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white mb-4">LLM Providers</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Configure your API keys and settings for each provider.
                </p>

                {providers.map(provider => (
                  <div
                    key={provider.id}
                    className="border border-gray-700 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedProvider(
                          expandedProvider === provider.id ? null : provider.id
                        )
                      }
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            provider.enabled ? 'bg-green-500' : 'bg-gray-500'
                          }`}
                        />
                        <span className="font-medium text-white">
                          {provider.name}
                        </span>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedProvider === provider.id ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {expandedProvider === provider.id && (
                      <div className="px-4 py-4 space-y-4 bg-gray-850">
                        <ToggleSetting
                          label="Enable provider"
                          description={`Use ${provider.name} for chat completions`}
                          checked={provider.enabled}
                          onChange={v => updateProvider(provider.id, { enabled: v })}
                        />

                        {provider.id !== 'ollama' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              API Key
                            </label>
                            <div className="relative">
                              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              <input
                                type="password"
                                value={provider.apiKey || ''}
                                onChange={e =>
                                  updateProvider(provider.id, {
                                    apiKey: e.target.value,
                                  })
                                }
                                placeholder={`Enter ${provider.name} API key...`}
                                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                              />
                            </div>
                          </div>
                        )}

                        {(provider.id === 'ollama' || provider.id === 'openrouter') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Base URL
                            </label>
                            <input
                              type="url"
                              value={provider.baseUrl || ''}
                              onChange={e =>
                                updateProvider(provider.id, {
                                  baseUrl: e.target.value,
                                })
                              }
                              placeholder="http://localhost:11434"
                              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                            />
                          </div>
                        )}

                        {provider.models.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Available Models
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {provider.models.map(model => (
                                <span
                                  key={model}
                                  className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                                >
                                  {model}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white mb-4">Appearance</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Theme
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => onThemeChange('light')}
                      className={`
                        flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors
                        ${theme === 'light'
                          ? 'border-orange-600 bg-orange-700/10'
                          : 'border-gray-700 hover:border-gray-600'
                        }
                      `}
                    >
                      <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-orange-500' : 'text-gray-400'}`} />
                      <span className={theme === 'light' ? 'text-white' : 'text-gray-400'}>
                        Light
                      </span>
                    </button>
                    <button
                      onClick={() => onThemeChange('dark')}
                      className={`
                        flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors
                        ${theme === 'dark'
                          ? 'border-orange-600 bg-orange-700/10'
                          : 'border-gray-700 hover:border-gray-600'
                        }
                      `}
                    >
                      <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-orange-500' : 'text-gray-400'}`} />
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-400'}>
                        Dark
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white mb-4">Advanced Settings</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Context Length
                  </label>
                  <input
                    type="number"
                    value={settings.maxContextLength}
                    onChange={e =>
                      updateSetting('maxContextLength', parseInt(e.target.value) || 0)
                    }
                    min={1000}
                    max={200000}
                    step={1000}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum number of tokens to include in context
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Temperature: {settings.temperature}
                  </label>
                  <input
                    type="range"
                    value={settings.temperature}
                    onChange={e =>
                      updateSetting('temperature', parseFloat(e.target.value))
                    }
                    min={0}
                    max={2}
                    step={0.1}
                    className="w-full accent-orange-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Precise (0)</span>
                    <span>Creative (2)</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">
                    Danger Zone
                  </h4>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          'Reset all settings to defaults? This cannot be undone.'
                        )
                      ) {
                        localStorage.removeItem('ember-settings')
                        localStorage.removeItem('ember-providers')
                        window.location.reload()
                      }
                    }}
                    className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900 rounded-lg text-sm transition-colors"
                  >
                    Reset All Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Toggle Setting Component
function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`
          relative w-11 h-6 rounded-full transition-colors
          ${checked ? 'bg-orange-600' : 'bg-gray-600'}
        `}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span
          className={`
            absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  )
}