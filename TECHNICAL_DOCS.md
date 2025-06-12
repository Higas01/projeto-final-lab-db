# 📋 Documentação Técnica - Rede Social

## 🏗️ Arquitetura de Dados Firebase

### **Visão Geral da Arquitetura**

```mermaid
graph TB
    subgraph "Frontend (Vue.js)"
        A[Vue Components] --> B[Pinia Stores]
        B --> C[Firebase SDK]
    end

    subgraph "Firebase Services"
        D[Firebase Auth]
        E[Firestore Database]
        F[Realtime Database]
    end

    subgraph "Data Flow"
        C --> D
        C --> E
        C --> F

        D --> G[User Authentication]
        E --> H[Persistent Data]
        F --> I[Real-time Data]
    end

    H --> J[Posts, Users, Friends]
    I --> K[Chat, Status, Notifications]
```

## 🗄️ Modelagem Conceitual Firebase

### **Firebase Firestore (Dados Persistentes)**

```mermaid
erDiagram
    USERS ||--o{ POSTS : creates
    USERS ||--o{ FRIEND_REQUESTS : sends
    USERS ||--o{ FRIEND_REQUESTS : receives
    USERS ||--o{ FRIENDSHIPS : has
    POSTS ||--o{ COMMENTS : contains
    POSTS ||--o{ POST_LIKES : receives

    USERS {
        string uid PK "Firebase Auth UID"
        string email UK "Email único"
        string displayName "Nome de exibição"
        string photoURL "URL da foto"
        timestamp createdAt "Data de criação"
        timestamp updatedAt "Última atualização"
        boolean emailVerified "Email verificado"
    }

    POSTS {
        string id PK "Document ID"
        string title "Título do post"
        string content "Conteúdo"
        string authorId FK "ID do autor"
        string authorName "Nome do autor (desnormalizado)"
        timestamp createdAt "Data de criação"
        timestamp updatedAt "Data de edição"
        number commentCount "Contador de comentários"
        number likeCount "Contador de likes"
        array likedBy "IDs dos usuários que curtiram"
    }

    COMMENTS {
        string id PK "Document ID"
        string content "Conteúdo do comentário"
        string authorId FK "ID do autor"
        string authorName "Nome do autor (desnormalizado)"
        timestamp createdAt "Data de criação"
    }

    FRIEND_REQUESTS {
        string id PK "Document ID"
        string senderId FK "ID do remetente"
        string receiverId FK "ID do destinatário"
        string status "pending|accepted|rejected"
        timestamp createdAt "Data da solicitação"
        timestamp updatedAt "Data da atualização"
        string senderName "Nome do remetente (desnormalizado)"
        string receiverName "Nome do destinatário (desnormalizado)"
    }

    FRIENDSHIPS {
        string id PK "Document ID"
        string userId FK "ID do usuário"
        string friendId FK "ID do amigo"
        string friendName "Nome do amigo    "
        timestamp createdAt "Data da amizade"
    }

    POST_LIKES {
        string id PK "Document ID"
        string postId FK "ID do post"
        string userId FK "ID do usuário"
        timestamp createdAt "Data do like"
    }
```

### **Firebase Realtime Database (Dados em Tempo Real)**

```mermaid
erDiagram
    CHAT ||--o{ MESSAGES : contains
    USERS ||--|| USER_STATUS : has
    USERS ||--o{ UNREAD_COUNTS : has

    CHAT {
        string chatId PK "userId1_userId2"
        object messages "Mensagens do chat"
    }

    MESSAGES {
        string messageId PK "Push ID"
        string senderId "ID do remetente"
        string recipientId "ID do destinatário"
        string senderName "Nome do remetente"
        string content "Conteúdo da mensagem"
        number timestamp "Timestamp em milissegundos"
        boolean read "Mensagem foi lida"
    }

    USER_STATUS {
        string userId PK "ID do usuário"
        boolean isOnline "Status online/offline"
        number lastSeen "Timestamp da última atividade"
        number updatedAt "Última atualização"
    }

    UNREAD_COUNTS {
        string userId PK "ID do proprietário"
        object counts "fromUserId: count"
    }
```

## 🔄 Estrutura Detalhada dos Bancos

### **Firestore Collections Structure**

```
firestore/
├── users/
│   └── {userId}/
│       ├── uid: string
│       ├── email: string
│       ├── displayName: string
│       ├── photoURL?: string
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       └── emailVerified: boolean
│
├── posts/
│   └── {postId}/
│       ├── id: string
│       ├── title: string
│       ├── content: string
│       ├── authorId: string
│       ├── authorName: string
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       ├── commentCount: number
│       ├── likeCount: number
│       ├── likedBy: string[]
│       └── comments/ (subcollection)
│           └── {commentId}/
│               ├── id: string
│               ├── content: string
│               ├── authorId: string
│               ├── authorName: string
│               └── createdAt: timestamp
│
├── friendRequests/
│   └── {requestId}/
│       ├── id: string
│       ├── senderId: string
│       ├── receiverId: string
│       ├── status: "pending" | "accepted" | "rejected"
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       ├── senderName: string
│       └── receiverName: string
│
└── friendships/
    └── {friendshipId}/
        ├── id: string
        ├── userId: string
        ├── friendId: string
        ├── friendName: string
        └── createdAt: timestamp
```

