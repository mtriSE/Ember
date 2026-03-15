import { Check, Copy, Download, FileJson, FileText, X } from 'lucide-react'
import { useState } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  messages: Message[]
  conversationTitle?: string
}

type ExportFormat = 'json' | 'markdown' | 'text'

export default function ExportDialog({
  isOpen,
  onClose,
  messages,
  conversationTitle = 'Conversation',
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('markdown')
  const [includeTimestamps, setIncludeTimestamps] = useState(true)
  const [includeSystemMessages, setIncludeSystemMessages] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const filteredMessages = includeSystemMessages
    ? messages
    : messages.filter(m => m.role !== 'system')

  const generateExport = (): string => {
    switch (format) {
      case 'json':
        return JSON.stringify(
          {
            title: conversationTitle,
            exportedAt: new Date().toISOString(),
            messages: filteredMessages.map(m => ({
              role: m.role,
              content: m.content,
              ...(includeTimestamps && { timestamp: m.timestamp }),
            })),
          },
          null,
          2
        )

      case 'markdown':
        const mdLines = [
          `# ${conversationTitle}`,
          '',
          `*Exported on ${new Date().toLocaleString()}*`,
          '',
          '---',
          '',
        ]
        for (const msg of filteredMessages) {
          const roleLabel = msg.role === 'user' ? '**You**' : msg.role === 'assistant' ? '**Assistant**' : '*System*'
          const timestamp = includeTimestamps
            ? ` *(${new Date(msg.timestamp).toLocaleTimeString()})*`
            : ''
          mdLines.push(`### ${roleLabel}${timestamp}`)
          mdLines.push('')
          mdLines.push(msg.content)
          mdLines.push('')
          mdLines.push('---')
          mdLines.push('')
        }
        return mdLines.join('\n')

      case 'text':
        const textLines = [
          conversationTitle.toUpperCase(),
          '='.repeat(conversationTitle.length),
          '',
          `Exported: ${new Date().toLocaleString()}`,
          '',
          '-'.repeat(40),
          '',
        ]
        for (const msg of filteredMessages) {
          const roleLabel = msg.role === 'user' ? 'YOU' : msg.role === 'assistant' ? 'ASSISTANT' : 'SYSTEM'
          const timestamp = includeTimestamps
            ? ` [${new Date(msg.timestamp).toLocaleTimeString()}]`
            : ''
          textLines.push(`${roleLabel}${timestamp}:`)
          textLines.push(msg.content)
          textLines.push('')
          textLines.push('-'.repeat(40))
          textLines.push('')
        }
        return textLines.join('\n')

      default:
        return ''
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateExport())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    const content = generateExport()
    const extensions: Record<ExportFormat, string> = {
      json: 'json',
      markdown: 'md',
      text: 'txt',
    }
    const mimeTypes: Record<ExportFormat, string> = {
      json: 'application/json',
      markdown: 'text/markdown',
      text: 'text/plain',
    }

    const blob = new Blob([content], { type: mimeTypes[format] })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${conversationTitle.toLowerCase().replace(/\s+/g, '-')}.${extensions[format]}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatOptions: { id: ExportFormat; label: string; icon: React.ReactNode; description: string }[] = [
    {
      id: 'markdown',
      label: 'Markdown',
      icon: <FileText className="w-5 h-5" />,
      description: 'Formatted text with headers',
    },
    {
      id: 'json',
      label: 'JSON',
      icon: <FileJson className="w-5 h-5" />,
      description: 'Structured data format',
    },
    {
      id: 'text',
      label: 'Plain Text',
      icon: <FileText className="w-5 h-5" />,
      description: 'Simple text format',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Export Conversation</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close export dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {formatOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setFormat(option.id)}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors
                    ${format === option.id
                      ? 'border-orange-600 bg-orange-700/10'
                      : 'border-gray-700 hover:border-gray-600'
                    }
                  `}
                >
                  <span className={format === option.id ? 'text-orange-500' : 'text-gray-400'}>
                    {option.icon}
                  </span>
                  <span className={`text-sm font-medium ${format === option.id ? 'text-white' : 'text-gray-400'}`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-300">Include timestamps</span>
              <button
                onClick={() => setIncludeTimestamps(!includeTimestamps)}
                className={`
                  relative w-10 h-5 rounded-full transition-colors
                  ${includeTimestamps ? 'bg-orange-600' : 'bg-gray-600'}
                `}
                role="switch"
                aria-checked={includeTimestamps}
                aria-label="Include timestamps"
              >
                <span
                  className={`
                    absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform
                    ${includeTimestamps ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-300">Include system messages</span>
              <button
                onClick={() => setIncludeSystemMessages(!includeSystemMessages)}
                className={`
                  relative w-10 h-5 rounded-full transition-colors
                  ${includeSystemMessages ? 'bg-orange-600' : 'bg-gray-600'}
                `}
                role="switch"
                aria-checked={includeSystemMessages}
                aria-label="Include system messages"
              >
                <span
                  className={`
                    absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform
                    ${includeSystemMessages ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </label>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Preview
            </label>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 max-h-48 overflow-auto">
              <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono">
                {generateExport().slice(0, 500)}
                {generateExport().length > 500 && '...'}
              </pre>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {filteredMessages.length} messages • {generateExport().length.toLocaleString()} characters
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-orange-700 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  )
}