# Configuração Login API - Easy Airsoft

## ✅ Implementações Concluídas

### Backend (API)

1. **CORS Habilitado** - [src/main.ts](../easy-airsoft-api/src/main.ts)

   ```typescript
   app.enableCors({
     origin: process.env.FRONTEND_URL || "http://localhost:5173",
     credentials: true,
   });
   ```

2. **Endpoint GET /auth/me** - [auth.controller.ts](../easy-airsoft-api/src/modules/auth/auth.controller.ts)
   - Retorna dados do usuário autenticado
   - Protegido com JwtAuthGuard
   - Documentado no Swagger

3. **Método getUserById** - [auth.service.ts](../easy-airsoft-api/src/modules/auth/auth.service.ts)
   - Busca usuário por ID
   - Retorna: id, email, name, username

4. **Variável de Ambiente**
   - `FRONTEND_URL` adicionada ao `.env` e `.env.example`

### Frontend

1. **Context API** - [AuthContext.tsx](../easy-airsoft-frontend/src/contexts/AuthContext.tsx)
   - Gerencia estado de autenticação global
   - Métodos: login, logout, register
   - Carrega usuário ao iniciar (se tiver token válido)

2. **Cliente Axios** - [api.ts](../easy-airsoft-frontend/src/lib/api.ts)
   - Base URL configurável via .env
   - Interceptor: adiciona token automaticamente
   - Interceptor: renova token em 401 automaticamente
   - Redireciona para login se refresh falhar

3. **Página de Login** - [LoginPage.tsx](../easy-airsoft-frontend/src/pages/LoginPage.tsx)
   - React Hook Form + Zod
   - Validação em tempo real
   - Mensagens de erro da API
   - Layout completo e responsivo

4. **Variável de Ambiente**
   - `VITE_API_URL` configurada no `.env`

## 🚀 Como Testar

### 1. Iniciar Backend

```bash
cd easy-airsoft-api
npm run start:dev
```

Acesse: http://localhost:3000/docs

### 2. Iniciar Frontend

```bash
cd easy-airsoft-frontend
npm run dev
```

Acesse: http://localhost:5173

### 3. Testar Login

1. Abra http://localhost:5173
2. Digite email e senha (ou crie conta no Swagger primeiro)
3. Clique em "Entrar"
4. Abra DevTools Console para ver o sucesso
5. Verifique localStorage: `accessToken` e `refreshToken`

### 4. Testar Renovação Automática

1. No DevTools Application > Local Storage
2. Copie o `refreshToken`
3. Delete o `accessToken`
4. Faça qualquer requisição (ex: navegue)
5. O interceptor deve renovar automaticamente

## 🔍 Debug

### Backend

**Ver logs do servidor:**

```bash
cd easy-airsoft-api
npm run start:dev
```

**Testar endpoint no Swagger:**

1. Acesse http://localhost:3000/docs
2. POST /auth/login
3. Copie o accessToken
4. Clique em "Authorize" (cadeado)
5. Cole: `Bearer {accessToken}`
6. Teste GET /auth/me

### Frontend

**Console do navegador:**

```javascript
// Ver tokens salvos
localStorage.getItem("accessToken");
localStorage.getItem("refreshToken");

// Limpar tokens
localStorage.clear();
```

**React Query DevTools:**

- Canto inferior direito (modo dev)
- Mostra todas as queries e suas states

**Network tab:**

- Veja todas as requisições
- Verifique headers (Authorization)
- Veja responses da API

## 🔐 Fluxo de Autenticação

### Login Bem-Sucedido

```
1. Usuário digita email + senha
2. Frontend valida com Zod
3. POST /auth/login
4. API valida credenciais
5. API retorna { accessToken, refreshToken, user }
6. Frontend salva tokens no localStorage
7. Frontend salva user no Context
8. Console.log "Login realizado com sucesso!"
```

### Requisição Autenticada

```
1. Frontend chama api.get('/qualquer-rota')
2. Interceptor adiciona: Authorization: Bearer {accessToken}
3. Backend valida o token
4. Retorna dados
```

### Token Expirado (Renovação Automática)

```
1. API retorna 401
2. Interceptor detecta 401
3. POST /auth/refresh com refreshToken
4. API retorna novo accessToken + refreshToken
5. Frontend salva novos tokens
6. Interceptor refaz requisição original
7. Usuário nem percebe!
```

### Refresh Falha

```
1. API retorna 401 no /auth/refresh
2. Interceptor limpa localStorage
3. Redireciona para /login
4. Usuário precisa fazer login novamente
```

## ⚙️ Configurações

### Backend (.env)

```env
FRONTEND_URL="http://localhost:5173"
JWT_SECRET="sua_chave_secreta"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN_DAYS=30
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```

## 📝 Próximos Passos

- [ ] Página de registro
- [ ] Roteamento (React Router)
- [ ] Protected routes
- [ ] Página de perfil do usuário
- [ ] Funcionalidade "Esqueceu a senha?"
- [ ] Login com Google (OAuth)

## 🐛 Problemas Comuns

### CORS Error

- Verifique se `FRONTEND_URL` está correto no backend
- Reinicie o servidor backend após alterar .env

### Token não é enviado

- Verifique se o token está no localStorage
- Veja Network tab > Headers > Authorization

### 401 Unauthorized

- Token pode estar expirado
- Verifique se JWT_SECRET é o mesmo em dev
- Limpe localStorage e faça login novamente

### Hooks error (AuthContext not provided)

- Verifique se App está envolvido em AuthProvider no main.tsx
