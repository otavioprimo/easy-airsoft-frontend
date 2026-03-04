# Easy Airsoft - Frontend

Frontend do aplicativo Easy Airsoft desenvolvido com React, TypeScript, Tailwind CSS e Radix UI.

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
│   └── ui/              # Componentes base reutilizáveis
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── form-field.tsx
├── contexts/
│   └── AuthContext.tsx  # Contexto de autenticação
├── hooks/
│   └── useAuth.ts       # Hook de autenticação
├── lib/
│   ├── api.ts           # Cliente axios com interceptors
│   ├── query-client.ts  # Configuração do React Query
│   └── utils.ts         # Funções utilitárias
├── pages/
│   └── LoginPage.tsx    # Página de login funcional
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
- [x] Componentes base (Button, Input, Label, FormField) com Radix UI
- [x] Sistema de autenticação com JWT e refresh tokens
- [x] React Query para gerenciamento de requisições
- [x] React Hook Form + Zod para validação de formulários
- [x] Página de login funcional com validação
- [x] Interceptors axios para renovação automática de tokens
- [x] Design responsivo e moderno

### 📝 Próximos Passos

- [ ] Roteamento (React Router)
- [ ] Página de registro
- [ ] Dashboard
- [ ] Outras páginas (Perfil, Campos, Jogos, etc.)

## 🌐 Acesso

Após iniciar o servidor de desenvolvimento, acesse:

- **Local**: http://localhost:5173/

## 📝 Notas

- A página de login está funcional e integrada com a API
- Tokens são salvos no localStorage e renovados automaticamente
- Validação de formulários com React Hook Form + Zod
- React Query DevTools disponível no canto inferior (modo dev)
- Consulte [docs/AUTH.md](docs/AUTH.md) para detalhes sobre autenticação
- Consulte [docs/FORMS.md](docs/FORMS.md) para guia de formulários

```

```
