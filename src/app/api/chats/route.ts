import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/chats - Buscar todos os chats (apenas não arquivados por padrão)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const includeArchived = searchParams.get('includeArchived') === 'true'

        const chats = await prisma.chat.findMany({
            where: includeArchived ? {} : { isArchived: false },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(chats)
    } catch (error) {
        console.error('Erro ao buscar chats:', error)
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

// POST /api/chats - Criar novo chat
export async function POST(request: NextRequest) {
    try {
        const { title } = await request.json()

        const newChat = await prisma.chat.create({
            data: {
                title: title || 'Chat sem título ' + new Date().toISOString(),
            },
            include: {
                messages: true
            }
        })

        return NextResponse.json(newChat, { status: 201 })
    } catch (error) {
        console.error('Erro ao criar chat:', error)
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
