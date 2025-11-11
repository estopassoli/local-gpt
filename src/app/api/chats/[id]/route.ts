import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/chats/[id] - Buscar chat específico
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    console.log('Chat ID recebido:', id) // Debug

    if (!id) {
      return NextResponse.json(
        { message: 'ID do chat é obrigatório' },
        { status: 400 }
      )
    }

    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!chat) {
      return NextResponse.json(
        { message: 'Chat não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(chat)
  } catch (error) {
    console.error('Erro ao buscar chat:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH /api/chats/[id] - Atualizar chat
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { message: 'ID do chat é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o chat existe
    const existingChat = await prisma.chat.findUnique({
      where: { id }
    })

    if (!existingChat) {
      return NextResponse.json(
        { message: 'Chat não encontrado' },
        { status: 404 }
      )
    }

    // Preparar dados para atualização
    const updateData: { title?: string; llmModel?: string; isArchived?: boolean } = {}
    if (body.title) updateData.title = body.title
    if (body.llmModel) updateData.llmModel = body.llmModel
    if (typeof body.isArchived === 'boolean') updateData.isArchived = body.isArchived

    const updatedChat = await prisma.chat.update({
      where: { id },
      data: updateData,
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    return NextResponse.json(updatedChat)
  } catch (error) {
    console.error('Erro ao atualizar chat:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/chats/[id] - Deletar chat
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { message: 'ID do chat é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o chat existe
    const existingChat = await prisma.chat.findUnique({
      where: { id }
    })

    if (!existingChat) {
      return NextResponse.json(
        { message: 'Chat não encontrado' },
        { status: 404 }
      )
    }

    // Deletar chat (mensagens serão deletadas automaticamente devido ao onDelete: Cascade)
    await prisma.chat.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Chat deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar chat:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
