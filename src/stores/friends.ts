import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseServices } from '../firebase/config';
import { useAuthStore } from './auth';

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  receiverId: string;
  receiverName: string;
  receiverEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  friendName: string;
  friendEmail: string;
  createdAt: Date;
}

export const useFriendsStore = defineStore(
  'friends',
  () => {
    const { db } = getFirebaseServices();
    const authStore = useAuthStore();

    const friendRequests = ref<FriendRequest[]>(
      []
    );
    const friends = ref<Friend[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Computed properties
    const pendingRequests = computed(() =>
      friendRequests.value.filter(
        (req) =>
          req.receiverId === authStore.user?.uid
      )
    );

    const sentRequests = computed(() =>
      friendRequests.value.filter(
        (req) =>
          req.senderId === authStore.user?.uid
      )
    );

    const friendIds = computed(() =>
      friends.value.map((f) => f.friendId)
    );

    // Send friend request
    async function sendFriendRequest(
      receiverEmail: string
    ): Promise<boolean> {
      if (!authStore.user) return false;

      loading.value = true;
      error.value = null;

      try {
        // First, find the receiver by email
        const usersQuery = query(
          collection(db, 'users'),
          where('email', '==', receiverEmail)
        );

        const usersSnapshot = await getDocs(
          usersQuery
        );

        if (usersSnapshot.empty) {
          error.value = 'Usuário não encontrado';
          return false;
        }

        const receiverDoc = usersSnapshot.docs[0];
        const receiverData = receiverDoc.data();
        const receiverId = receiverDoc.id;

        if (receiverId === authStore.user.uid) {
          error.value =
            'Você não pode enviar solicitação para si mesmo';
          return false;
        }

        if (
          friendIds.value.includes(receiverId)
        ) {
          error.value = 'Vocês já são amigos';
          return false;
        }

        const existingRequestQuery1 = query(
          collection(db, 'friendRequests'),
          where(
            'senderId',
            '==',
            authStore.user.uid
          ),
          where('receiverId', '==', receiverId),
          where('status', '==', 'pending')
        );

        const existingRequestQuery2 = query(
          collection(db, 'friendRequests'),
          where('senderId', '==', receiverId),
          where(
            'receiverId',
            '==',
            authStore.user.uid
          ),
          where('status', '==', 'pending')
        );

        const [
          existingSnapshot1,
          existingSnapshot2,
        ] = await Promise.all([
          getDocs(existingRequestQuery1),
          getDocs(existingRequestQuery2),
        ]);

        if (!existingSnapshot1.empty) {
          error.value = 'Solicitação já enviada';
          return false;
        }

        if (!existingSnapshot2.empty) {
          error.value =
            'Este usuário já enviou uma solicitação para você. Verifique suas solicitações pendentes.';
          return false;
        }

        // Create friend request
        await addDoc(
          collection(db, 'friendRequests'),
          {
            senderId: authStore.user.uid,
            senderName:
              authStore.user.displayName ||
              'Usuário',
            senderEmail: authStore.user.email,
            receiverId,
            receiverName:
              receiverData.displayName ||
              'Usuário',
            receiverEmail: receiverData.email,
            status: 'pending',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          }
        );

        return true;
      } catch (err: any) {
        error.value = err.message;
        return false;
      } finally {
        loading.value = false;
      }
    }

    // Accept friend request
    async function acceptFriendRequest(
      requestId: string
    ): Promise<boolean> {
      if (!authStore.user) return false;

      loading.value = true;
      error.value = null;

      try {
        const requestDoc = await getDoc(
          doc(db, 'friendRequests', requestId)
        );

        if (!requestDoc.exists()) {
          error.value =
            'Solicitação não encontrada';
          return false;
        }

        const requestData = requestDoc.data();

        // Update request status
        await updateDoc(
          doc(db, 'friendRequests', requestId),
          {
            status: 'accepted',
            updatedAt: Timestamp.now(),
          }
        );

        // Create friendship records for both users
        const friendshipData1 = {
          userId: requestData.senderId,
          friendId: requestData.receiverId,
          friendName: requestData.receiverName,
          friendEmail: requestData.receiverEmail,
          createdAt: Timestamp.now(),
        };

        const friendshipData2 = {
          userId: requestData.receiverId,
          friendId: requestData.senderId,
          friendName: requestData.senderName,
          friendEmail: requestData.senderEmail,
          createdAt: Timestamp.now(),
        };

        await addDoc(
          collection(db, 'friendships'),
          friendshipData1
        );
        await addDoc(
          collection(db, 'friendships'),
          friendshipData2
        );

        return true;
      } catch (err: any) {
        error.value = err.message;
        return false;
      } finally {
        loading.value = false;
      }
    }

    // Reject friend request
    async function rejectFriendRequest(
      requestId: string
    ): Promise<boolean> {
      if (!authStore.user) return false;

      loading.value = true;
      error.value = null;

      try {
        await updateDoc(
          doc(db, 'friendRequests', requestId),
          {
            status: 'rejected',
            updatedAt: Timestamp.now(),
          }
        );

        return true;
      } catch (err: any) {
        error.value = err.message;
        return false;
      } finally {
        loading.value = false;
      }
    }

    // Remove friend
    async function removeFriend(
      friendId: string
    ): Promise<boolean> {
      if (!authStore.user) return false;

      loading.value = true;
      error.value = null;

      try {
        // Find and delete both friendship records
        const friendshipQuery1 = query(
          collection(db, 'friendships'),
          where(
            'userId',
            '==',
            authStore.user.uid
          ),
          where('friendId', '==', friendId)
        );

        const friendshipQuery2 = query(
          collection(db, 'friendships'),
          where('userId', '==', friendId),
          where(
            'friendId',
            '==',
            authStore.user.uid
          )
        );

        const [snapshot1, snapshot2] =
          await Promise.all([
            getDocs(friendshipQuery1),
            getDocs(friendshipQuery2),
          ]);

        const deletePromises = [
          ...snapshot1.docs.map((doc) =>
            deleteDoc(doc.ref)
          ),
          ...snapshot2.docs.map((doc) =>
            deleteDoc(doc.ref)
          ),
        ];

        await Promise.all(deletePromises);

        return true;
      } catch (err: any) {
        error.value = err.message;
        return false;
      } finally {
        loading.value = false;
      }
    }

    // Listen for friend requests
    function listenForFriendRequests() {
      if (!authStore.user) return;

      console.log(
        'Initializing friend requests listeners for user:',
        authStore.user.uid
      );

      // Clear existing requests
      friendRequests.value = [];

      const requestsQuery = query(
        collection(db, 'friendRequests'),
        where(
          'receiverId',
          '==',
          authStore.user.uid
        ),
        where('status', '==', 'pending')
      );

      const sentRequestsQuery = query(
        collection(db, 'friendRequests'),
        where(
          'senderId',
          '==',
          authStore.user.uid
        ),
        where('status', '==', 'pending')
      );

      // Listen for received requests
      onSnapshot(
        requestsQuery,
        (snapshot) => {
          console.log(
            'Received requests snapshot:',
            snapshot.docs.length
          );
          const receivedRequests =
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt:
                doc.data().createdAt?.toDate() ||
                new Date(),
              updatedAt:
                doc.data().updatedAt?.toDate() ||
                new Date(),
            })) as FriendRequest[];

          // Sort by creation date
          receivedRequests.sort(
            (a, b) =>
              b.createdAt.getTime() -
              a.createdAt.getTime()
          );

          // Remove old received requests and add new ones
          friendRequests.value =
            friendRequests.value.filter(
              (req) =>
                req.senderId ===
                authStore.user?.uid
            );
          friendRequests.value.push(
            ...receivedRequests
          );

          console.log(
            'Updated friendRequests after received:',
            friendRequests.value.length
          );
        },
        (error) => {
          console.error(
            'Error listening to received requests:',
            error
          );
        }
      );

      // Listen for sent requests
      onSnapshot(
        sentRequestsQuery,
        (snapshot) => {
          console.log(
            'Sent requests snapshot:',
            snapshot.docs.length
          );
          const sentRequestsData =
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt:
                doc.data().createdAt?.toDate() ||
                new Date(),
              updatedAt:
                doc.data().updatedAt?.toDate() ||
                new Date(),
            })) as FriendRequest[];

          // Sort by creation date
          sentRequestsData.sort(
            (a, b) =>
              b.createdAt.getTime() -
              a.createdAt.getTime()
          );

          // Remove old sent requests and add new ones
          friendRequests.value =
            friendRequests.value.filter(
              (req) =>
                req.receiverId ===
                authStore.user?.uid
            );
          friendRequests.value.push(
            ...sentRequestsData
          );

          console.log(
            'Updated friendRequests after sent:',
            friendRequests.value.length
          );
        },
        (error) => {
          console.error(
            'Error listening to sent requests:',
            error
          );
        }
      );
    }

    // Listen for friends
    function listenForFriends() {
      if (!authStore.user) return;

      console.log(
        'Initializing friends listener for user:',
        authStore.user.uid
      );

      const friendsQuery = query(
        collection(db, 'friendships'),
        where('userId', '==', authStore.user.uid)
      );

      onSnapshot(
        friendsQuery,
        (snapshot) => {
          console.log(
            'Friends snapshot:',
            snapshot.docs.length
          );
          const friendsData = snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt:
                doc.data().createdAt?.toDate() ||
                new Date(),
            })
          ) as Friend[];

          // Sort by creation date
          friendsData.sort(
            (a, b) =>
              b.createdAt.getTime() -
              a.createdAt.getTime()
          );

          friends.value = friendsData;
          console.log(
            'Updated friends:',
            friends.value.length
          );
        },
        (error) => {
          console.error(
            'Error listening to friends:',
            error
          );
        }
      );
    }

    // Check if user is friend
    function isFriend(userId: string): boolean {
      return friendIds.value.includes(userId);
    }

    // Initialize listeners
    function initialize() {
      console.log(
        'Initializing friends store, user:',
        authStore.user
      );
      if (authStore.user) {
        listenForFriendRequests();
        listenForFriends();
      }
    }

    return {
      friendRequests,
      friends,
      pendingRequests,
      sentRequests,
      friendIds,
      loading,
      error,
      sendFriendRequest,
      acceptFriendRequest,
      rejectFriendRequest,
      removeFriend,
      isFriend,
      initialize,
    };
  }
);
