import { Check, MessageSquare, MoreVertical, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Conversation } from './ConversationList'

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  isDeleteConfirm: boolean
  onSelect: () => void
  onDelete: () => void
  onRename: (title: string) => void
}

export default function ConversationItem({
  conversation,
  isActive,
  isDeleteConfirm,
  onSelect,
  onDelete,
  onRename,
}: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(conversation.title)
  const [showMenu, setShowMenu] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSaveRename = () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      onRename(editTitle.trim())
    }
    setIsEditing(false)
  }

  const handleCancelRename = () => {
    setEditTitle(conversation.title)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveRename()
    } else if (e.key === 'Escape') {
      handleCancelRename()
    }
  }

  const formatTime = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div
      className={`
        group relative px-3 py-3 cursor-pointer transition-colors
        ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800/50'}
        ${isDeleteConfirm ? 'bg-red-900/20' : ''}
      `}
      onClick={() => !isEditing && onSelect()}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
          ${isActive ? 'bg-orange-700/30' : 'bg-gray-700/50'}
        `}>
          <MessageSquare className={`w-4 h-4 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                ref={inputRef}
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveRename}
                className="flex-1 px-2 py-0.5 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-600"
                onClick={e => e.stopPropagation()}
              />
              <button
                onClick={e => {
                  e.stopPropagation()
                  handleSaveRename()
                }}
                className="p-1 text-green-500 hover:bg-gray-700 rounded"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={e => {
                  e.stopPropagation()
                  handleCancelRename()
                }}
                className="p-1 text-gray-400 hover:bg-gray-700 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white truncate pr-2">
                  {conversation.title}
                </h3>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatTime(conversation.timestamp)}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {conversation.preview}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-600">
                  {conversation.messageCount} messages
                </span>
                {conversation.model && (
                  <span className="text-xs px-1.5 py-0.5 bg-gray-700/50 text-gray-400 rounded">
                    {conversation.model}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Actions Menu */}
        {!isEditing && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={e => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className={`
                p-1 rounded text-gray-500 hover:text-white hover:bg-gray-700 transition-opacity
                ${showMenu || isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
              `}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 py-1">
                <button
                  onClick={e => {
                    e.stopPropagation()
                    setShowMenu(false)
                    setIsEditing(true)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Rename
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onDelete()
                  }}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                    ${isDeleteConfirm
                      ? 'text-red-400 bg-red-900/30 hover:bg-red-900/50'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-red-400'
                    }
                  `}
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleteConfirm ? 'Confirm Delete' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation banner */}
      {isDeleteConfirm && !showMenu && (
        <div className="absolute inset-x-0 bottom-0 px-3 py-1 bg-red-900/50 text-xs text-red-300 text-center">
          Click delete again to confirm
        </div>
      )}
    </div>
  )
}