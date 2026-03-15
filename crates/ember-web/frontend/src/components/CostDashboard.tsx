import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    BarChart3,
    Bot,
    Brain,
    Clock,
    DollarSign,
    Eye,
    Filter,
    Lightbulb,
    RefreshCw,
    Settings2,
    Sparkles,
    TrendingUp,
    Wrench,
    Zap,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

// Types
interface UsageStats {
  total_requests: number
  total_input_tokens: number
  total_output_tokens: number
  total_cost: number
  daily_cost: number
  hourly_cost: number
  avg_cost_per_request: number
  avg_tokens_per_request: number
  cost_by_model: Record<string, number>
  cost_by_provider: Record<string, number>
  requests_by_model: Record<string, number>
}

interface BudgetConfig {
  max_cost_per_request: number | null
  max_cost_per_hour: number | null
  max_cost_per_day: number | null
  max_total_cost: number | null
  alert_threshold: number
  enforce_limits: boolean
}

interface ExtendedModel {
  id: string
  name: string
  provider: string
  context_length: number
  max_output_tokens: number
  input_price_per_1k: number
  output_price_per_1k: number
  cached_input_price_per_1k: number | null
  supports_tools: boolean
  supports_vision: boolean
  supports_reasoning: boolean
  supports_json_mode: boolean
  supports_streaming: boolean
  description: string | null
}

interface Recommendation {
  description: string
  potential_savings: number
  alternative_model: string | null
  priority: number
}

// Format currency
const formatCurrency = (value: number): string => {
  if (value < 0.01) return `$${value.toFixed(6)}`
  if (value < 1) return `$${value.toFixed(4)}`
  return `$${value.toFixed(2)}`
}

// Format number with commas
const formatNumber = (value: number): string => {
  return value.toLocaleString()
}

// Provider colors
const providerColors: Record<string, string> = {
  openai: 'bg-green-500',
  anthropic: 'bg-orange-500',
  google: 'bg-blue-500',
  mistral: 'bg-purple-500',
  groq: 'bg-yellow-500',
  deepseek: 'bg-cyan-500',
  xai: 'bg-red-500',
  openrouter: 'bg-pink-500',
  ollama: 'bg-gray-500',
}

