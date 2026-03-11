# Checklist de Features — Easy Airsoft

**Atualizado em:** 07/03/2026

Este checklist separa claramente o status por camada:

- **Frontend**: experiência e fluxos visíveis ao usuário.
- **Backend**: APIs, regras de negócio, validações e persistência.

---

## Frontend

### ✅ Já implementado

#### Autenticação e conta
- [x] Login
- [x] Cadastro
- [x] Confirmação de email (via token)
- [x] Esqueci minha senha
- [x] Reset de senha
- [x] Renovação automática de token (refresh)
- [x] Logout
- [x] Guard de rota protegida

#### Home e descoberta
- [x] Lista de jogos disponíveis
- [x] Filtro por estado
- [x] Filtro por cidade
- [x] Filtro por data
- [x] Filtro por distância (raio em km)
- [x] Uso de geolocalização no navegador

#### Participação em jogo
- [x] Marcar `CONFIRMED`
- [x] Marcar `INTERESTED`
- [x] Marcar `CANCELLED`

#### Times
- [x] Criar time
- [x] Visualizar meus times
- [x] Ver overview de time
- [x] Editar dados do time
- [x] Gerar/renovar código de convite
- [x] Entrar em time por código
- [x] Deep link de convite (`/invite?code=...`)
- [x] Gerenciar membros (alterar role/remover)
- [x] Excluir time (fluxo de confirmação)

#### Campos
- [x] Criar campo
- [x] Editar campo
- [x] Upload de fotos do campo
- [x] Seleção de coordenadas manual
- [x] Seleção de coordenadas por endereço
- [x] Seleção de coordenadas por mapa (Leaflet)

#### Jogos
- [x] Criar jogo
- [x] Selecionar time e campo no fluxo de criação
- [x] Editar jogo pela interface
- [x] Controle de status do jogo (`ACTIVE/CANCELLED/FINISHED`)

#### Perfil
- [x] Visualizar perfil autenticado
- [x] Editar perfil
- [x] Upload de foto de perfil

#### Infra/UI
- [x] React Query para cache e invalidação
- [x] Formulários com React Hook Form + Zod
- [x] Axios com interceptors
- [x] Design system base e layout responsivo

#### Social e engajamento
- [x] Seguir / deixar de seguir time
- [x] Tela/lista de notificações com badge de não lidas no menu
- [x] Marcar notificação como lida na UI
- [x] Avaliar campo (upsert por autenticado)
- [x] Avaliar jogo (somente participante CONFIRMED)

### ⏳ Ainda não implementado (na interface)

#### Social e engajamento
- [x] Seguir / deixar de seguir time
- [x] Tela/lista de notificações
- [x] Marcar notificação como lida na UI
- [x] Avaliar campo
- [x] Avaliar jogo

#### Jogos (gestão avançada)
- [x] Edição de jogo pela interface
- [x] Controle visual de status do jogo (`ACTIVE/CANCELLED/FINISHED`)

#### Produto (futuro)
- [ ] Fluxo de venda interna de vagas
- [ ] Pagamentos integrados
- [ ] Feed social/comentários
- [ ] Ranking/reputação visível em produto

---

## Backend

### ✅ Já implementado

#### Auth e segurança
- [x] Registro de usuário
- [x] Login com senha (hash com bcrypt)
- [x] Access token JWT
- [x] Refresh token com rotação/revogação
- [x] Logout por sessão e logout global
- [x] Confirmação de email por token
- [x] Forgot password
- [x] Reset password com token e expiração
- [x] Troca de senha (`change-password`)
- [x] Rate limiting para endpoints sensíveis de auth

#### Usuários
- [x] `GET /users/me`
- [x] `PATCH /users/me`
- [x] `GET /users/:id/public`

#### Times
- [x] Criar time
- [x] Editar time
- [x] Soft delete de time
- [x] Listar meus times
- [x] Detalhar time
- [x] Listar membros
- [x] Adicionar membro
- [x] Alterar role de membro
- [x] Remover membro
- [x] Gerar código de convite com expiração
- [x] Entrar por código de convite
- [x] Permissões por papel (`OWNER`, `ADMIN`, `MEMBER`)

#### Campos
- [x] Criar campo
- [x] Editar campo
- [x] Detalhar campo
- [x] Listar campos com paginação/filtros
- [x] Upload lógico de fotos (persistência de URLs)
- [x] Limites de foto por campo
- [x] Validação de host HTTPS/S3 para fotos
- [x] Avaliação de campo (upsert)

#### Jogos e participação
- [x] Criar jogo
- [x] Atualizar jogo
- [x] Listar jogos com paginação
- [x] Filtros por cidade/estado/data/status
- [x] Filtro geográfico por latitude/longitude + raio
- [x] Atualizar participação (`CONFIRMED/INTERESTED/CANCELLED`)
- [x] Limite de confirmados por `maxPlayers`
- [x] Recalcular contadores de participação

#### Social
- [x] Seguir time
- [x] Deixar de seguir time
- [x] Listar times seguidos
- [x] Criar notificações de novo jogo para seguidores
- [x] Listar notificações
- [x] Marcar notificação como lida
- [x] Avaliar jogo (somente participante `CONFIRMED`)
- [x] Avaliar campo

#### Uploads
- [x] `POST /uploads/presign` para URL pré-assinada S3
- [x] Validação de tipo/tamanho
- [x] Limites anti-abuso por usuário

#### Plataforma
- [x] Swagger em `/docs`
- [x] ValidationPipe global
- [x] Response interceptor global
- [x] ApiExceptionFilter global

### ⏳ Ainda não implementado / parcial no backend

#### Notificações (entrega)
- [ ] Entrega real de push notification (além de persistência no banco)
- [ ] Entrega real de notificações por email para novos jogos (preferências já modeladas)

#### Produto (futuro)
- [ ] Módulo de pagamentos
- [ ] Venda interna de vagas no jogo
- [ ] Reputação/ranking com regras de negócio fechadas
- [ ] Feed social/comentários

---

## Observação rápida

- Há features **já prontas no backend** mas ainda **não expostas no frontend** (principalmente: followers, notificações e reviews). Esse é o principal gap atual entre as camadas.
