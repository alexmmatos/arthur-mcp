# Guia de Instalação e Setup

## 1️⃣ Configuração Inicial

### Clone ou acesse o projeto
```bash
cd /home/alexandre/Documents/projects/mcp-convert/mcp
```

### Instale dependências
```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

## 2️⃣ Desenvolvimento

### Opção A: Rodar tudo junto (Recomendado)
```bash
npm run start:dev
```

Isso abre:
- 🖥️ Backend: http://localhost:3000
- 🎨 Frontend Dev: http://localhost:5173

### Opção B: Rodar separadamente

Terminal 1 - Backend:
```bash
npm run start:dev
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

## 3️⃣ Build para Produção

```bash
npm run build
```

Depois execute:
```bash
npm run start
```

Acesse: http://localhost:3000

## 4️⃣ Estrutura do Frontend

```
client/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx      # Página inicial
│   │   ├── Users.tsx          # Listagem de usuários
│   │   └── Bookings.tsx       # Listagem de reservas
│   ├── App.tsx                # Layout principal com sidebar
│   ├── main.tsx               # Entry point
│   └── index.css              # Estilos globais
├── index.html
├── vite.config.ts
└── package.json
```

## 5️⃣ Scripts Disponíveis

### Backend
```bash
npm run build:backend       # Build apenas backend
npm run start:dev          # Dev mode com hot reload
npm run test               # Testes unitários
npm run test:cov           # Testes com cobertura
npm run test:e2e           # Testes E2E
```

### Frontend
```bash
cd client
npm run dev                # Dev server
npm run build              # Build para produção
npm run preview            # Preview do build
```

## 6️⃣ Componentes do Dashboard

### Dashboard Principal
- Estatísticas (Usuários, Reservas, Status)
- Integração com API backend
- Gráficos e cards informativos

### Página de Usuários
- Tabela com listagem de usuários
- Integração com endpoint `/users`
- Dados mockados quando API não disponível

### Página de Reservas
- Tabela com listagem de reservas
- Status com badges coloridos (Confirmado, Pendente, Cancelado)
- Data/hora formatada em PT-BR

## 7️⃣ Personalização

### Mudar cores do tema
Edite [client/src/App.tsx](client/src/App.tsx#L37) na seção `createTheme`:

```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },      // Azul
    secondary: { main: '#dc004e' },    // Rosa
  },
})
```

### Adicionar novas páginas
1. Crie arquivo em `client/src/pages/`
2. Importe em `client/src/App.tsx`
3. Adicione rota em `<Routes>`
4. Adicione menu item em `menuItems`

## 8️⃣ Variáveis de Ambiente

Backend (`.env`):
```env
PORT=3000
MCP_API_KEY=super-secret-key
EXTERNAL_API_BASE_URL=https://jsonplaceholder.typicode.com
```

Frontend (automático via Vite proxy):
- API base URL é configurada no `vite.config.ts`
- Proxy automático para `/api/*` → `http://localhost:3000`

## 9️⃣ Docker

### Build
```bash
docker build -t mcp-dashboard .
```

### Run
```bash
docker run -p 3000:3000 mcp-dashboard
```

### Com docker-compose
```bash
docker-compose up -d
```

## 🔟 Troubleshooting

### Port 3000 já está em uso
```bash
# Matrar o processo
lsof -ti:3000 | xargs kill -9

# Ou usar outra porta
PORT=3001 npm run start:dev
```

### Port 5173 já está em uso
```bash
cd client
npm run dev -- --port 5174
```

### CORS error
- Verifique se o backend está rodando
- Confirme CORS habilitado em `src/main.ts`

### Dependências outdated
```bash
npm update
cd client && npm update && cd ..
```

---

🚀 **Pronto para desenvolver!**
