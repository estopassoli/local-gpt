import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

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

// POST /api/chat/completion - Gerar resposta da IA
export async function POST(request: NextRequest) {
  try {
    const { chatId, model, messages, regenerate, originalMessageId } = await request.json()

    if (!chatId || !model || !messages) {
      return NextResponse.json(
        { message: 'chatId, model e messages são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o chat existe
    const existingChat = await prisma.chat.findUnique({
      where: { id: chatId }
    })

    if (!existingChat) {
      return NextResponse.json(
        { message: 'Chat não encontrado' },
        { status: 404 }
      )
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

    // Fazer chamada para a API do Ollama
    const ollamaResponse = await fetch(`${process.env.OLLAMA_API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        stream: false
      }),
    })

    if (!ollamaResponse.ok) {
      throw new Error(`Erro na API do Ollama: ${ollamaResponse.status}`)
    }

    const ollamaData = await ollamaResponse.json()
    const aiResponse = ollamaData.message.content

    // Salvar a resposta da IA no banco
    const newMessage = await prisma.message.create({
      data: {
        chatId,
        role: 'ASSISTANT',
        content: aiResponse
      }
    })

    // Atualizar o timestamp do chat
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({
      content: aiResponse,
      messageId: newMessage.id
    })
  } catch (error) {
    console.error('Erro ao gerar resposta da IA:', error)
    return NextResponse.json(
      { 
        message: 'Erro ao gerar resposta da IA', 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
