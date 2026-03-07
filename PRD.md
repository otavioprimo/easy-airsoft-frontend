# PRD — Easy Airsoft

**Última atualização:** 07/03/2026  
**Escopo desta versão:** refletir o estado real do produto com base no código atual do frontend e backend.

## 1) Visão do Produto

Easy Airsoft é uma plataforma para organizar partidas de airsoft de forma estruturada, substituindo fluxos manuais (grupos de WhatsApp, listas informais e controle manual de vagas).

O foco atual é **MVP operacional de organização de partidas**, com base em:

- gestão de contas e autenticação segura;
- criação e gestão de times;
- cadastro e gestão de campos;
- criação de jogos;
- participação em jogos com controle de vagas;
- descoberta de jogos com filtros regionais e por distância.

## 2) Problema que o Produto Resolve

Hoje, grupos organizam jogos de forma descentralizada e sem histórico consistente. Isso gera:

- overbooking de vagas;
- baixa visibilidade de jogos da região;
- dificuldade para administrar times e membros;
- falta de padronização em dados de campo/jogo.

O Easy Airsoft resolve esse cenário com fluxos estruturados e regras de permissão no backend.

## 3) Entidades de Domínio

As entidades principais do sistema atual são:

1. **Usuário**
	- dados de perfil (nome, username, bio, cidade/estado, foto);
	- credenciais e sessão (password hash, refresh tokens);
	- confirmação de email e recuperação de senha.

2. **Time**
	- dados públicos (nome, descrição, cidade/estado, logo);
	- membros com papéis (`OWNER`, `ADMIN`, `MEMBER`);
	- convite por código com expiração;
	- soft delete.

3. **Campo**
	- vínculo com time;
	- localização geográfica (latitude/longitude);
	- cidade/estado;
	- até 10 fotos por campo.

4. **Jogo**
	- vínculo com time e campo;
	- título, descrição, data/hora, maxPlayers, preço opcional;
	- link externo opcional de ingresso;
	- status (`ACTIVE`, `CANCELLED`, `FINISHED`);
	- contadores de participantes (`confirmedCount`, `interestedCount`).

5. **Participação em Jogo**
	- status por usuário: `CONFIRMED`, `INTERESTED`, `CANCELLED`.

6. **Social/Engajamento (já modelado na API)**
	- seguidores de times;
	- notificações;
	- avaliações de campo e de jogo.

## 4) Escopo Entregue (MVP Atual)

### 4.1 Autenticação e Conta

**Implementado (frontend + backend):**

- cadastro de usuário com validações;
- login com JWT + refresh token;
- refresh automático via interceptor no frontend;
- logout;
- confirmação de email por token;
- fluxo de recuperação de senha (`forgot-password` + `reset-password`);
- alteração de senha no backend;
- rate limit para endpoints sensíveis de autenticação;
- revogação/rotação de refresh tokens.

### 4.2 Home e Descoberta de Jogos

**Implementado na interface:**

- listagem de jogos disponíveis;
- filtros por estado, cidade, data e raio em km;
- uso de geolocalização do usuário para filtro por distância;
- ação de participação no jogo (`CONFIRMED`, `INTERESTED`, `CANCELLED`);
- card de entrada em time por código de convite.

**Implementado no backend:**

- listagem paginada;
- filtro por cidade/estado/data/status;
- filtro geográfico por latitude/longitude + raio;
- ordenação por data/hora.

### 4.3 Times

**Implementado (frontend + backend):**

- criação de time;
- edição de dados do time;
- upload de logo via URL pré-assinada (S3);
- visão geral do time;
- listagem de membros;
- gestão de membros (alterar role e remover, com regras por papel);
- geração/renovação de código de convite com expiração;
- entrada no time por código;
- deep link de convite (`/invite?code=...`);
- exclusão de time por soft delete (somente `OWNER`).

### 4.4 Campos

**Implementado (frontend + backend):**

- criação e edição de campo;
- seleção de coordenadas por:
  - entrada manual;
  - busca por endereço (Nominatim/OpenStreetMap);
  - mapa interativo (Leaflet);
- upload e gestão de fotos;
- validações de latitude/longitude e limites de fotos.

### 4.5 Jogos

**Implementado (frontend + backend):**

- criação de jogo por `OWNER`/`ADMIN`;
- vínculo obrigatório com time e campo;
- dados: título, descrição, data/hora, limite de jogadores, preço opcional, link externo opcional;
- atualização de jogo no backend;
- controle de limite de confirmados no backend;
- recálculo automático de contadores de participação.

### 4.6 Perfil

**Implementado (frontend + backend):**

- consulta de perfil autenticado;
- edição de nome, bio, cidade/estado e foto de perfil;
- sincronização de dados do usuário autenticado no contexto do frontend.

### 4.7 Uploads

**Implementado (backend + frontend):**

- geração de URL pré-assinada S3 (`/uploads/presign`);
- upload direto do cliente para storage;
- validação de tipo/tamanho;
- limites anti-abuso por usuário.

## 5) Regras de Negócio Críticas

- Apenas `OWNER` e `ADMIN` podem criar/editar jogos e campos do time.
- Apenas `OWNER` pode:
  - excluir time;
  - promover membro para `ADMIN`;
  - remover `ADMIN`.
- `ADMIN` pode gerenciar time/membros com restrições (não remove `OWNER` e não remove `ADMIN`).
- Jogo com status diferente de `ACTIVE` não aceita mudança de participação.
- Status `CONFIRMED` respeita limite de `maxPlayers`.
- Time excluído usa soft delete (não aparece em listagens ativas).

## 6) Funcionalidades Já Implementadas na API, mas Ainda sem UX Completa no Frontend

1. **Seguidores de time**
	- seguir/desseguir time;
	- listar times seguidos.

2. **Notificações**
	- criação de notificação de novo jogo para seguidores;
	- listagem e marcação como lida.

3. **Avaliações (reviews)**
	- avaliar campo;
	- avaliar jogo (restrito a participantes `CONFIRMED`);
	- upsert de review (novo envio substitui anterior).

4. **Configurações de notificação e dispositivos**
	- já modelados no banco para evolução futura.

## 7) Fora do Escopo Atual (Ainda Não Entregue)

- marketplace com venda interna de vagas;
- pagamento integrado;
- feed social/comentários;
- ranking/reputação exibido em produto;
- experiência completa de notificações push/email no frontend.

## 8) Objetivo Estratégico (Mantido)

Consolidar o Easy Airsoft como hub regional de organização de partidas, conectando:

**Jogadores ↔ Times ↔ Campos ↔ Jogos**,

e evoluir em fases para camada social avançada e monetização transacional.

## 9) Próxima Fase Recomendada (Produto)

1. Expor no frontend os módulos já prontos de **seguir time** e **notificações**.
2. Expor no frontend o fluxo de **avaliação de campo e jogo**.
3. Definir MVP comercial para **ingressos internos/pagamentos** sem quebrar o fluxo atual de link externo.
4. Evoluir monitoramento operacional (métricas de conversão: visualização → participação confirmada).

















