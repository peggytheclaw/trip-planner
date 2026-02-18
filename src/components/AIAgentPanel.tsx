import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles, Loader2 } from 'lucide-react'
import { ChatMessage, sendAgentMessage, executeToolCall } from '../lib/aiAgent'
import { useTripStore } from '../store/tripStore'
import { Trip } from '../types'
import { toast } from './Toast'

interface AIAgentPanelProps {
  isOpen: boolean
  onClose: () => void
  trip: Trip
}

const SUGGESTIONS = [
  "Plan my first full day in the city",
  "Add a dinner reservation for tonight",
  "What should I do in the morning?",
  "Add the hotel check-in",
  "Suggest activities for tomorrow",
]

export function AIAgentPanel({ isOpen, onClose, trip }: AIAgentPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Hey! I'm your Roteiro AI. I can help you plan ${trip.name} — add flights, hotels, restaurants, activities, or plan entire days. What would you like to do?`,
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addEvent, updateEvent, deleteEvent } = useTripStore()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text?: string) => {
    const content = text ?? input.trim()
    if (!content || isLoading) return

    setInput('')

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    const loadingMessage: ChatMessage = {
      id: 'loading',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    }

    setMessages(prev => [...prev, userMessage, loadingMessage])
    setIsLoading(true)

    try {
      const allMessages = [...messages, userMessage]
      const { text: responseText, toolCalls } = await sendAgentMessage(allMessages, trip)

      // Execute tool calls
      const toolResults: string[] = []
      for (const toolCall of toolCalls) {
        const result = await executeToolCall(toolCall, trip.id, {
          addEvent: async (event) => addEvent(trip.id, event),
          updateEvent: async (id, updates) => updateEvent(trip.id, id, updates),
          deleteEvent: async (id) => deleteEvent(trip.id, id),
          addExpense: async (_expense) => { /* TODO: wire up expense store */ },
        })
        toolResults.push(result)
      }

      setMessages(prev => prev.filter(m => m.id !== 'loading').concat({
        id: Date.now().toString(),
        role: 'assistant',
        content: responseText || (toolResults.length > 0 ? `Done! ${toolResults.join(', ')}.` : "I've updated your trip!"),
        toolCalls,
        timestamp: new Date(),
      }))

    } catch (err: unknown) {
      console.error('AI agent error:', err)
      setMessages(prev => prev.filter(m => m.id !== 'loading').concat({
        id: Date.now().toString(),
        role: 'assistant',
        content: "Sorry, I hit an error. Please try again.",
        timestamp: new Date(),
      }))
      toast.error('AI agent error — check that the API key is configured')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
            style={{
              background: 'var(--bg-elevated)',
              borderTop: '1px solid var(--border)',
              borderRadius: '16px 16px 0 0',
              maxHeight: '75vh',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2">
                <div className="relative w-7 h-7 flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'var(--accent)', opacity: 0.15 }}
                  />
                  <Sparkles size={14} style={{ color: 'var(--accent)', position: 'relative' }} />
                </div>
                <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                  Roteiro AI
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent)' }}
                >
                  Claude
                </span>
              </div>
              <button onClick={onClose} style={{ color: 'var(--text-3)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
              style={{ minHeight: 0 }}
            >
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[85%] px-3 py-2 rounded-2xl text-sm"
                    style={{
                      background: message.role === 'user'
                        ? 'var(--accent)'
                        : 'var(--bg-card)',
                      color: message.role === 'user' ? '#fff' : 'var(--text)',
                      border: message.role === 'assistant' ? '1px solid var(--border)' : 'none',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2
                          size={14}
                          className="animate-spin"
                          style={{ color: 'var(--accent)' }}
                        />
                        <span style={{ color: 'var(--text-3)' }}>Thinking...</span>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))}

              {/* Suggestions — only on initial state */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="text-xs px-3 py-1.5 rounded-full transition-colors"
                      style={{
                        background: 'var(--bg-card)',
                        color: 'var(--text-2)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="px-4 pb-6 pt-2"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Add a dinner reservation, plan tomorrow..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--text)' }}
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    background: input.trim() && !isLoading ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  <Send size={13} color="#fff" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
