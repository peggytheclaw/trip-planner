import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Anthropic from "npm:@anthropic-ai/sdk"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface TripContext {
  trip: {
    id: string
    name: string
    destination: string
    startDate: string
    endDate: string
    travelers: Array<{ id: string; name: string }>
    events: Array<{
      id: string
      type: string
      date: string
      time?: string
      title: string
      data: Record<string, unknown>
    }>
  }
}

// Claude tools for trip manipulation
const TRIP_TOOLS: Anthropic.Tool[] = [
  {
    name: "add_event",
    description: "Add a new event to the trip itinerary. Use this for flights, hotels, restaurants, activities, transport, trains, or notes.",
    input_schema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["flight", "hotel", "restaurant", "activity", "transport", "train", "note"],
          description: "The type of event"
        },
        date: {
          type: "string",
          description: "Date in YYYY-MM-DD format"
        },
        time: {
          type: "string",
          description: "Time in HH:MM format (24h), optional"
        },
        title: {
          type: "string",
          description: "Short title for the event"
        },
        data: {
          type: "object",
          description: "Event-specific details. For flight: {airline, flightNumber, fromAirport, toAirport, arrivalTime, confirmationNumber}. For hotel: {hotelName, neighborhood, checkInTime, checkOutDate, pricePerNight, confirmationNumber}. For restaurant: {restaurantName, neighborhood, cuisine, reservationStatus}. For activity: {activityName, location, duration, price}. For transport: {provider, fromLocation, toLocation, duration}. For note: {content}."
        }
      },
      required: ["type", "date", "title", "data"]
    }
  },
  {
    name: "update_event",
    description: "Update an existing event in the itinerary by its ID.",
    input_schema: {
      type: "object",
      properties: {
        eventId: {
          type: "string",
          description: "The ID of the event to update"
        },
        updates: {
          type: "object",
          description: "Fields to update: date, time, title, data (partial update)"
        }
      },
      required: ["eventId", "updates"]
    }
  },
  {
    name: "delete_event",
    description: "Delete an event from the itinerary by its ID.",
    input_schema: {
      type: "object",
      properties: {
        eventId: {
          type: "string",
          description: "The ID of the event to delete"
        }
      },
      required: ["eventId"]
    }
  },
  {
    name: "add_multiple_events",
    description: "Add multiple events at once. Use this when generating a full day or trip plan.",
    input_schema: {
      type: "object",
      properties: {
        events: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["flight", "hotel", "restaurant", "activity", "transport", "train", "note"] },
              date: { type: "string" },
              time: { type: "string" },
              title: { type: "string" },
              data: { type: "object" }
            },
            required: ["type", "date", "title", "data"]
          }
        }
      },
      required: ["events"]
    }
  },
  {
    name: "add_expense",
    description: "Log an expense for the trip.",
    input_schema: {
      type: "object",
      properties: {
        description: { type: "string" },
        amount: { type: "number" },
        category: { type: "string", enum: ["food", "transport", "accommodation", "activities", "shopping", "other"] },
        paidByTravelerId: { type: "string", description: "ID of the traveler who paid" },
        splitBetween: { type: "array", items: { type: "string" }, description: "Array of traveler IDs to split between" }
      },
      required: ["description", "amount", "category"]
    }
  }
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, tripContext }: { messages: Message[]; tripContext: TripContext } = await req.json()

    const client = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY') ?? '',
    })

    const systemPrompt = `You are an AI travel planning assistant for Roteiro, a collaborative trip planning app. 
You help users build and manage their trip itineraries through natural conversation.

Current trip context:
- Trip: ${tripContext.trip.name} to ${tripContext.trip.destination}
- Dates: ${tripContext.trip.startDate} to ${tripContext.trip.endDate}
- Travelers: ${tripContext.trip.travelers.map((t: { id: string; name: string }) => t.name).join(', ')}
- Current events (${tripContext.trip.events.length} total):
${tripContext.trip.events.map((e: { id: string; date: string; time?: string; type: string; title: string }) => `  - [${e.id}] ${e.date} ${e.time || ''} | ${e.type}: ${e.title}`).join('\n')}

Guidelines:
- Be concise and action-oriented. When adding events, just do it and confirm briefly.
- For vague requests like "plan my first day", create a realistic full-day schedule.
- Use local knowledge: suggest real restaurants, landmarks, neighborhoods for the destination.
- When referencing existing events to update/delete, use their IDs from the context above.
- Times should be realistic (breakfast 8-9am, lunch 12-1pm, dinner 7-8pm, etc.)
- Always use the tool calls to actually make changes — don't just describe what you would do.
- Keep responses short and friendly.`

    // Call Claude with tool use
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      system: systemPrompt,
      tools: TRIP_TOOLS,
      messages: messages.map((m: Message) => ({ role: m.role, content: m.content })),
    })

    // Extract tool calls and text response
    const toolCalls = response.content
      .filter(block => block.type === 'tool_use')
      .map(block => ({
        name: (block as Anthropic.ToolUseBlock).name,
        input: (block as Anthropic.ToolUseBlock).input,
      }))

    const textContent = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as Anthropic.TextBlock).text)
      .join('\n')

    return new Response(
      JSON.stringify({
        text: textContent,
        toolCalls,
        stopReason: response.stop_reason,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('AI agent error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
