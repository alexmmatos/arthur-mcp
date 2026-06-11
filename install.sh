#!/bin/bash

# Script de Instalação - MCP Full-Stack Dashboard

echo "======================================"
echo "   MCP Full-Stack Dashboard Setup"
echo "======================================"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Instalar dependências do backend
echo -e "${BLUE}1️⃣  Instalando dependências do backend...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend instalado com sucesso!${NC}"
else
    echo "❌ Erro ao instalar backend"
    exit 1
fi
echo ""

# 2. Instalar dependências do frontend
echo -e "${BLUE}2️⃣  Instalando dependências do frontend...${NC}"
cd client
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend instalado com sucesso!${NC}"
else
    echo "❌ Erro ao instalar frontend"
    exit 1
fi
cd ..
echo ""

# 3. Resumo
echo -e "${GREEN}======================================"
echo "   ✅ Instalação Concluída!"
echo "=====================================${NC}"
echo ""
echo "🚀 Próximas etapas:"
echo ""
echo "   Desenvolvimento:"
echo -e "   ${BLUE}npm run start:dev${NC}"
echo ""
echo "   Build para produção:"
echo -e "   ${BLUE}npm run build${NC}"
echo -e "   ${BLUE}npm run start${NC}"
echo ""
echo "📚 Documentação:"
echo "   - Backend: http://localhost:3000/mcp-docs"
echo "   - Dashboard: http://localhost:3000"
echo "   - Frontend Dev: http://localhost:5173"
echo ""
echo "📖 Leia o arquivo SETUP.md para mais informações"
echo ""
