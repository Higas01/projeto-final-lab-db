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
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { getFirebaseServices } from '../firebase/config';
import { useAuthStore } from './auth';

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  commentCount: number;
  likeCount: number;
  likedBy: string[];
}

export interface NewPost {
  title: string;
  content: string;
}

export const usePostsStore = defineStore(
  'posts',
  () => {
    const { db } = getFirebaseServices();
    const authStore = useAuthStore();

    const posts = ref<Post[]>([]);
    const currentPost = ref<Post | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function fetchPosts() {
      loading.value = true;
      error.value = null;

      try {
        const q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );

        const querySnapshot = await getDocs(q);
        const fetchedPosts: Post[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedPosts.push({
            id: doc.id,
            title: data.title,
            content: data.content,
            authorId: data.authorId,
            authorName: data.authorName,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            commentCount: data.commentCount || 0,
            likeCount: data.likeCount || 0,
            likedBy: data.likedBy || [],
          });
        });

        posts.value = fetchedPosts;
        return fetchedPosts;
      } catch (err: any) {
        error.value =
          'Erro ao carregar posts. Verifique sua conexão e tente novamente.';
        throw err;
      } finally {
        loading.value = false;
      }
    }

    async function fetchPostById(postId: string) {
      loading.value = true;
      error.value = null;

      try {
        const docRef = doc(db, 'posts', postId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          currentPost.value = {
            id: docSnap.id,
            title: data.title,
            content: data.content,
            authorId: data.authorId,
            authorName: data.authorName,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            commentCount: data.commentCount || 0,
            likeCount: data.likeCount || 0,
            likedBy: data.likedBy || [],
          };
          return currentPost.value;
        } else {
          error.value = 'Post não encontrado';
          return null;
        }
      } catch (err: any) {
        error.value =
          'Erro ao carregar post. Tente novamente.';
        throw err;
      } finally {
        loading.value = false;
      }
    }

    async function createPost(newPost: NewPost) {
      if (!authStore.user)
        throw new Error(
          'Você precisa estar logado para criar um post'
        );

      loading.value = true;
      error.value = null;

      try {
        const postData = {
          title: newPost.title,
          content: newPost.content,
          authorId: authStore.user.uid,
          authorName:
            authStore.user.displayName ||
            'Anônimo',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          commentCount: 0,
          likeCount: 0,
          likedBy: [],
        };

        const docRef = await addDoc(
          collection(db, 'posts'),
          postData
        );

        const newPostWithId: Post = {
          id: docRef.id,
          ...postData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        posts.value = [
          newPostWithId,
          ...posts.value,
        ];
        return newPostWithId;
      } catch (err: any) {
        error.value =
          'Erro ao criar post. Verifique os dados e tente novamente.';
        throw err;
      } finally {
        loading.value = false;
      }
    }

    async function updatePost(
      postId: string,
      updates: {
        title?: string;
        content?: string;
      }
    ) {
      if (!authStore.user)
        throw new Error(
          'Você precisa estar logado para atualizar um post'
        );

      loading.value = true;
      error.value = null;

      try {
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
          throw new Error('Post não encontrado');
        }

        const postData = postSnap.data();

        if (
          postData.authorId !== authStore.user.uid
        ) {
          throw new Error(
            'Você só pode editar seus próprios posts'
          );
        }

        const updateData: any = {
          updatedAt: serverTimestamp(),
        };

        if (updates.title !== undefined)
          updateData.title = updates.title;
        if (updates.content !== undefined)
          updateData.content = updates.content;

        await updateDoc(postRef, updateData);

        const index = posts.value.findIndex(
          (post) => post.id === postId
        );
        if (index !== -1) {
          posts.value[index] = {
            ...posts.value[index],
            ...updateData,
            updatedAt: new Date(),
          };
        }

        if (currentPost.value?.id === postId) {
          currentPost.value = {
            ...currentPost.value,
            ...updateData,
            updatedAt: new Date(),
          };
        }

        return { id: postId, ...updateData };
      } catch (err: any) {
        error.value =
          'Erro ao atualizar post. Tente novamente.';
        throw err;
      } finally {
        loading.value = false;
      }
    }

    async function deletePost(postId: string) {
      if (!authStore.user)
        throw new Error(
          'Você precisa estar logado para deletar um post'
        );

      loading.value = true;
      error.value = null;

      try {
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
          throw new Error('Post não encontrado');
        }

        const postData = postSnap.data();

        if (
          postData.authorId !== authStore.user.uid
        ) {
          throw new Error(
            'Você só pode deletar seus próprios posts'
          );
        }

        await deleteDoc(postRef);

        posts.value = posts.value.filter(
          (post) => post.id !== postId
        );
        if (currentPost.value?.id === postId) {
          currentPost.value = null;
        }

        return { success: true };
      } catch (err: any) {
        error.value =
          'Erro ao deletar post. Tente novamente.';
        throw err;
      } finally {
        loading.value = false;
      }
    }

    async function toggleLike(postId: string) {
      if (!authStore.user)
        throw new Error(
          'Você precisa estar logado para curtir um post'
        );

      try {
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
          throw new Error('Post não encontrado');
        }

        const postData = postSnap.data();
        const likedBy = postData.likedBy || [];
        const isLiked = likedBy.includes(
          authStore.user.uid
        );

        if (isLiked) {
          // Remove like
          await updateDoc(postRef, {
            likedBy: arrayRemove(
              authStore.user.uid
            ),
            likeCount: increment(-1),
          });
        } else {
          // Add like
          await updateDoc(postRef, {
            likedBy: arrayUnion(
              authStore.user.uid
            ),
            likeCount: increment(1),
          });
        }

        // Update local state
        const updatePosts = (
          postsList: Post[]
        ) => {
          return postsList.map((post) => {
            if (post.id === postId) {
              const newLikedBy = isLiked
                ? post.likedBy.filter(
                    (uid) =>
                      uid !== authStore.user!.uid
                  )
                : [
                    ...post.likedBy,
                    authStore.user!.uid,
                  ];

              return {
                ...post,
                likedBy: newLikedBy,
                likeCount: newLikedBy.length,
              };
            }
            return post;
          });
        };

        posts.value = updatePosts(posts.value);

        if (currentPost.value?.id === postId) {
          const newLikedBy = isLiked
            ? currentPost.value.likedBy.filter(
                (uid) =>
                  uid !== authStore.user!.uid
              )
            : [
                ...currentPost.value.likedBy,
                authStore.user!.uid,
              ];

          currentPost.value = {
            ...currentPost.value,
            likedBy: newLikedBy,
            likeCount: newLikedBy.length,
          };
        }

        return !isLiked;
      } catch (err: any) {
        error.value =
          'Erro ao curtir post. Tente novamente.';
        throw err;
      }
    }

    async function fetchUserPosts(
      userId: string
    ) {
      loading.value = true;
      error.value = null;

      try {
        const q = query(
          collection(db, 'posts'),
          where('authorId', '==', userId),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const userPosts: Post[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          userPosts.push({
            id: doc.id,
            title: data.title,
            content: data.content,
            authorId: data.authorId,
            authorName: data.authorName,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            commentCount: data.commentCount || 0,
            likeCount: data.likeCount || 0,
            likedBy: data.likedBy || [],
          });
        });

        return userPosts;
      } catch (err: any) {
        error.value =
          'Erro ao carregar posts do usuário. Tente novamente.';
        throw err;
      } finally {
        loading.value = false;
      }
    }

    return {
      posts,
      currentPost,
      loading,
      error,
      fetchPosts,
      fetchPostById,
      getPostById: fetchPostById, // Alias for compatibility
      createPost,
      updatePost,
      deletePost,
      toggleLike,
      fetchUserPosts,
    };
  }
);
