#!/bin/bash

# ===================================================================
# SCRIPT DE QA COMPLETO - ERP UzzAI
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
# COMO EXECUTAR:
#   bash scripts/qa-complete.sh
#
# Ou no Windows (Git Bash):
#   bash scripts/qa-complete.sh
# ===================================================================

set -e  # Para em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "====================================================================="
echo "🚀 QA COMPLETO - ERP UzzAI"
echo "====================================================================="
echo ""

# Contador de erros
ERRORS=0

# ===================================================================
# ETAPA 1: Verificar ambiente
# ===================================================================
echo -e "${BLUE}[1/6] Verificando ambiente...${NC}"

if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm não está instalado!${NC}"
    echo "   Instale com: npm install -g pnpm"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json não encontrado!${NC}"
    echo "   Execute este script na raiz do projeto"
    exit 1
fi

echo -e "${GREEN}✅ Ambiente OK${NC}"
echo ""

# ===================================================================
# ETAPA 2: Instalar dependências (se necessário)
# ===================================================================
echo -e "${BLUE}[2/6] Verificando dependências...${NC}"

if [ ! -d "node_modules" ]; then
    echo "   Instalando dependências..."
    pnpm install || { echo -e "${RED}❌ Falha ao instalar dependências${NC}"; exit 1; }
fi

echo -e "${GREEN}✅ Dependências OK${NC}"
echo ""

# ===================================================================
# ETAPA 3: Lint (ESLint)
# ===================================================================
echo -e "${BLUE}[3/6] Executando ESLint...${NC}"

if pnpm run lint; then
    echo -e "${GREEN}✅ Lint passou${NC}"
else
    echo -e "${YELLOW}⚠️  Lint falhou (warnings permitidos)${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# ===================================================================
# ETAPA 4: Type Check (TypeScript)
# ===================================================================
echo -e "${BLUE}[4/6] Verificando tipos TypeScript...${NC}"

if pnpm exec tsc --noEmit; then
    echo -e "${GREEN}✅ Type check passou${NC}"
else
    echo -e "${RED}❌ Type check falhou${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# ===================================================================
# ETAPA 5: Testes Unitários
# ===================================================================
echo -e "${BLUE}[5/6] Executando testes unitários...${NC}"

if pnpm run test; then
    echo -e "${GREEN}✅ Testes unitários passaram${NC}"
else
    echo -e "${RED}❌ Testes unitários falharam${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# ===================================================================
# ETAPA 6: Build de Produção
# ===================================================================
echo -e "${BLUE}[6/6] Testando build de produção...${NC}"

if pnpm run build; then
    echo -e "${GREEN}✅ Build passou${NC}"
else
    echo -e "${RED}❌ Build falhou${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# ===================================================================
# RESUMO FINAL
# ===================================================================
echo "====================================================================="
echo "📊 RESUMO DO QA"
echo "====================================================================="
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ TODOS OS TESTES PASSARAM!${NC}"
    echo ""
    echo "   Seu código está pronto para:"
    echo "   • Commit"
    echo "   • Pull Request"
    echo "   • Deploy"
    echo ""
    exit 0
else
    echo -e "${RED}❌ $ERRORS ETAPA(S) FALHARAM${NC}"
    echo ""
    echo "   Por favor, corrija os erros antes de:"
    echo "   • Fazer commit"
    echo "   • Criar pull request"
    echo "   • Fazer deploy"
    echo ""
    exit 1
fi
