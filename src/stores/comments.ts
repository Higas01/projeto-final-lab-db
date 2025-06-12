import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { getFirebaseServices } from '../firebase/config';
import { useAuthStore } from './auth';
import { usePostsStore } from './posts';

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
}

export const useCommentsStore = defineStore(
  'comments',
  () => {
    const { db } = getFirebaseServices();
    const authStore = useAuthStore();
    const postsStore = usePostsStore();

    const comments = ref<Comment[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Get comments for a post
    async function fetchComments(postId: string) {
      loading.value = true;
      error.value = null;

      // Clear previous comments immediately when starting to fetch new ones
      comments.value = [];

      try {
        const q = query(
          collection(
            db,
            'posts',
            postId,
            'comments'
          ),
          orderBy('createdAt', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const fetchedComments: Comment[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedComments.push({
            id: doc.id,
            postId,
            content: data.content,
            authorId: data.authorId,
            authorName: data.authorName,
            createdAt: data.createdAt.toDate(),
          });
        });

        comments.value = fetchedComments;
        return fetchedComments;
      } catch (err: any) {
        error.value =
          'Erro ao carregar comentários. Tente novamente.';
        throw err;
      } finally {
        loading.value = false;
      }
    }

    // Add a comment to a post
    async function addComment(
      postId: string,
      content: string
    ) {
      if (!authStore.user)
        throw new Error(
          'Você precisa estar logado para comentar'
        );

      loading.value = true;
      error.value = null;

      try {
        // Add comment to Firestore
        const commentData = {
          postId,
          content,
          authorId: authStore.user.uid,
          authorName:
            authStore.user.displayName ||
            'Anônimo',
          createdAt: serverTimestamp(),
        };

        const commentRef = await addDoc(
          collection(
            db,
            'posts',
            postId,
            'comments'
          ),
          commentData
        );

        // Increment comment count on post
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          commentCount: increment(1),
        });

        // Update local state
        const newComment: Comment = {
          id: commentRef.id,
          postId,
          content,
          authorId: authStore.user.uid,
          authorName:
            authStore.user.displayName ||
            'Anônimo',
          createdAt: new Date(),
        };

        comments.value.push(newComment);

        // Update post comment count in store if loaded
        if (
          postsStore.currentPost?.id === postId
        ) {
          postsStore.currentPost.commentCount =
            (postsStore.currentPost
              .commentCount || 0) + 1;
        }

        const postIndex =
          postsStore.posts.findIndex(
            (p) => p.id === postId
          );
        if (postIndex !== -1) {
          postsStore.posts[
            postIndex
          ].commentCount =
            (postsStore.posts[postIndex]
              .commentCount || 0) + 1;
        }

        return newComment;
      } catch (err: any) {
        error.value =
          'Erro ao adicionar comentário. Tente novamente.';
        throw err;
      } finally {
        loading.value = false;
      }
    }

    // Delete a comment
    async function deleteComment(
      postId: string,
      commentId: string
    ) {
      if (!authStore.user)
        throw new Error(
          'Você precisa estar logado para deletar um comentário'
        );

      loading.value = true;
      error.value = null;

      try {
        // Get comment data to check permissions
        const commentRef = doc(
          db,
          'posts',
          postId,
          'comments',
          commentId
        );
        const commentSnap = await getDoc(
          commentRef
        );

        if (!commentSnap.exists()) {
          throw new Error(
            'Comentário não encontrado'
          );
        }

        const commentData = commentSnap.data();

        // Get post data to check if user is post author
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
          throw new Error('Post não encontrado');
        }

        const postData = postSnap.data();

        // Check if user is comment author or post author
        if (
          commentData.authorId !==
            authStore.user.uid &&
          postData.authorId !== authStore.user.uid
        ) {
          throw new Error(
            'Você só pode deletar seus próprios comentários ou comentários em seus posts'
          );
        }

        // Delete comment
        await deleteDoc(commentRef);

        // Decrement comment count on post
        await updateDoc(postRef, {
          commentCount: increment(-1),
        });

        // Update local state
        comments.value = comments.value.filter(
          (comment) => comment.id !== commentId
        );

        // Update post comment count in store if loaded
        if (
          postsStore.currentPost?.id === postId
        ) {
          postsStore.currentPost.commentCount =
            Math.max(
              0,
              (postsStore.currentPost
                .commentCount || 0) - 1
            );
        }

        const postIndex =
          postsStore.posts.findIndex(
            (p) => p.id === postId
          );
        if (postIndex !== -1) {
          postsStore.posts[
            postIndex
          ].commentCount = Math.max(
            0,
            (postsStore.posts[postIndex]
              .commentCount || 0) - 1
          );
        }

        return { success: true };
      } catch (err: any) {
        error.value =
          'Erro ao deletar comentário. Tente novamente.';
        throw err;
      } finally {
        loading.value = false;
      }
    }

    // Clear comments (useful when navigating between posts)
    function clearComments() {
      comments.value = [];
      error.value = null;
    }

    return {
      comments,
      loading,
      error,
      fetchComments,
      addComment,
      deleteComment,
      clearComments,
    };
  }
);
