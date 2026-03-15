import { MessageSquare, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import ConversationItem from './ConversationItem'

export interface Conversation {
  id: string
  title: string
  preview: string
  timestamp: Date
  messageCount: number
  model?: string
}

interface ConversationListProps {
  conversations: Conversation[]
  activeConversationId?: string
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  onRenameConversation: (id: string, title: string) => void
}

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedConversations = groupByDate(filteredConversations)

  const handleDelete = (id: string) => {
    if (showDeleteConfirm === id) {
      onDeleteConversation(id)
      setShowDeleteConfirm(null)
    } else {
      setShowDeleteConfirm(id)
      // Auto-reset after 3 seconds
      setTimeout(() => setShowDeleteConfirm(null), 3000)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-700 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(groupedConversations).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4">
            <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm text-center">
              {searchQuery
                ? 'No conversations found'
                : 'No conversations yet'}
            </p>
            <p className="text-xs text-center mt-1 text-gray-600">
              {searchQuery
                ? 'Try a different search term'
                : 'Start a new chat to begin'}
            </p>
          </div>
        ) : (
          Object.entries(groupedConversations).map(([group, items]) => (
            <div key={group}>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-900/50 sticky top-0">
                {group}
              </div>
              {items.map(conv => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeConversationId}
                  isDeleteConfirm={showDeleteConfirm === conv.id}
                  onSelect={() => onSelectConversation(conv.id)}
                  onDelete={() => handleDelete(conv.id)}
                  onRename={title => onRenameConversation(conv.id, title)}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer - Clear All */}
      {conversations.length > 0 && (
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => {
              if (window.confirm('Delete all conversations? This cannot be undone.')) {
                conversations.forEach(c => onDeleteConversation(c.id))
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      )}
    </div>
  )
}

// Helper function to group conversations by date
function groupByDate(conversations: Conversation[]): Record<string, Conversation[]> {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const groups: Record<string, Conversation[]> = {}

  // Sort by timestamp descending
  const sorted = [...conversations].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  for (const conv of sorted) {
    const date = new Date(conv.timestamp)
    let group: string

    if (date >= today) {
      group = 'Today'
    } else if (date >= yesterday) {
      group = 'Yesterday'
    } else if (date >= weekAgo) {
      group = 'This Week'
    } else if (date >= monthAgo) {
      group = 'This Month'
    } else {
      group = 'Older'
    }

    if (!groups[group]) groups[group] = []
    groups[group].push(conv)
  }

  return groups
}