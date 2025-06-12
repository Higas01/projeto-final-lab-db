# 🌐 Rede Social - Social Media Platform

Uma plataforma de rede social moderna construída com Vue.js 3, Firebase e TypeScript, oferecendo funcionalidades completas de interação social, sistema de amizades e chat em tempo real.

## 🚀 Funcionalidades Principais

### 🔐 **Sistema de Autenticação**

- Cadastro e login seguro com Firebase Authentication
- Perfis de usuário personalizáveis
- Gerenciamento de sessões automático

### 👥 **Sistema de Amizades**

- Envio e gerenciamento de solicitações de amizade
- Busca de usuários por email
- Notificações em tempo real para novas solicitações
- Lista de amigos com status online/offline

### 💬 **Chat em Tempo Real**

- Conversas privadas entre amigos
- Indicadores de status online/offline
- Notificações push e toast para novas mensagens
- Contador de mensagens não lidas
- Histórico de mensagens persistente

### 📝 **Sistema de Posts**

- Criação, edição e exclusão de posts
- Sistema de comentários aninhados
- Contadores de likes e comentários
- Timeline personalizada

### 🔔 **Sistema de Notificações**

- Notificações em tempo real para chat
- Notificações do navegador (Web Push)
- Notificações toast personalizadas
- Badges de contadores no navbar

## 🛠️ Tecnologias Utilizadas

### **Frontend**

- **Vue.js 3** - Framework JavaScript progressivo
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool e dev server ultrarrápido
- **Pinia** - Gerenciamento de estado moderno para Vue
- **Vue Router** - Roteamento oficial do Vue
- **Tailwind CSS** - Framework CSS utility-first
- **PostCSS** - Processamento de CSS

### **Backend/Infraestrutura**

- **Firebase Authentication** - Autenticação e gerenciamento de usuários
- **Cloud Firestore** - Banco de dados NoSQL para dados estruturados
- **Firebase Realtime Database** - Banco de dados em tempo real para chat
- **Firebase Storage** - Armazenamento de arquivos (configurado)

### **Bibliotecas e Utilitários**

- **date-fns** - Manipulação de datas
- **Autoprefixer** - Prefixos CSS automáticos

## ⚙️ Requisitos Funcionais

### **RF001 - Autenticação de Usuários**

- O sistema deve permitir cadastro de novos usuários
- O sistema deve permitir login de usuários existentes
- O sistema deve permitir logout seguro
- O sistema deve manter sessão ativa entre navegações

### **RF002 - Gerenciamento de Perfil**

- O usuário deve poder visualizar seu perfil
- O usuário deve poder editar informações do perfil
- O sistema deve exibir perfis de outros usuários

### **RF003 - Sistema de Amizades**

- O usuário deve poder buscar outros usuários por email
- O usuário deve poder enviar solicitações de amizade
- O usuário deve poder aceitar/rejeitar solicitações recebidas
- O usuário deve poder remover amigos da lista
- O sistema deve notificar sobre novas solicitações

### **RF004 - Sistema de Posts**

- O usuário deve poder criar posts com título e conteúdo
- O usuário deve poder editar seus próprios posts
- O usuário deve poder excluir seus próprios posts
- O usuário deve poder visualizar posts de outros usuários
- O sistema deve exibir contadores de likes e comentários

### **RF005 - Sistema de Comentários**

- O usuário deve poder comentar em posts
- O usuário deve poder excluir seus próprios comentários
- Autores de posts devem poder excluir comentários em seus posts
- O sistema deve atualizar contadores automaticamente

### **RF006 - Chat em Tempo Real**

- O usuário deve poder conversar apenas com amigos
- O sistema deve exibir status online/offline dos usuários
- O sistema deve mostrar contadores de mensagens não lidas
- O sistema deve marcar mensagens como lidas automaticamente

### **RF007 - Sistema de Notificações**

- O sistema deve enviar notificações de novas mensagens
- O sistema deve exibir badges de contadores no menu

## 🔒 Requisitos Não Funcionais

### **RNF001 - Performance**

- O sistema deve carregar a página inicial em menos de 3 segundos
- O chat deve ter latência máxima de 500ms para entrega de mensagens
- O sistema deve suportar pelo menos 100 usuários simultâneos

### **RNF002 - Segurança**

- Todas as senhas devem ser criptografadas pelo Firebase Auth
- O sistema deve validar todas as entradas do usuário
- Acesso ao chat deve ser restrito apenas a amigos
- Credenciais do Firebase devem estar em variáveis de ambiente

### **RNF003 - Usabilidade**

- A interface deve ser responsiva para dispositivos móveis
- Feedback visual deve ser fornecido para todas as ações
- Navegação deve ser intuitiva e consistente

### **RNF004 - Confiabilidade**

- O sistema deve ter 99% de disponibilidade
- Dados devem ser persistidos em tempo real
- O sistema deve recuperar estado após reconexão
- Backup automático de dados no Firebase

### **RNF005 - Escalabilidade**

- Arquitetura deve suportar crescimento horizontal
- Banco de dados deve ser otimizado para consultas
- Sistema de notificações deve escalar com número de usuários
- Uso eficiente de recursos do Firebase

### **RNF006 - Compatibilidade**

- Suporte para navegadores modernos (Chrome, Firefox, Safari, Edge)
- Compatibilidade com dispositivos móveis
- Suporte para notificações web push
- Funcionamento offline básico

## 🚀 Instalação e Configuração

### **Pré-requisitos**

- Node.js 18+
- npm ou pnpm
- Conta no Firebase

### **1. Clone o repositório**

```bash
git clone [url-do-repositorio]
cd project
```

### **2. Instale as dependências**

```bash
npm install
# ou
pnpm install
```

### **3. Configure o Firebase**

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative Authentication, Firestore e Realtime Database
3. Copie `.env.example` para `.env`
4. Preencha as variáveis com suas credenciais do Firebase

### **4. Execute o projeto**

```bash
npm run dev
# ou
pnpm run dev
```

### **5. Acesse a aplicação**

- Abra http://localhost:5173 no navegador
- Crie uma conta ou faça login
- Explore as funcionalidades!

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── chat/           # Componentes do chat
│   ├── comments/       # Componentes de comentários
│   ├── friends/        # Componentes de amizades
│   ├── layout/         # Layout da aplicação
│   ├── posts/          # Componentes de posts
│   └── ui/             # Componentes de interface
├── composables/        # Composables Vue
├── firebase/           # Configuração Firebase
├── router/             # Configuração de rotas
├── stores/             # Stores Pinia
└── views/              # Páginas da aplicação
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
```
