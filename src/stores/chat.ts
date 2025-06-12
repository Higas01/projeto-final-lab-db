import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import {
  ref as dbRef,
  onValue,
  push,
  set,
  serverTimestamp,
  onDisconnect,
  query,
  orderByChild,
  limitToLast,
  off,
} from 'firebase/database';
import { getFirebaseServices } from '../firebase/config';
import { useAuthStore } from './auth';
import { useFriendsStore } from './friends';
import { getDoc, doc } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface ChatUser {
  uid: string;
  displayName: string;
  photoURL?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export const useChatStore = defineStore(
  'chat',
  () => {
    const { rtdb, db } = getFirebaseServices();
    const authStore = useAuthStore();
    const friendsStore = useFriendsStore();

    const users = ref<ChatUser[]>([]);
    const selectedUser = ref<ChatUser | null>(
      null
    );
    const messages = ref<ChatMessage[]>([]);
    const unreadCounts = ref<
      Record<string, number>
    >({});
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Notification system
    const latestMessage = ref<ChatMessage | null>(
      null
    );
    const notificationCallbacks = ref<
      Array<(message: ChatMessage) => void>
    >([]);

    // Keep track of current message listener to clean it up
    let currentMessageListener:
      | (() => void)
      | null = null;

    // Global unread listener for notifications
    let globalUnreadListener:
      | (() => void)
      | null = null;

    // Track online status
    function trackOnlineStatus() {
      if (!authStore.user) return;

      const userStatusRef = dbRef(
        rtdb,
        `status/${authStore.user.uid}`
      );
      const isOfflineForDatabase = {
        isOnline: false,
        lastSeen: serverTimestamp(),
      };

      const isOnlineForDatabase = {
        isOnline: true,
        lastSeen: serverTimestamp(),
      };

      // Create a reference to the special '.info/connected' path
      const connectedRef = dbRef(
        rtdb,
        '.info/connected'
      );

      onValue(connectedRef, (snap) => {
        if (snap.val() === false) return;

        // When we're connected, update status and set up disconnect handler
        onDisconnect(userStatusRef)
          .set(isOfflineForDatabase)
          .then(() => {
            set(
              userStatusRef,
              isOnlineForDatabase
            );
          });
      });
    }

    // Fetch friends for chat (both online and offline)
    function fetchFriendsForChat() {
      if (!authStore.user) return;

      console.log('Fetching friends for chat...');

      // Watch for changes in friends list
      const unsubscribe = watch(
        () => friendsStore.friends,
        async (friends) => {
          console.log(
            'Friends updated in chat store:',
            friends.length
          );

          const chatUsers: ChatUser[] = [];

          // Get status information for all friends
          const statusRef = dbRef(rtdb, 'status');

          try {
            const statusSnapshot =
              (await new Promise((resolve) => {
                onValue(statusRef, resolve, {
                  onlyOnce: true,
                });
              })) as any;

            const statuses =
              statusSnapshot?.val() || {};

            for (const friend of friends) {
              try {
                const userDoc = await getDoc(
                  doc(
                    db,
                    'users',
                    friend.friendId
                  )
                );

                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  const userStatus =
                    statuses[friend.friendId];

                  chatUsers.push({
                    uid: friend.friendId,
                    displayName:
                      userData.displayName ||
                      friend.friendName,
                    photoURL: userData.photoURL,
                    isOnline:
                      userStatus?.isOnline ||
                      false,
                    lastSeen: userStatus?.lastSeen
                      ? new Date(
                          userStatus.lastSeen
                        )
                      : undefined,
                  });
                }
              } catch (err) {
                console.error(
                  'Error fetching friend data:',
                  err
                );
              }
            }

            // Sort by online status first, then by name
            chatUsers.sort((a, b) => {
              if (a.isOnline && !b.isOnline)
                return -1;
              if (!a.isOnline && b.isOnline)
                return 1;
              return a.displayName.localeCompare(
                b.displayName
              );
            });

            users.value = chatUsers;
            console.log(
              'Chat users updated:',
              users.value.length
            );
          } catch (error) {
            console.error(
              'Error fetching status:',
              error
            );
          }
        },
        { immediate: true }
      );

      return unsubscribe;
    }

    // Alias for fetchFriendsForChat to maintain compatibility
    function fetchOnlineUsers() {
      return fetchFriendsForChat();
    }

    // Select a user to chat with (only if they are friends)
    function selectUser(user: ChatUser) {
      if (!friendsStore.isFriend(user.uid)) {
        error.value =
          'Você só pode conversar com amigos';
        return;
      }

      // Clear error and loading states
      error.value = null;

      // If selecting the same user, don't refetch
      if (selectedUser.value?.uid === user.uid) {
        return;
      }

      // Clean up previous message listener immediately
      if (currentMessageListener) {
        currentMessageListener();
        currentMessageListener = null;
      }

      // Clear messages immediately to prevent showing old messages
      messages.value = [];

      // Set the selected user
      selectedUser.value = user;

      // Fetch messages for the new user
      fetchMessages(user.uid);
    }

    // Fetch messages between current user and selected user
    function fetchMessages(otherUserId: string) {
      if (!authStore.user) return;

      // Clean up previous message listener
      if (currentMessageListener) {
        currentMessageListener();
        currentMessageListener = null;
      }

      // Clear messages immediately when switching users
      messages.value = [];
      loading.value = true;
      error.value = null;

      // Store the user ID we're fetching for to prevent race conditions
      const targetUserId = otherUserId;

      try {
        const chatId = getChatId(
          authStore.user.uid,
          otherUserId
        );
        const messagesRef = query(
          dbRef(rtdb, `chats/${chatId}/messages`),
          orderByChild('timestamp'),
          limitToLast(50)
        );

        const unsubscribe = onValue(
          messagesRef,
          (snapshot) => {
            // Check if we're still expecting messages for this user
            if (
              selectedUser.value?.uid !==
              targetUserId
            ) {
              console.log(
                'Ignoring messages for different user'
              );
              return;
            }

            if (!snapshot.exists()) {
              messages.value = [];
              loading.value = false;
              return;
            }

            const messagesData = snapshot.val();
            const messagesList: ChatMessage[] =
              [];

            for (const [
              id,
              message,
            ] of Object.entries(messagesData)) {
              // Handle timestamp conversion more robustly
              let timestamp: Date;
              try {
                const msgTimestamp = (
                  message as any
                ).timestamp;
                if (
                  typeof msgTimestamp === 'number'
                ) {
                  timestamp = new Date(
                    msgTimestamp
                  );
                } else if (
                  msgTimestamp &&
                  msgTimestamp.toDate
                ) {
                  timestamp =
                    msgTimestamp.toDate();
                } else {
                  timestamp = new Date();
                }
              } catch (err) {
                console.warn(
                  'Error parsing timestamp:',
                  err
                );
                timestamp = new Date();
              }

              messagesList.push({
                id,
                senderId: (message as any)
                  .senderId,
                senderName: (message as any)
                  .senderName,
                recipientId: (message as any)
                  .recipientId,
                content: (message as any).content,
                timestamp,
                read:
                  (message as any).read || false,
              });
            }

            // Double-check we're still on the same user before updating
            if (
              selectedUser.value?.uid ===
              targetUserId
            ) {
              messages.value = messagesList.sort(
                (a, b) =>
                  a.timestamp.getTime() -
                  b.timestamp.getTime()
              );
              loading.value = false;

              // Mark messages as read
              markMessagesAsRead(otherUserId);
            }
          },
          (errorSnapshot) => {
            console.error(
              'Error fetching messages:',
              errorSnapshot
            );
            if (
              selectedUser.value?.uid ===
              targetUserId
            ) {
              error.value =
                'Erro ao carregar mensagens';
              loading.value = false;
            }
          }
        );

        // Store the unsubscribe function
        currentMessageListener = unsubscribe;
      } catch (err: any) {
        console.error(
          'Error setting up message listener:',
          err
        );
        error.value = err.message;
        loading.value = false;
      }
    }

    // Send a message
    async function sendMessage(content: string) {
      if (!authStore.user || !selectedUser.value)
        return;

      // Check if users are friends before sending message
      if (
        !friendsStore.isFriend(
          selectedUser.value.uid
        )
      ) {
        error.value =
          'Você só pode enviar mensagens para amigos';
        return;
      }

      error.value = null;

      try {
        const chatId = getChatId(
          authStore.user.uid,
          selectedUser.value.uid
        );
        const messagesRef = dbRef(
          rtdb,
          `chats/${chatId}/messages`
        );

        const message = {
          senderId: authStore.user.uid,
          senderName:
            authStore.user.displayName ||
            'Anonymous',
          recipientId: selectedUser.value.uid,
          content,
          timestamp: serverTimestamp(),
          read: false,
        };

        await push(messagesRef, message);

        // Update unread counts for recipient
        const recipientUnreadRef = dbRef(
          rtdb,
          `unread/${selectedUser.value.uid}/${authStore.user.uid}`
        );
        const currentUnread =
          unreadCounts.value[
            selectedUser.value.uid
          ] || 0;
        await set(
          recipientUnreadRef,
          currentUnread + 1
        );

        return true;
      } catch (err: any) {
        error.value = err.message;
        throw err;
      }
    }

    // Mark messages as read
    async function markMessagesAsRead(
      otherUserId: string
    ) {
      if (!authStore.user) return;

      try {
        const chatId = getChatId(
          authStore.user.uid,
          otherUserId
        );
        const messagesRef = dbRef(
          rtdb,
          `chats/${chatId}/messages`
        );

        onValue(
          messagesRef,
          (snapshot) => {
            if (!snapshot.exists()) return;

            const messagesData = snapshot.val();

            for (const [
              id,
              message,
            ] of Object.entries(messagesData)) {
              if (
                (message as any).senderId ===
                  otherUserId &&
                !(message as any).read
              ) {
                // Mark message as read
                const messageRef = dbRef(
                  rtdb,
                  `chats/${chatId}/messages/${id}`
                );
                set(messageRef, {
                  ...(message as any),
                  read: true,
                });
              }
            }

            // Reset unread count
            const unreadRef = dbRef(
              rtdb,
              `unread/${
                authStore.user!.uid
              }/${otherUserId}`
            );
            set(unreadRef, 0);
          },
          { onlyOnce: true }
        ); // Only run once
      } catch (err) {
        console.error(
          'Error marking messages as read:',
          err
        );
      }
    }

    // Listen for unread message counts
    function listenForUnreadCounts() {
      if (!authStore.user) return;

      const unreadRef = dbRef(
        rtdb,
        `unread/${authStore.user.uid}`
      );

      onValue(unreadRef, (snapshot) => {
        if (!snapshot.exists()) {
          unreadCounts.value = {};
          return;
        }

        unreadCounts.value = snapshot.val();
      });
    }

    // Get total unread messages
    const totalUnreadCount = computed(() => {
      return Object.values(
        unreadCounts.value
      ).reduce(
        (acc, count) => acc + (count as number),
        0
      );
    });

    // Helper to get consistent chat ID for two users
    function getChatId(
      userId1: string,
      userId2: string
    ) {
      return userId1 < userId2
        ? `${userId1}_${userId2}`
        : `${userId2}_${userId1}`;
    }

    // Clear messages and reset chat state
    function clearMessages() {
      messages.value = [];
      selectedUser.value = null;
      error.value = null;
      loading.value = false;

      if (currentMessageListener) {
        currentMessageListener();
        currentMessageListener = null;
      }
    }

    // Listen for global message notifications (for users not in chat)
    function listenForGlobalNotifications() {
      if (!authStore.user || globalUnreadListener)
        return;

      console.log(
        'Setting up global message notifications...'
      );

      // First, initialize current unread counts
      const unreadRef = dbRef(
        rtdb,
        `unread/${authStore.user.uid}`
      );

      // Get initial unread counts
      onValue(unreadRef, (snapshot) => {
        const currentUnreads = snapshot.exists()
          ? snapshot.val()
          : {};
        const previousUnreads = {
          ...unreadCounts.value,
        };

        // Update unread counts
        unreadCounts.value = currentUnreads;

        // Check for new messages (only after initial load)
        if (
          Object.keys(previousUnreads).length > 0
        ) {
          for (const [
            senderId,
            count,
          ] of Object.entries(currentUnreads)) {
            const currentCount = count as number;
            const previousCount =
              previousUnreads[senderId] || 0;

            // If there's a new message (count increased) and we're not chatting with this user
            if (
              currentCount > previousCount &&
              currentCount > 0
            ) {
              if (
                !selectedUser.value ||
                selectedUser.value.uid !==
                  senderId
              ) {
                console.log(
                  `New message from ${senderId}, fetching for notification...`
                );
                fetchLatestMessageForNotification(
                  senderId
                );
              }
            }
          }
        }
      });

      // Store the unsubscribe function
      globalUnreadListener = () => {
        off(unreadRef);
      };
    }

    // Fetch the latest message from a specific user for notification purposes
    async function fetchLatestMessageForNotification(
      senderId: string
    ) {
      if (!authStore.user) return;

      try {
        const chatId = getChatId(
          authStore.user.uid,
          senderId
        );
        const messagesRef = query(
          dbRef(rtdb, `chats/${chatId}/messages`),
          orderByChild('timestamp'),
          limitToLast(1)
        );

        onValue(
          messagesRef,
          async (snapshot) => {
            if (!snapshot.exists()) return;

            const messagesData = snapshot.val();
            const messageId =
              Object.keys(messagesData)[0];
            const messageData =
              messagesData[messageId];

            // Only process if this message is from the sender (not from current user)
            if (
              messageData.senderId === senderId
            ) {
              const message: ChatMessage = {
                id: messageId,
                senderId: messageData.senderId,
                senderName:
                  messageData.senderName,
                recipientId:
                  messageData.recipientId,
                content: messageData.content,
                timestamp: new Date(
                  messageData.timestamp
                ),
                read: messageData.read || false,
              };

              // Update latest message and trigger notifications
              latestMessage.value = message;

              // Call all registered notification callbacks
              notificationCallbacks.value.forEach(
                (callback) => {
                  callback(message);
                }
              );
            }
          },
          { onlyOnce: true }
        );
      } catch (error) {
        console.error(
          'Error fetching latest message for notification:',
          error
        );
      }
    }

    // Register a callback for new message notifications
    function onNewMessageNotification(
      callback: (message: ChatMessage) => void
    ) {
      notificationCallbacks.value.push(callback);

      // Return unsubscribe function
      return () => {
        const index =
          notificationCallbacks.value.indexOf(
            callback
          );
        if (index > -1) {
          notificationCallbacks.value.splice(
            index,
            1
          );
        }
      };
    }

    // Clean up global listeners
    function cleanupGlobalListeners() {
      if (globalUnreadListener) {
        globalUnreadListener();
        globalUnreadListener = null;
      }

      // Clear notification callbacks
      notificationCallbacks.value = [];
    }

    // Cleanup function
    function cleanup() {
      console.log('Cleaning up chat store...');

      // Clean up current message listener
      if (currentMessageListener) {
        currentMessageListener();
        currentMessageListener = null;
      }

      // Clean up global listeners
      cleanupGlobalListeners();

      // Clear state
      messages.value = [];
      selectedUser.value = null;
      users.value = [];
      unreadCounts.value = {};
      error.value = null;
      loading.value = false;

      if (!authStore.user) return;

      try {
        // Clean up all Firebase listeners
        const statusRef = dbRef(rtdb, 'status');
        off(statusRef);

        const unreadRef = dbRef(
          rtdb,
          `unread/${authStore.user.uid}`
        );
        off(unreadRef);

        // Clean up user status
        const userStatusRef = dbRef(
          rtdb,
          `status/${authStore.user.uid}`
        );
        off(userStatusRef);
      } catch (err) {
        console.error(
          'Error during cleanup:',
          err
        );
      }
    }

    return {
      users,
      selectedUser,
      messages,
      unreadCounts,
      totalUnreadCount,
      loading,
      error,
      latestMessage,
      trackOnlineStatus,
      fetchOnlineUsers,
      fetchFriendsForChat,
      selectUser,
      sendMessage,
      listenForUnreadCounts,
      listenForGlobalNotifications,
      onNewMessageNotification,
      markMessagesAsRead,
      clearMessages,
      cleanup,
    };
  }
);
