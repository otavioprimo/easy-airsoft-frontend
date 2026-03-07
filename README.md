# Easy Airsoft - Frontend

Frontend do Easy Airsoft desenvolvido com React + TypeScript, focado em organização regional de partidas de airsoft.

Status atual: MVP funcional com autenticação, gestão de times/campos/jogos, participação em partidas e edição de perfil.

## 🎨 Design System

### Cores Principais

- **Primária**: `#0A1F44` (azul profundo)
- **Destaque**: `#2DFF7B` (verde neon)
- **Neutro Claro**: `#F5F7FA`
- **Neutro Escuro**: `#1E1E1E`
- **Texto Escuro**: `#222222`

### Uso no Tailwind

```tsx
className = "bg-primary"; // Cor primária
className = "text-accent"; // Cor de destaque (verde neon)
className = "bg-neutral-light"; // Fundo claro
className = "bg-neutral-dark"; // Fundo escuro
className = "text-text-dark"; // Texto escuro
```

## 🚀 Tecnologias

- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS 4** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis e não estilizados
- **React Query (TanStack Query)** - Gerenciamento de requisições e cache
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Axios** - Cliente HTTP com interceptors
- **React Router** - Roteamento da aplicação
- **Leaflet** - Mapa interativo para seleção de coordenadas de campos

## 📦 Instalação

```bash
npm install
```

## 🛠️ Scripts Disponíveis

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Visualizar build de produção
npm run preview

# Lint do código
npm run lint
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── home/            # Home (filtro/lista/cards de jogos e times)
│   ├── layout/          # Layouts de app e auth
│   ├── team/            # Gestão de membros do time
│   ├── auth/            # Rotas protegidas
│   └── ui/              # Componentes base reutilizáveis
├── contexts/
│   └── AuthContext.tsx  # Estado global de autenticação
├── hooks/
│   ├── useAuth.ts
│   ├── useLocationDateFilters.ts
│   └── queries/         # Hooks React Query por domínio
├── lib/
│   ├── api.ts           # Cliente axios com interceptors
│   ├── query-client.ts  # Configuração do React Query
│   ├── team-invite.ts   # Deep link /invite?code=...
│   └── utils.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ConfirmEmailPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── HomePage.tsx
│   ├── ProfilePage.tsx
│   ├── CreateTeamPage.tsx
│   ├── TeamOverviewPage.tsx
│   ├── TeamDetailsPage.tsx
│   ├── CreateFieldPage.tsx
│   ├── EditFieldPage.tsx
│   ├── CreateGamePage.tsx
│   └── InviteTeamPage.tsx
├── docs/                # Documentação técnica
│   ├── AUTH.md          # Sistema de autenticação
│   └── FORMS.md         # Guia de formulários
├── App.tsx
├── main.tsx
└── index.css            # Estilos globais e Tailwind
```

## 🎯 Estado Atual

### ✅ Implementado

- [x] Setup inicial do projeto com Vite + React + TypeScript
- [x] Configuração do Tailwind CSS 4 com cores personalizadas
- [x] Componentes base de UI e layouts reutilizáveis
- [x] Sistema de autenticação completo (register, login, refresh, logout)
- [x] Confirmação de email
- [x] Recuperação e redefinição de senha
- [x] React Query para gerenciamento de requisições
- [x] React Hook Form + Zod para validação de formulários
- [x] Interceptors axios para renovação automática de tokens
- [x] Home com listagem de jogos e filtros por localização/data
- [x] Participação em jogos (`CONFIRMED`, `INTERESTED`, `CANCELLED`)
- [x] Criação de times
- [x] Gestão de time (editar dados, gerar convite, gerenciar membros, excluir time)
- [x] Entrada em time por código (incluindo deep link)
- [x] Criação e edição de campos com mapa (Leaflet) e geocodificação por endereço
- [x] Upload de imagens (perfil/time/campos) com URL pré-assinada
- [x] Criação de jogos por usuários com permissão
- [x] Edição de perfil

### 📝 Próximos Passos

- [ ] Expor no frontend o fluxo de seguir/deixar de seguir times
- [ ] Expor no frontend o módulo de notificações
- [ ] Expor no frontend avaliações de campos e jogos
- [ ] Evoluir UX de gestão de jogos (edição/cancelamento pela interface)

## 🌐 Acesso

Após iniciar o servidor de desenvolvimento, acesse:

- **Local**: http://localhost:5173/

## 📝 Notas

- A aplicação já possui múltiplas páginas e fluxo autenticado completo
- Tokens são salvos no localStorage e renovados automaticamente
- Validação de formulários com React Hook Form + Zod
- React Query DevTools disponível no canto inferior (modo dev)
- Consulte [docs/AUTH.md](docs/AUTH.md) para detalhes sobre autenticação
- Consulte [docs/FORMS.md](docs/FORMS.md) para guia de formulários
- Consulte [docs/FEATURE_CHECKLIST.md](docs/FEATURE_CHECKLIST.md) para status de features (frontend x backend)
- Consulte [PRD.md](PRD.md) para visão de produto e escopo funcional atualizado

```

```
