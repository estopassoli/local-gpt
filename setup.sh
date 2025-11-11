#!/bin/bash

# Script de setup para GPT Chat Local
# Compatible com Linux e macOS

set -e

echo "🤖 GPT Chat Local - Setup Automático"
echo "======================================"

# Verificar Node.js
echo "📋 Verificando pré-requisitos..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "   Por favor instale Node.js 18+ em https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d 'v' -f2 | cut -d '.' -f1)
if [ "$NODE_VERSION" -lt "18" ]; then
    echo "❌ Node.js muito antigo (v$NODE_VERSION)!"
    echo "   Por favor atualize para Node.js 18+ em https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado!"
    exit 1
fi

echo "✅ npm $(npm --version) encontrado"

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."
npm install

# Configurar .env
echo ""
echo "⚙️  Configurando variáveis de ambiente..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Arquivo .env criado"
else
    echo "ℹ️  Arquivo .env já existe"
fi

# Setup do banco de dados
echo ""
echo "🗄️  Configurando banco de dados SQLite..."
npx prisma generate
npx prisma migrate dev --name init

# Verificar Ollama
echo ""
echo "🔍 Verificando Ollama..."
if ! command -v ollama &> /dev/null; then
    echo "⚠️  Ollama não encontrado!"
    echo ""
    echo "   Para instalar o Ollama:"
    echo "   • macOS: brew install ollama"
    echo "   • Linux: curl -fsSL https://ollama.ai/install.sh | sh"
    echo "   • Windows: Baixe em https://ollama.ai/"
    echo ""
    echo "   Após instalar, execute:"
    echo "   • ollama serve"
    echo "   • ollama pull llama3:latest"
    OLLAMA_MISSING=true
else
    echo "✅ Ollama encontrado"
    
    # Verificar se o serviço está rodando
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "✅ Serviço Ollama está rodando"
        
        # Listar modelos
        MODELS=$(ollama list | grep -v "NAME" | wc -l)
        if [ "$MODELS" -gt "0" ]; then
            echo "✅ Modelos encontrados:"
            ollama list
        else
            echo "⚠️  Nenhum modelo encontrado!"
            echo "   Execute: ollama pull llama3:latest"
            OLLAMA_NO_MODELS=true
        fi
    else
        echo "⚠️  Serviço Ollama não está rodando!"
        echo "   Execute: ollama serve"
        OLLAMA_NOT_RUNNING=true
    fi
fi

# Resultado final
echo ""
echo "🎉 Setup concluído!"
echo "=================="

if [ -z "$OLLAMA_MISSING" ] && [ -z "$OLLAMA_NOT_RUNNING" ] && [ -z "$OLLAMA_NO_MODELS" ]; then
    echo "✅ Tudo pronto! Execute: npm run dev"
else
    echo "⚠️  Ações necessárias:"
    if [ "$OLLAMA_MISSING" = true ]; then
        echo "   1. Instale o Ollama"
    fi
    if [ "$OLLAMA_NOT_RUNNING" = true ]; then
        echo "   2. Inicie: ollama serve"
    fi
    if [ "$OLLAMA_NO_MODELS" = true ]; then
        echo "   3. Baixe um modelo: ollama pull llama3:latest"
    fi
    echo "   4. Execute: npm run dev"
fi

echo ""
echo "📚 Para mais informações, consulte o README.md"
