import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Definir os tipos do Role baseado no schema
type Role = 'USER' | 'ASSISTANT' | 'SYSTEM'

// POST /api/messages - Criar nova mensagem
export async function POST(request: NextRequest) {
  try {
    const { chatId, role, content } = await request.json()

    if (!chatId || !role || !content) {
      return NextResponse.json(
        { message: 'chatId, role e content são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o role é válido
    const validRoles: Role[] = ['USER', 'ASSISTANT', 'SYSTEM']
    if (!validRoles.includes(role as Role)) {
      return NextResponse.json(
        { message: 'Role inválido. Use USER, ASSISTANT ou SYSTEM' },
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

    // Criar mensagem
    const newMessage = await prisma.message.create({
      data: {
        chatId,
        role: role as Role,
        content
      }
    })

    // Atualizar updatedAt do chat
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar mensagem:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/messages?chatId=xxx - Buscar mensagens de um chat
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')

    if (!chatId) {
      return NextResponse.json(
        { message: 'chatId é obrigatório' },
        { status: 400 }
      )
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
