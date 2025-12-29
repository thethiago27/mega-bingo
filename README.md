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

- `/` - Página inicial (criar ou entrar em sala)
- `/criar-sala` - Criar nova sala de bingo
- `/entrar` - Entrar em uma sala existente
- `/sala/[id]` - Tela do jogador com cartela
- `/admin/[id]` - Tela de sorteio (admin)

## 🎮 Como funciona

1. **Admin cria sala** → Gera ID único
2. **Jogadores entram** → Digitam nome e recebem cartela com 20 números (1-100)
3. **Admin sorteia** → Números aparecem em tempo real para todos
4. **Jogadores marcam** → Cartela marca automaticamente
5. **Bingo!** → Sistema detecta quando alguém completa a cartela

## 🔥 Firebase

- **Realtime Database** - Sincronização em tempo real
- **Hosting** - Deploy estático

## 📝 Scripts

```bash
pnpm dev              # Desenvolvimento
pnpm build            # Build de produção
pnpm deploy           # Deploy completo
pnpm deploy:hosting   # Deploy apenas hosting
pnpm deploy:database  # Deploy apenas regras do database
```
