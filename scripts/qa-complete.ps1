# ===================================================================
# SCRIPT DE QA COMPLETO - ERP UzzAI (PowerShell)
# ===================================================================
# Este script executa TODOS os testes e validações do projeto
# para garantir que nenhuma mudança quebrou funcionalidades.
#
# QUANDO EXECUTAR:
# - ✅ Antes de cada commit importante
# - ✅ Antes de cada deploy
# - ✅ Após mudanças no schema SQL
# - ✅ Após mudanças nas APIs
# - ✅ Após mudanças no sistema de autenticação
#
# COMO EXECUTAR (PowerShell):
#   .\scripts\qa-complete.ps1
#
# Ou use o script npm:
#   pnpm run qa
# ===================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Blue
Write-Host "🚀 QA COMPLETO - ERP UzzAI" -ForegroundColor Blue
Write-Host "=====================================================================" -ForegroundColor Blue
Write-Host ""

# Contador de erros
$ERRORS = 0

# ===================================================================
# ETAPA 1: Verificar ambiente
# ===================================================================
Write-Host "[1/6] Verificando ambiente..." -ForegroundColor Cyan

if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ pnpm não está instalado!" -ForegroundColor Red
    Write-Host "   Instale com: npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}

if (!(Test-Path "package.json")) {
    Write-Host "❌ package.json não encontrado!" -ForegroundColor Red
    Write-Host "   Execute este script na raiz do projeto" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Ambiente OK" -ForegroundColor Green
Write-Host ""

# ===================================================================
# ETAPA 2: Instalar dependências (se necessário)
# ===================================================================
Write-Host "[2/6] Verificando dependências..." -ForegroundColor Cyan

if (!(Test-Path "node_modules")) {
    Write-Host "   Instalando dependências..." -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Falha ao instalar dependências" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Dependências OK" -ForegroundColor Green
Write-Host ""

# ===================================================================
# ETAPA 3: Lint (ESLint)
# ===================================================================
Write-Host "[3/6] Executando ESLint..." -ForegroundColor Cyan

pnpm run lint
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Lint passou" -ForegroundColor Green
} else {
    Write-Host "⚠️  Lint falhou (warnings permitidos)" -ForegroundColor Yellow
    $ERRORS++
}
Write-Host ""

# ===================================================================
# ETAPA 4: Type Check (TypeScript)
# ===================================================================
Write-Host "[4/6] Verificando tipos TypeScript..." -ForegroundColor Cyan

pnpm exec tsc --noEmit
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Type check passou" -ForegroundColor Green
} else {
    Write-Host "❌ Type check falhou" -ForegroundColor Red
    $ERRORS++
}
Write-Host ""

# ===================================================================
# ETAPA 5: Testes Unitários
# ===================================================================
Write-Host "[5/6] Executando testes unitários..." -ForegroundColor Cyan

pnpm run test
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Testes unitários passaram" -ForegroundColor Green
} else {
    Write-Host "❌ Testes unitários falharam" -ForegroundColor Red
    $ERRORS++
}
Write-Host ""

# ===================================================================
# ETAPA 6: Build de Produção
# ===================================================================
Write-Host "[6/6] Testando build de produção..." -ForegroundColor Cyan

pnpm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build passou" -ForegroundColor Green
} else {
    Write-Host "❌ Build falhou" -ForegroundColor Red
    $ERRORS++
}
Write-Host ""

# ===================================================================
# RESUMO FINAL
# ===================================================================
Write-Host "=====================================================================" -ForegroundColor Blue
Write-Host "📊 RESUMO DO QA" -ForegroundColor Blue
Write-Host "=====================================================================" -ForegroundColor Blue
Write-Host ""

if ($ERRORS -eq 0) {
    Write-Host "TODOS OS TESTES PASSARAM!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Seu codigo esta pronto para:" -ForegroundColor White
    Write-Host "   - Commit" -ForegroundColor White
    Write-Host "   - Pull Request" -ForegroundColor White
    Write-Host "   - Deploy" -ForegroundColor White
    Write-Host ""
    exit 0
} else {
    Write-Host "$ERRORS ETAPA(S) FALHARAM" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Por favor, corrija os erros antes de:" -ForegroundColor Yellow
    Write-Host "   - Fazer commit" -ForegroundColor Yellow
    Write-Host "   - Criar pull request" -ForegroundColor Yellow
    Write-Host "   - Fazer deploy" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
