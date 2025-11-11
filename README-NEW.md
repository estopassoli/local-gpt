# 🤖 GPT Chat Local

Uma aplicação de chat local moderna com IA, construída com Next.js 15, Tailwind CSS e Ollama. Interface elegante com modo escuro/claro, streaming de respostas em tempo real e suporte a múltiplos modelos de linguagem.

## 🌟 Funcionalidades

- ✨ Interface moderna e responsiva
- 🔄 Streaming de respostas em tempo real (SSE)
- 🌓 Tema claro/escuro automático
- 💬 Múltiplos chats organizados
- 📱 Totalmente responsivo
- 🎨 Syntax highlighting para código
- 📂 Gerenciamento de conversas (criar, arquivar, deletar)
- 🚀 Performance otimizada
- 🔍 Command Palette (Ctrl/Cmd + K)

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

### Para todos os sistemas (Windows, macOS, Linux)

1. **Node.js** (versão 18 ou superior)
   - [Download Node.js](https://nodejs.org/)
   - Verifique: `node --version` e `npm --version`

2. **Ollama** (para executar modelos de IA localmente)
   - [Download Ollama](https://ollama.ai/)

## 🚀 Instalação Rápida

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd gpt
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# O arquivo .env já vem configurado para SQLite local
# DATABASE_URL="file:./dev.db"
# OLLAMA_API_URL="http://localhost:11434"
```

### 4. Configure o banco de dados
```bash
# Gere o cliente Prisma
npx prisma generate

# Execute as migrações para criar as tabelas
npx prisma migrate dev --name init
```

### 5. Instale e configure o Ollama

#### Windows
1. Baixe o instalador do [site oficial](https://ollama.ai/)
2. Execute o instalador
3. Abra o terminal/PowerShell e execute:

```bash
# Baixe um modelo (exemplo: Llama 3)
ollama pull llama3:latest

# Ou um modelo menor para testes
ollama pull llama3:8b
```

#### macOS
```bash
# Usando Homebrew
brew install ollama

# Ou baixe do site oficial
# https://ollama.ai/

# Inicie o serviço
ollama serve

# Em outro terminal, baixe um modelo
ollama pull llama3:latest
```

#### Linux
```bash
# Instalação via curl
curl -fsSL https://ollama.ai/install.sh | sh

# Inicie o serviço
ollama serve

# Em outro terminal, baixe um modelo
ollama pull llama3:latest
```

### 6. Inicie a aplicação
```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:3000**

## 📦 Modelos Disponíveis

Você pode baixar diferentes modelos com o Ollama:

```bash
# Modelos recomendados
ollama pull llama3:latest      # Modelo principal (4.7GB)
ollama pull llama3:8b          # Versão menor (4.7GB)
ollama pull codellama          # Especializado em código (3.8GB)
ollama pull mistral            # Modelo alternativo (4.1GB)

# Listar modelos instalados
ollama list
```

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Inicia em modo desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia em produção
npm run lint         # Executa linting
```

### Scripts do Prisma

```bash
npx prisma studio           # Interface visual do banco
npx prisma migrate dev      # Cria nova migração
npx prisma generate         # Regenera o cliente
npx prisma reset           # Reset completo do banco
```

## 🗄️ Estrutura do Banco

O projeto usa SQLite para simplicidade em desenvolvimento local. As tabelas são:

- **Chat**: Armazena as conversas
- **Message**: Armazena as mensagens de cada chat

## 🎨 Personalização

### Temas
- A aplicação suporta modo claro/escuro automático
- Baseado nas preferências do sistema
- Alternância manual disponível

### Modelos de IA
- Configure diferentes modelos no Ollama
- Troca de modelo em tempo real na interface
- Suporte a modelos customizados

## 🔧 Troubleshooting

### Problema: Ollama não conecta
```bash
# Verifique se o Ollama está rodando
ollama list

# Se não estiver, inicie o serviço
ollama serve
```

### Problema: Erro de banco de dados
```bash
# Reset o banco e migrations
npx prisma migrate reset

# Regenere o cliente
npx prisma generate
```

### Problema: Porta 3000 ocupada
```bash
# A aplicação tentará usar a porta 3001 automaticamente
# Ou defina uma porta específica
PORT=3002 npm run dev
```

### Problema: Node.js muito antigo
```bash
# Verifique a versão
node --version

# Atualize para Node 18+ se necessário
```

## 🚀 Deploy em Produção

### 1. Build da aplicação
```bash
npm run build
```

### 2. Configuração do banco
Para produção, considere PostgreSQL:

```bash
# .env.production
DATABASE_URL="postgresql://user:password@host:port/database"
```

### 3. Configuração do Ollama
Para produção, configure o Ollama em um servidor dedicado:

```bash
# .env.production
OLLAMA_API_URL="https://seu-ollama-server.com"
```

## 📱 Recursos da Interface

### Command Palette
- Pressione `Ctrl+K` (Windows/Linux) ou `Cmd+K` (macOS)
- Acesso rápido a todas as funções

### Atalhos de Teclado
- `Ctrl/Cmd + K`: Abrir command palette
- `Escape`: Fechar chat atual
- `Enter`: Enviar mensagem

### Funcionalidades do Chat
- **Criar**: Novo chat automaticamente
- **Arquivar**: Organizar conversas antigas
- **Deletar**: Remover chats permanentemente
- **Fechar**: Sair da conversa atual

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se todas as dependências estão instaladas
2. Confirme que o Ollama está rodando
3. Verifique os logs no console do navegador
4. Consulte a documentação do [Ollama](https://ollama.ai/)
5. Abra uma issue no repositório

---

**Desenvolvido com ❤️ usando Next.js 15, Tailwind CSS e Ollama**
