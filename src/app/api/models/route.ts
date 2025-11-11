import { NextResponse } from 'next/server'

// Tipo para modelo do Ollama
interface OllamaModel {
  name: string
  size: number
  modified_at: string
  digest: string
}

// GET /api/models - Buscar modelos disponíveis do Ollama
export async function GET() {
  try {
    const ollamaApiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434'
    
    const response = await fetch(`${ollamaApiUrl}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Erro na API do Ollama: ${response.status}`)
    }

    const data = await response.json()
    
    // Extrair apenas os nomes dos modelos
    const models = data.models?.map((model: OllamaModel) => ({
      name: model.name,
      size: model.size,
      modified_at: model.modified_at,
      digest: model.digest
    })) || []

    return NextResponse.json({ models })
  } catch (error) {
    console.error('Erro ao buscar modelos do Ollama:', error)
    
    // Retornar lista vazia se não conseguir conectar com Ollama
    return NextResponse.json(
      { 
        models: [],
        error: 'Não foi possível conectar com o Ollama. Verifique se está rodando.'
      },
      { status: 200 } // 200 para não quebrar a aplicação
    )
  }
}
