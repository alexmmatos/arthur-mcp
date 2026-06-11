# MCP Full-Stack Dashboard

Um servidor MCP com dashboard interativo construído com React, Material UI e NestJS.

## 📋 Estrutura do Projeto

```
mcp/
├── src/                    # Código do backend NestJS
│   ├── api-adapter/       # Adaptador de API
│   ├── auth/              # Autenticação
│   ├── health/            # Health checks
│   ├── logging/           # Sistema de logging
│   ├── resources/         # Recursos REST
│   ├── tools/             # Ferramentas MCP
│   └── main.ts            # Ponto de entrada
├── client/                # Frontend React com Vite
│   ├── src/
│   │   ├── pages/         # Páginas do dashboard
│   │   ├── App.tsx        # Componente principal
│   │   └── main.tsx       # Entry point
│   └── vite.config.ts     # Configuração Vite
├── test/                  # Testes E2E
└── package.json           # Scripts e dependências
```

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 20+
- npm ou yarn

### Instalação

1. **Instale as dependências do backend:**
```bash
npm install
```

2. **Instale as dependências do frontend:**
```bash
cd client && npm install && cd ..
```

### Desenvolvimento

**Rodar backend e frontend simultaneamente:**
```bash
npm run start:dev
```

Isso vai iniciar:
- Backend NestJS na porta `3000` (http://localhost:3000)
- Frontend Vite na porta `5173` (http://localhost:5173)
- Dashboard em http://localhost:3000 (após build)

**Rodar apenas o backend:**
```bash
npm run start:dev
```

**Rodar apenas o frontend:**
```bash
cd client && npm run dev
```

### Build

**Build completo (backend + frontend):**
```bash
npm run build
```

Outputs:
- Backend: `dist/`
- Frontend: `dist/public/`

**Build produção e executar:**
```bash
npm run build
npm run start
```

## 📊 Dashboard

O dashboard inclui as seguintes páginas:

- **Dashboard Principal**: Estatísticas gerais e status da API
- **Usuários**: Listagem de usuários do sistema
- **Reservas**: Gerenciamento de reservas com status
- **Configurações**: Página de configurações

## 🔧 Configuração

Variáveis de ambiente (`.env`):

```env
PORT=3000
MCP_API_KEY=super-secret-key
EXTERNAL_API_BASE_URL=https://jsonplaceholder.typicode.com
```

## 📝 API

O servidor expõe os seguintes endpoints:

- `GET /health` - Health check
- `GET /mcp` - Endpoint MCP
- `GET /mcp-docs` - Documentação MCP
- `GET /users` - Listagem de usuários
- `GET /bookings` - Listagem de reservas
- `GET /` - Dashboard web

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes com cobertura
npm run test:cov

# Testes E2E
npm run test:e2e
```

## 🐳 Docker

Build da imagem:
```bash
docker build -t mcp-dashboard .
```

Run do container:
```bash
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e MCP_API_KEY=super-secret-key \
  -e EXTERNAL_API_BASE_URL=https://jsonplaceholder.typicode.com \
  mcp-dashboard
```

## 🛠️ Tecnologias

### Backend
- **NestJS** - Framework Node.js
- **TypeScript** - Linguagem
- **Zod** - Validação de schemas
- **JWT** - Autenticação

### Frontend
- **React 18** - Biblioteca UI
- **Material UI (MUI)** - Componentes UI
- **Vite** - Build tool
- **TypeScript** - Linguagem
- **React Router** - Roteamento
- **Axios** - Cliente HTTP

## 📦 Dependências Principais

### Backend
```json
{
  "@modelcontextprotocol/sdk": "^1.0.0",
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/platform-express": "^10.0.0",
  "@rekog/mcp-nest": "1.9.10"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "@mui/material": "^5.14.0",
  "@mui/icons-material": "^5.14.0",
  "react-router-dom": "^6.20.0"
}
```

## 🔐 Segurança

- ✅ CORS habilitado para desenvolvimento
- ✅ Autenticação via API Key
- ✅ Middleware de validação
- ✅ Filtros de exceção globais

## 📚 Documentação

- Docs MCP: http://localhost:3000/mcp-docs
- API Health: http://localhost:3000/health
- Dashboard Web: http://localhost:3000

## 🤝 Contribuindo

Para contribuir com o projeto:

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para suporte, abra uma issue no repositório.

---

**Última atualização:** Junho 2026
