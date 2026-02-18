import { supabase } from './supabase'
import { Trip, TripEvent } from '../types'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: Array<{ name: string; input: unknown }>
  timestamp: Date
  isLoading?: boolean
}

export interface ToolCall {
  name: string
  input: Record<string, unknown>
}

export async function sendAgentMessage(
  messages: ChatMessage[],
  trip: Trip
): Promise<{ text: string; toolCalls: ToolCall[] }> {
  const { data, error } = await supabase.functions.invoke('ai-agent', {
    body: {
      messages: messages
        .filter(m => !m.isLoading)
        .map(m => ({ role: m.role, content: m.content })),
      tripContext: {
        trip: {
          id: trip.id,
          name: trip.name,
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
          travelers: trip.travelers || [],
          events: (trip.events || []).map(e => ({
            id: e.id,
            type: e.type,
            date: e.date,
            time: e.time,
            title: e.title,
            data: (() => {
              // Extract the data fields (everything except base fields)
              const { id: _id, type: _type, date: _date, time: _time, title: _title, createdAt: _ca, ...rest } = e as unknown as Record<string, unknown>
              return rest
            })(),
          })),
        },
      },
    },
  })

  if (error) throw error
  return data
}

// Execute a tool call against the trip store
export async function executeToolCall(
  toolCall: ToolCall,
  tripId: string,
  handlers: {
    addEvent: (event: Omit<TripEvent, 'id' | 'createdAt'>) => Promise<TripEvent>
    updateEvent: (id: string, updates: Partial<TripEvent>) => Promise<void>
    deleteEvent: (id: string) => Promise<void>
    addExpense: (expense: unknown) => Promise<void>
  }
): Promise<string> {
  switch (toolCall.name) {
    case 'add_event': {
      const { type, date, time, title, data } = toolCall.input as {
        type: TripEvent['type']
        date: string
        time?: string
        title: string
        data: Record<string, unknown>
      }
      await handlers.addEvent({ type, date, time, title, ...data } as Omit<TripEvent, 'id' | 'createdAt'>)
      return `Added ${type}: ${title}`
    }
    case 'add_multiple_events': {
      const { events } = toolCall.input as { events: Array<{ type: TripEvent['type']; date: string; time?: string; title: string; data: Record<string, unknown> }> }
      for (const event of events) {
        await handlers.addEvent({ ...event, ...event.data } as Omit<TripEvent, 'id' | 'createdAt'>)
      }
      return `Added ${events.length} events`
    }
    case 'update_event': {
      const { eventId, updates } = toolCall.input as { eventId: string; updates: Partial<TripEvent> }
      await handlers.updateEvent(eventId, updates)
      return `Updated event ${eventId}`
    }
    case 'delete_event': {
      const { eventId } = toolCall.input as { eventId: string }
      await handlers.deleteEvent(eventId)
      return `Deleted event ${eventId}`
    }
    case 'add_expense': {
      await handlers.addExpense(toolCall.input)
      return `Added expense: ${(toolCall.input as { description: string }).description}`
    }
    default:
      return `Unknown tool: ${toolCall.name}`
  }
}
