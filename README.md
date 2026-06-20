# 🎰 Mega Bingo

Sistema de Bingo Online em Tempo Real usando Next.js e Firebase Realtime Database.

## 🚀 Configuração

### 1. Criar instância do Realtime Database

Acesse o [Console do Firebase](https://console.firebase.google.com/project/mega-bingo-480a2/database) e crie uma instância do Realtime Database:

1. Vá em **Build** → **Realtime Database**
2. Clique em **Create Database**
3. Escolha a localização: **United States (us-central1)**
4. Modo: **Start in test mode** (as regras já estão configuradas localmente)

### 2. Deploy das regras

Após criar a instância, faça o deploy das regras:

```bash
pnpm deploy:database
```

### 3. Rodar localmente

```bash
pnpm dev
```

Acesse: http://localhost:3000

## 📦 Estrutura

- `/` - Página inicial (jogar ou entrar como admin)
- `/entrar` - Entrar em uma sala usando o código
- `/entrar/[roomId]` - Entrar direto via link compartilhado
- `/sala/[id]` - Tela do jogador com a cartela
- `/admin/login` - Login do admin (anônimo)
- `/admin` - Painel do admin (lista de salas)
- `/admin/create-room` - Criar nova sala
- `/admin/room/[roomId]` - Tela de sorteio e gerenciamento da sala

## 🎮 Como funciona

1. **Admin cria sala** → Gera ID único (o admin vira dono da sala)
2. **Jogadores entram** → Digitam nome e recebem uma cartela com 10 números (1-60)
3. **Admin sorteia** → Números aparecem em tempo real para todos
4. **Jogadores marcam** → A cartela marca os números sorteados
5. **Bingo!** → O sistema detecta quando alguém completa a cartela

## 🔥 Firebase

- **Realtime Database** - Sincronização em tempo real
- **Hosting** - Deploy estático

## 📝 Scripts

```bash
pnpm dev              # Desenvolvimento
pnpm build            # Build de produção
pnpm test             # Testes (Vitest)
pnpm typecheck        # Checagem de tipos (tsc --noEmit)
pnpm lint             # Lint (Biome)
pnpm check            # Lint + format com --write (Biome)
pnpm deploy           # Deploy completo
pnpm deploy:hosting   # Deploy apenas hosting
pnpm deploy:database  # Deploy apenas regras do database
```
