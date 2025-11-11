import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

// Tipo para as mensagens no formato da IA
interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Tipo para mensagens do banco
interface DatabaseMessage {
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
}

// POST /api/chat/stream - Gerar resposta da IA com streaming
export async function POST(request: NextRequest) {
  try {
    const { chatId, model, messages, regenerate, originalMessageId } = await request.json()

    if (!chatId || !model || !messages) {
      return new Response('chatId, model e messages são obrigatórios', { status: 400 })
    }

    // Verificar se o chat existe
    const existingChat = await prisma.chat.findUnique({
      where: { id: chatId }
    })

    if (!existingChat) {
      return new Response('Chat não encontrado', { status: 404 })
    }

    // Se for regeneração, deletar a mensagem original
    if (regenerate && originalMessageId) {
      await prisma.message.delete({
        where: { id: originalMessageId }
      })
    }

    // Converter mensagens para formato da API da IA (Ollama)
    const formattedMessages: AIMessage[] = messages.map((msg: DatabaseMessage) => ({
      role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
      content: msg.content
    }))

    // Configurar headers para SSE
    const headers = {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }

    const encoder = new TextEncoder()
    let accumulatedContent = ''

    // Criar ReadableStream para streaming
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Fazer chamada para a API do Ollama com streaming
          const ollamaResponse = await fetch(`${process.env.OLLAMA_API_URL}/api/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: model,
              messages: formattedMessages,
              stream: true
            }),
          })

          if (!ollamaResponse.ok) {
            throw new Error(`Erro na API do Ollama: ${ollamaResponse.status}`)
          }

          const reader = ollamaResponse.body?.getReader()
          if (!reader) {
            throw new Error('Não foi possível ler a resposta do Ollama')
          }

          const decoder = new TextDecoder()

          try {
            while (true) {
              const { done, value } = await reader.read()
              
              if (done) break

              const chunk = decoder.decode(value, { stream: true })
              const lines = chunk.split('\n').filter(line => line.trim())

              for (const line of lines) {
                try {
                  const data = JSON.parse(line)
                  
                  if (data.message && data.message.content) {
                    const content = data.message.content
                    accumulatedContent += content
                    
                    // Enviar chunk para o cliente
                    controller.enqueue(encoder.encode(content))
                  }

                  // Se a resposta está completa
                  if (data.done) {
                    // Salvar a resposta completa no banco
                    await prisma.message.create({
                      data: {
                        chatId,
                        role: 'ASSISTANT',
                        content: accumulatedContent
                      }
                    })

                    // Atualizar o timestamp do chat
                    await prisma.chat.update({
                      where: { id: chatId },
                      data: { updatedAt: new Date() }
                    })

                    controller.close()
                    return
                  }
                } catch {
                  // Ignorar linhas que não são JSON válido
                  continue
                }
              }
            }
          } finally {
            reader.releaseLock()
          }
        } catch (error) {
          console.error('Erro no streaming:', error)
          controller.error(error)
        }
      }
    })

    return new Response(stream, { headers })

  } catch (error) {
    console.error('Erro na API de streaming:', error)
    return new Response('Erro interno do servidor', { status: 500 })
  }
}
