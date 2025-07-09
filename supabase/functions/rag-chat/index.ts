import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { message }: ChatMessage = await req.json()

    // Validate message
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message format')
    }

    // Fetch relevant resume sections based on simple keyword matching
    const { data: resumeSections, error: fetchError } = await supabaseClient
      .from('resume_sections')
      .select('*')

    if (fetchError) {
      throw fetchError
    }

    // Simple relevance scoring based on keyword matching
    const relevantSections = resumeSections
      .map(section => {
        const lowerMessage = message.toLowerCase()
        const lowerContent = section.content.toLowerCase()
        const lowerTitle = section.title.toLowerCase()

        let score = 0

        // Check for keyword matches
        const keywords = lowerMessage.split(' ').filter(word => word.length > 3)
        keywords.forEach(keyword => {
          if (lowerContent.includes(keyword)) score += 2
          if (lowerTitle.includes(keyword)) score += 3
        })

        // Boost certain section types based on common queries
        if (lowerMessage.includes('experience') || lowerMessage.includes('work') || lowerMessage.includes('job')) {
          if (section.section_type === 'experience') score += 5
        }
        if (lowerMessage.includes('skill') || lowerMessage.includes('technology') || lowerMessage.includes('tech')) {
          if (section.section_type === 'skills') score += 5
        }
        if (lowerMessage.includes('education') || lowerMessage.includes('study') || lowerMessage.includes('degree')) {
          if (section.section_type === 'education') score += 5
        }
        if (lowerMessage.includes('project') || lowerMessage.includes('build') || lowerMessage.includes('research')) {
          if (section.section_type === 'projects') score += 5
        }

        return { ...section, relevanceScore: score }
      })
      .filter(section => section.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3) // Top 3 most relevant sections

    // Create context from relevant sections
    const context = relevantSections.length > 0
      ? relevantSections
          .map(section => `${section.title}:\n${section.content}`)
          .join('\n\n')
      : 'No specific context available for this query.'

    // Get OpenRouter API key
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured')
    }

    // Generate response using OpenRouter
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
    }

    // Generate response using Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-lite:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        contents: [
        {
            parts: [
            {
                text: `You are Ishmam's digital twin, an AI assistant that represents Ishmam A. Solaiman professionally. You should respond in first person as if you are Ishmam himself.

    Key personality traits:
    - Professional but approachable
    - Passionate about AI, machine learning, and software development
    - Confident but humble about achievements
    - Always eager to discuss technology and innovation

    Use the following context about Ishmam to answer questions accurately:

    ${context}

    Important guidelines:
    1. Always respond in first person (use "I", "my", "me")
    2. Be specific about achievements and technologies mentioned
    3. If asked about something not in the context, politely redirect to areas you know about
    4. Keep responses conversational but professional
    5. Highlight relevant experience and skills
    6. Don't make up information not provided in the context

    User question: ${message}`
            }
            ]
        }
        ],
        generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500,
        },
        safetySettings: [
        {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
        ]
    })
    })

    if (!geminiResponse.ok) {
    const errorData = await geminiResponse.text()
    console.error('Gemini API error:', errorData)
    throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorData}`)
    }

    const aiResponse = await geminiResponse.json()

    // Check if the response has the expected structure
    if (!aiResponse.candidates || !aiResponse.candidates[0]?.content?.parts?.[0]?.text) {
    console.error('Unexpected Gemini response structure:', aiResponse)
    throw new Error('Invalid response from Gemini API')
    }

    const botMessage = aiResponse.candidates[0].content.parts[0].text

    return new Response(
    JSON.stringify({ 
        response: botMessage,
        relevantSections: relevantSections.map(s => ({ 
        title: s.title, 
        section_type: s.section_type 
        }))
    }),
    {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
    )

    } catch (error) {
    console.error('Error in rag-chat function:', error)
    return new Response(
    JSON.stringify({ 
        response: "I'm sorry, I encountered an error processing your question. Please try again.",
        error: error.message 
    }),
    {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
    )
    }
})