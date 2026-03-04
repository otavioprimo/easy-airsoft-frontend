# Autenticação no Easy Airsoft Frontend

## 🔐 Arquitetura de Autenticação

### Armazenamento de Tokens

**LocalStorage** é usado para armazenar tanto o `accessToken` quanto o `refreshToken`:

```typescript
localStorage.setItem("accessToken", token); // Token de acesso (15min)
localStorage.setItem("refreshToken", token); // Token de atualização (30 dias)
```

#### Por que localStorage?

- ✅ **Persistência**: Tokens sobrevivem ao fechar o navegador
- ✅ **Simplicidade**: Fácil de implementar e debugar
- ✅ **Compatibilidade**: Funciona em todos os navegadores modernos
- ⚠️ **Segurança**: Vulnerável a ataques XSS (mitigado por CSP e sanitização)

#### Alternativas consideradas:

- **httpOnly Cookies**: Mais seguro, mas requer configuração CORS complexa
- **SessionStorage**: Perde dados ao fechar a aba
- **Memory (State)**: Perde dados ao recarregar a página

## 📦 Estrutura

### 1. Context API - `AuthContext.tsx`

Gerencia o estado global de autenticação:

```tsx
const { user, isAuthenticated, login, logout, register } = useAuth();
```

**Funcionalidades:**

- `login(email, password)` - Faz login e salva tokens
- `logout()` - Remove tokens e limpa estado
- `register(data)` - Registra novo usuário
- `user` - Dados do usuário autenticado
- `isAuthenticated` - boolean indicando se está logado

### 2. Axios Config - `api.ts`

Cliente HTTP com interceptors automáticos:

**Request Interceptor:**

```typescript
// Adiciona token automaticamente em todas as requisições
config.headers.Authorization = `Bearer ${accessToken}`;
```

**Response Interceptor:**

```typescript
// Renova token automaticamente quando expira (401)
if (status === 401) {
  const newToken = await refreshToken();
  retry(originalRequest);
}
```

### 3. React Query - `query-client.ts`

Configuração global do TanStack Query:

```typescript
- staleTime: 5 minutos
- retry: 1 tentativa
- refetchOnWindowFocus: false
```

## 🔄 Fluxo de Autenticação

### Login

```
1. Usuário envia email + senha
2. API retorna accessToken + refreshToken + user
3. Frontend salva tokens no localStorage
4. Frontend salva user no contexto
5. Redireciona para dashboard
```

### Requisição Autenticada

```
1. Frontend adiciona "Bearer {accessToken}" no header
2. API valida o token
3. API retorna dados
```

### Renovação Automática

```
1. API retorna 401 (token expirado)
2. Interceptor detecta 401
3. Envia refreshToken para /auth/refresh
4. API retorna novo accessToken + refreshToken
5. Salva novos tokens
6. Refaz requisição original automaticamente
```

### Logout

```
1. Usuário clica em Logout
2. Frontend envia POST /auth/logout
3. Backend revoga o refreshToken
4. Frontend remove tokens do localStorage
5. Frontend limpa estado do usuário
6. Redireciona para login
```

## 🛠️ Uso nos Componentes

### Com Context API

```tsx
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <div>Olá, {user.name}!</div>;
}
```

### Com React Query

```tsx
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ["fields"],
    queryFn: async () => {
      const response = await api.get("/fields");
      return response.data.data;
    },
  });

  // Token é adicionado automaticamente!
}
```

## 🔒 Segurança

### Proteções Implementadas

1. **Renovação Automática**: Token renovado antes de expirar
2. **Logout em Falha**: Se refresh falhar, desloga automaticamente
3. **Token no Header**: Nunca exposto na URL
4. **HTTPS Only**: Use HTTPS em produção

### Boas Práticas

- ❌ **Não** armazene dados sensíveis no localStorage além dos tokens
- ✅ **Sempre** use HTTPS em produção
- ✅ **Implemente** CSP (Content Security Policy)
- ✅ **Valide** e sanitize inputs do usuário
- ✅ **Monitore** tentativas de login suspeitas

## 🌍 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
VITE_API_URL=http://localhost:3000
```

**Produção:**

```bash
VITE_API_URL=https://api.easyairsoft.com
```

## 📝 Exemplo Completo

```tsx
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Sucesso! Contexto atualiza automaticamente
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit">Entrar</Button>
    </form>
  );
}
```

## 🐛 Debug

### React Query Devtools

Acesse as devtools no canto inferior da tela (modo dev):

```tsx
// Já configurado em main.tsx
<ReactQueryDevtools initialIsOpen={false} />
```

### Inspecionar Tokens

Console do navegador:

```js
localStorage.getItem("accessToken");
localStorage.getItem("refreshToken");
```

### Logs de Requisições

Os interceptors logam erros automaticamente no console.