// Stats Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  color = 'orange',
}: {
  icon: React.ElementType
  label: string
  value: string
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
  color?: string
}) {
  const colorClasses: Record<string, string> = {
    orange: 'bg-orange-500/20 text-orange-500',
    green: 'bg-green-500/20 text-green-500',
    blue: 'bg-blue-500/20 text-blue-500',
    purple: 'bg-purple-500/20 text-purple-500',
    red: 'bg-red-500/20 text-red-500',
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
        </div>
        {trend && (
          <div className={`flex items-center ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
            {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : trend === 'down' ? <ArrowDown className="w-4 h-4" /> : null}
          </div>
        )}
      </div>
    </div>
  )
}

// Progress Bar Component
function BudgetProgress({
  label,
  current,
  limit,
  alertThreshold,
}: {
  label: string
  current: number
  limit: number | null
  alertThreshold: number
}) {
  if (!limit) return null

  const percentage = Math.min((current / limit) * 100, 100)
  const isWarning = percentage >= alertThreshold * 100
  const isExceeded = percentage >= 100

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className={isExceeded ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-gray-300'}>
          {formatCurrency(current)} / {formatCurrency(limit)}
        </span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isExceeded ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-orange-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isWarning && !isExceeded && (
        <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Approaching budget limit
        </p>
      )}
      {isExceeded && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Budget exceeded
        </p>
      )}
    </div>
  )
}

// Model Card Component
function ModelCard({ model }: { model: ExtendedModel }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-orange-500/50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-white">{model.name}</h4>
          <p className="text-xs text-gray-500">{model.id}</p>
        </div>
        <span className={`px-2 py-0.5 rounded text-xs ${providerColors[model.provider] || 'bg-gray-500'} bg-opacity-20`}>
          {model.provider}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div>
          <span className="text-gray-500">Input:</span>
          <span className="text-gray-300 ml-1">{formatCurrency(model.input_price_per_1k)}/1K</span>
        </div>
        <div>
          <span className="text-gray-500">Output:</span>
          <span className="text-gray-300 ml-1">{formatCurrency(model.output_price_per_1k)}/1K</span>
        </div>
        <div>
          <span className="text-gray-500">Context:</span>
          <span className="text-gray-300 ml-1">{formatNumber(model.context_length)}</span>
        </div>
        <div>
          <span className="text-gray-500">Max Out:</span>
          <span className="text-gray-300 ml-1">{formatNumber(model.max_output_tokens)}</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1">
        {model.supports_tools && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs">
            <Wrench className="w-3 h-3" /> Tools
          </span>
        )}
        {model.supports_vision && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded text-xs">
            <Eye className="w-3 h-3" /> Vision
          </span>
        )}
        {model.supports_reasoning && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-500/10 text-orange-400 rounded text-xs">
            <Brain className="w-3 h-3" /> Reasoning
          </span>
        )}
        {model.supports_json_mode && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded text-xs">
            <Sparkles className="w-3 h-3" /> JSON
          </span>
        )}
      </div>
    </div>
  )
}

// Recommendation Card Component
function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const priorityColors = {
    1: 'border-red-500/50 bg-red-500/5',
    2: 'border-yellow-500/50 bg-yellow-500/5',
    3: 'border-blue-500/50 bg-blue-500/5',
  }

  return (
    <div className={`rounded-lg p-4 border ${priorityColors[recommendation.priority as 1 | 2 | 3] || priorityColors[3]}`}>
      <div className="flex items-start gap-3">
        <Lightbulb className={`w-5 h-5 mt-0.5 ${recommendation.priority === 1 ? 'text-red-500' : recommendation.priority === 2 ? 'text-yellow-500' : 'text-blue-500'}`} />
        <div className="flex-1">
          <p className="text-gray-300 text-sm">{recommendation.description}</p>
          <div className="flex items-center gap-4 mt-2">
            {recommendation.potential_savings > 0 && (
              <span className="text-green-500 text-xs">
                Potential savings: {formatCurrency(recommendation.potential_savings)}
              </span>
            )}
            {recommendation.alternative_model && (
              <span className="text-gray-500 text-xs">
                Try: <code className="text-orange-400">{recommendation.alternative_model}</code>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Dashboard Component
export default function CostDashboard() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [budget, setBudget] = useState<BudgetConfig | null>(null)
  const [models, setModels] = useState<ExtendedModel[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'budget'>('overview')
  const [modelFilter, setModelFilter] = useState('')
  const [providerFilter, setProviderFilter] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, budgetRes, modelsRes, recsRes] = await Promise.all([
        fetch('/api/v1/usage'),
        fetch('/api/v1/budget'),
        fetch('/api/v1/models/extended'),
        fetch('/api/v1/recommendations?model=gpt-4o&input_tokens=2000&output_tokens=1000'),
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (budgetRes.ok) setBudget(await budgetRes.json())
      if (modelsRes.ok) {
        const data = await modelsRes.json()
        setModels(data.models)
      }
      if (recsRes.ok) {
        const data = await recsRes.json()
        setRecommendations(data.recommendations)
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Get unique providers
  const providers = [...new Set(models.map(m => m.provider))]

  // Filter models
  const filteredModels = models.filter(m => {
    const matchesSearch = !modelFilter || 
      m.name.toLowerCase().includes(modelFilter.toLowerCase()) ||
      m.id.toLowerCase().includes(modelFilter.toLowerCase())
    const matchesProvider = !providerFilter || m.provider === providerFilter
    return matchesSearch && matchesProvider
  })

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-orange-500" />
          <div>
            <h2 className="text-xl font-bold text-white">Cost Dashboard</h2>
            <p className="text-sm text-gray-400">Monitor usage and manage budgets</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {(['overview', 'models', 'budget'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-orange-500/20 text-orange-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={DollarSign}
              label="Total Spent"
              value={formatCurrency(stats.total_cost)}
              subValue={`${formatCurrency(stats.avg_cost_per_request)} avg/request`}
              color="orange"
            />
            <StatCard
              icon={Clock}
              label="Today"
              value={formatCurrency(stats.daily_cost)}
              subValue={`${formatCurrency(stats.hourly_cost)} this hour`}
              color="blue"
            />
            <StatCard
              icon={Bot}
              label="Total Requests"
              value={formatNumber(stats.total_requests)}
              subValue={`${formatNumber(Math.round(stats.avg_tokens_per_request))} avg tokens`}
              color="green"
            />
            <StatCard
              icon={Zap}
              label="Total Tokens"
              value={formatNumber(stats.total_input_tokens + stats.total_output_tokens)}
              subValue={`${formatNumber(stats.total_input_tokens)} in / ${formatNumber(stats.total_output_tokens)} out`}
              color="purple"
            />
          </div>

          {/* Cost by Provider */}
          {Object.keys(stats.cost_by_provider).length > 0 && (
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Cost by Provider
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.cost_by_provider)
                  .sort(([, a], [, b]) => b - a)
                  .map(([provider, cost]) => {
                    const percentage = stats.total_cost > 0 ? (cost / stats.total_cost) * 100 : 0
                    return (
                      <div key={provider}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300 capitalize">{provider}</span>
                          <span className="text-gray-400">{formatCurrency(cost)} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${providerColors[provider] || 'bg-gray-500'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Cost Optimization Recommendations
              </h3>
              {recommendations.map((rec, i) => (
                <RecommendationCard key={i} recommendation={rec} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Models Tab */}
      {activeTab === 'models' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search models..."
                value={modelFilter}
                onChange={e => setModelFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <select
              value={providerFilter || ''}
              onChange={e => setProviderFilter(e.target.value || null)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Providers</option>
              {providers.map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Model Count */}
          <p className="text-sm text-gray-400">
            Showing {filteredModels.length} of {models.length} models
          </p>

          {/* Model Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map(model => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        </div>
      )}

      {/* Budget Tab */}
      {activeTab === 'budget' && budget && stats && (
        <div className="space-y-6">
          {/* Budget Progress */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-500" />
              Budget Status
            </h3>
            <BudgetProgress
              label="Hourly Budget"
              current={stats.hourly_cost}
              limit={budget.max_cost_per_hour}
              alertThreshold={budget.alert_threshold}
            />
            <BudgetProgress
              label="Daily Budget"
              current={stats.daily_cost}
              limit={budget.max_cost_per_day}
              alertThreshold={budget.alert_threshold}
            />
            <BudgetProgress
              label="Total Budget"
              current={stats.total_cost}
              limit={budget.max_total_cost}
              alertThreshold={budget.alert_threshold}
            />
            {budget.max_cost_per_request && (
              <div className="mt-4 text-sm text-gray-400">
                Max per request: {formatCurrency(budget.max_cost_per_request)}
              </div>
            )}
          </div>

          {/* Budget Settings */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-orange-500" />
              Budget Configuration
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Daily Limit</label>
                <input
                  type="number"
                  value={budget.max_cost_per_day || ''}
                  placeholder="No limit"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Hourly Limit</label>
                <input
                  type="number"
                  value={budget.max_cost_per_hour || ''}
                  placeholder="No limit"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Alert Threshold</label>
                <input
                  type="text"
                  value={`${(budget.alert_threshold * 100).toFixed(0)}%`}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Enforce Limits</label>
                <div className={`px-3 py-2 rounded-lg ${budget.enforce_limits ? 'bg-green-500/20 text-green-500' : 'bg-gray-700 text-gray-400'}`}>
                  {budget.enforce_limits ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}