### **Realtime Database Structure**

```
realtime-db/
├── chats/
│   └── {userId1}_{userId2}/
│       └── messages/
│           └── {pushId}/
│               ├── senderId: string
│               ├── recipientId: string
│               ├── senderName: string
│               ├── content: string
│               ├── timestamp: number
│               └── read: boolean
│
├── status/
│   └── {userId}/
│       ├── isOnline: boolean
│       ├── lastSeen: number
│       └── updatedAt: number
│
└── unread/
    └── {userId}/
        └── {fromUserId}: number (count)
```

## 🔧 Comunicação Aplicação ↔ Firebase

### **1. Fluxo de Autenticação**

```mermaid
sequenceDiagram
    participant U as User
    participant C as Vue Component
    participant AS as Auth Store
    participant FA as Firebase Auth
    participant FS as Firestore

    U->>C: Login(email, password)
    C->>AS: login(email, password)
    AS->>FA: signInWithEmailAndPassword()
    FA-->>AS: User Object
    AS->>FS: Get user document
    FS-->>AS: User data
    AS->>AS: Update store state
    AS-->>C: Login success
    C-->>U: Redirect to home
```

### **2. Fluxo de Posts (Firestore)**

```mermaid
sequenceDiagram
    participant U as User
    participant C as Vue Component
    participant PS as Posts Store
    participant FS as Firestore

    Note over U,FS: Criar Post
    U->>C: Create post
    C->>PS: createPost(title, content)
    PS->>FS: collection('posts').add({...})
    FS-->>PS: Document reference
    PS->>PS: Update local posts array
    PS-->>C: Post created
    C-->>U: Show success message

    Note over U,FS: Curtir Post
    U->>C: Like post
    C->>PS: toggleLike(postId)
    PS->>FS: Update post.likedBy and likeCount
    FS-->>PS: Update successful
    PS->>PS: Update local state
    PS-->>C: Like toggled
    C-->>U: Update UI
```

### **3. Fluxo de Chat (Realtime Database)**

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant C1 as Chat Component 1
    participant CS as Chat Store
    participant RDB as Realtime DB
    participant C2 as Chat Component 2
    participant U2 as User 2

    Note over U1,U2: Enviar Mensagem
    U1->>C1: Send message
    C1->>CS: sendMessage(content)
    CS->>RDB: push('/chats/{chatId}/messages', {...})
    CS->>RDB: set('/unread/{recipientId}/{senderId}', count+1)
    RDB-->>CS: Message sent
    CS->>CS: Update local messages
    CS-->>C1: Message added
    C1-->>U1: Show message sent

    Note over U1,U2: Receber Mensagem (Tempo Real)
    RDB->>CS: onValue: New message detected
    CS->>CS: Update messages array
    CS->>CS: Trigger notification if not in chat
    CS-->>C2: New message available
    C2-->>U2: Show notification + update UI

    Note over U1,U2: Marcar como Lida
    U2->>C2: Open chat with User 1
    C2->>CS: selectUser(user1)
    CS->>RDB: Listen to messages
    CS->>RDB: markMessagesAsRead(user1.id)
    CS->>RDB: set('/unread/{user2Id}/{user1Id}', 0)
    RDB-->>CS: Messages marked as read
    CS-->>C2: Update read status
    C2-->>U2: Show read indicators
```

### **4. Fluxo de Sistema de Amizades (Firestore)**

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant C1 as Component 1
    participant FS as Friends Store
    participant DB as Firestore
    participant C2 as Component 2
    participant U2 as User 2

    Note over U1,U2: Enviar Solicitação
    U1->>C1: Send friend request
    C1->>FS: sendFriendRequest(user2.id)
    FS->>DB: collection('friendRequests').add({...})
    DB-->>FS: Request document created
    FS->>FS: Update local pendingRequests
    FS-->>C1: Request sent
    C1-->>U1: Show success message

    Note over U1,U2: Receber e Aceitar Solicitação
    U2->>C2: Check notifications
    C2->>FS: Listen to friend requests
    FS->>DB: onSnapshot where receiverId == user2.id
    DB-->>FS: New request found
    FS-->>C2: Show notification
    C2-->>U2: Display friend request

    U2->>C2: Accept request
    C2->>FS: acceptFriendRequest(requestId)
    FS->>DB: Update request status to 'accepted'
    FS->>DB: Create bidirectional friendship documents
    FS->>DB: Delete friend request
    DB-->>FS: Friendship created
    FS->>FS: Update local friends list
    FS-->>C2: Friendship established
    C2-->>U2: Show success
```
