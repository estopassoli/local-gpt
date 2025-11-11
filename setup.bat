@echo off
:: Script de setup para GPT Chat Local - Windows
:: Execute como Administrador se necessário

echo 🤖 GPT Chat Local - Setup Automático (Windows)
echo ===============================================

:: Verificar Node.js
echo.
echo 📋 Verificando pré-requisitos...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo    Por favor instale Node.js 18+ em https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=1 delims=v" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js encontrado: %NODE_VERSION%

:: Verificar npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado!
    pause
    exit /b 1
)

for /f %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm encontrado: %NPM_VERSION%

:: Instalar dependências
echo.
echo 📦 Instalando dependências...
npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências!
    pause
    exit /b 1
)

:: Configurar .env
echo.
echo ⚙️  Configurando variáveis de ambiente...
if not exist ".env" (
    copy .env.example .env >nul
    echo ✅ Arquivo .env criado
) else (
    echo ℹ️  Arquivo .env já existe
)

:: Setup do banco de dados
echo.
echo 🗄️  Configurando banco de dados SQLite...
npx prisma generate
npx prisma migrate dev --name init

:: Verificar Ollama
echo.
echo 🔍 Verificando Ollama...
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Ollama não encontrado!
    echo.
    echo    Para instalar o Ollama:
    echo    • Baixe em https://ollama.ai/
    echo    • Execute o instalador
    echo.
    echo    Após instalar, execute:
    echo    • ollama serve
    echo    • ollama pull llama3:latest
    set OLLAMA_MISSING=true
) else (
    echo ✅ Ollama encontrado
    
    :: Verificar se o serviço está rodando
    curl -s http://localhost:11434/api/tags >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Serviço Ollama está rodando
        
        :: Listar modelos
        ollama list | find /c "" >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✅ Modelos encontrados:
            ollama list
        ) else (
            echo ⚠️  Nenhum modelo encontrado!
            echo    Execute: ollama pull llama3:latest
            set OLLAMA_NO_MODELS=true
        )
    ) else (
        echo ⚠️  Serviço Ollama não está rodando!
        echo    Execute: ollama serve
        set OLLAMA_NOT_RUNNING=true
    )
)

:: Resultado final
echo.
echo 🎉 Setup concluído!
echo ==================

if "%OLLAMA_MISSING%" neq "true" if "%OLLAMA_NOT_RUNNING%" neq "true" if "%OLLAMA_NO_MODELS%" neq "true" (
    echo ✅ Tudo pronto! Execute: npm run dev
) else (
    echo ⚠️  Ações necessárias:
    if "%OLLAMA_MISSING%"=="true" echo    1. Instale o Ollama
    if "%OLLAMA_NOT_RUNNING%"=="true" echo    2. Inicie: ollama serve
    if "%OLLAMA_NO_MODELS%"=="true" echo    3. Baixe um modelo: ollama pull llama3:latest
    echo    4. Execute: npm run dev
)

echo.
echo 📚 Para mais informações, consulte o README.md
echo.
pause
