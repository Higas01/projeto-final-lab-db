<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useChatStore } from '../../stores/chat';
import { useToast } from '../../composables/useToast';

const chatStore = useChatStore();
const router = useRouter();
const route = useRoute();
const { addToast } = useToast();

let unsubscribeNotifications:
  | (() => void)
  | null = null;

onMounted(() => {
  // Set up global notifications
  chatStore.listenForGlobalNotifications();

  // Register callback for new message notifications
  unsubscribeNotifications =
    chatStore.onNewMessageNotification(
      (message) => {
        // Only show notification if not on chat page
        if (route.name !== 'chat') {
          showMessageNotification(message);
        }
      }
    );

  // Request notification permission
  requestNotificationPermission();
});

onUnmounted(() => {
  if (unsubscribeNotifications) {
    unsubscribeNotifications();
  }
});

function showMessageNotification(message: any) {
  const content =
    message.content.length > 50
      ? message.content.substring(0, 50) + '...'
      : message.content;

  // Create a toast notification
  addToast({
    type: 'info',
    message: `Nova mensagem de ${message.senderName}: ${content}`,
    duration: 8000,
  });

  // Also show browser notification if supported and permitted
  if (
    'Notification' in window &&
    Notification.permission === 'granted'
  ) {
    const notification = new Notification(
      `Nova mensagem de ${message.senderName}`,
      {
        body: content,
        icon: '/vite.svg',
        tag: 'chat-message',
        requireInteraction: false,
      }
    );

    notification.onclick = () => {
      window.focus();
      router.push('/chat');
      notification.close();
    };

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }
}

// Request notification permission on component load
function requestNotificationPermission() {
  if (
    'Notification' in window &&
    Notification.permission === 'default'
  ) {
    Notification.requestPermission();
  }
}

onMounted(() => {
  // Set up global notifications
  chatStore.listenForGlobalNotifications();

  // Register callback for new message notifications
  unsubscribeNotifications =
    chatStore.onNewMessageNotification(
      (message) => {
        // Only show notification if not on chat page
        if (route.name !== 'chat') {
          showMessageNotification(message);
        }
      }
    );

  // Request notification permission
  requestNotificationPermission();
});
</script>

<template>
  <!-- This component doesn't render anything visible -->
  <div></div>
</template>
