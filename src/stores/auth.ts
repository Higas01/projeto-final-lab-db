import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { getFirebaseServices } from '../firebase/config';

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const { db } = getFirebaseServices();
    const auth = getAuth();

    const user = ref<User | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const initialized = ref(false);

    async function initAuth() {
      return new Promise<void>((resolve) => {
        // Configurar persistência de sessão (padrão é LOCAL, mas vamos garantir)
        setPersistence(
          auth,
          browserLocalPersistence
        )
          .then(() => {
            onAuthStateChanged(
              auth,
              async (firebaseUser) => {
                if (firebaseUser) {
                  user.value = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email!,
                    displayName:
                      firebaseUser.displayName,
                  };

                  try {
                    const userDoc = await getDoc(
                      doc(
                        db,
                        'users',
                        firebaseUser.uid
                      )
                    );
                    if (userDoc.exists()) {
                      // Atualizar com dados mais recentes do Firestore
                      const userData =
                        userDoc.data();
                      if (
                        userData.displayName !==
                        firebaseUser.displayName
                      ) {
                        user.value.displayName =
                          userData.displayName;
                      }
                    }
                  } catch (err) {
                    console.error(
                      'Error fetching user data:',
                      err
                    );
                  }
                } else {
                  user.value = null;
                }

                initialized.value = true;
                resolve();
              }
            );
          })
          .catch((error) => {
            console.error(
              'Erro ao configurar persistência:',
              error
            );
            initialized.value = true;
            resolve();
          });
      });
    }

    async function register(
      email: string,
      password: string,
      displayName: string
    ) {
      loading.value = true;
      error.value = null;

      try {
        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        await updateProfile(userCredential.user, {
          displayName,
        });

        await setDoc(
          doc(
            db,
            'users',
            userCredential.user.uid
          ),
          {
            email,
            displayName,
            createdAt: new Date(),
          }
        );

        user.value = {
          uid: userCredential.user.uid,
          email: userCredential.user.email!,
          displayName,
        };

        return userCredential.user;
      } catch (err: any) {
        error.value = err.message;
        throw err;
      } finally {
        loading.value = false;
      }
    }

    async function login(
      email: string,
      password: string
    ) {
      loading.value = true;
      error.value = null;

      try {
        const userCredential =
          await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
        return userCredential.user;
      } catch (err: any) {
        error.value = err.message;
        throw err;
      } finally {
        loading.value = false;
      }
    }

    async function logout() {
      try {
        await signOut(auth);
        user.value = null;
      } catch (err: any) {
        error.value = err.message;
        throw err;
      }
    }

    async function updateUserProfile(
      displayName: string
    ) {
      if (!user.value) {
        throw new Error(
          'Usuário não autenticado'
        );
      }

      loading.value = true;
      error.value = null;

      try {
        // Atualizar o perfil no Firebase Auth
        await updateProfile(auth.currentUser!, {
          displayName,
        });

        // Atualizar no Firestore
        await updateDoc(
          doc(db, 'users', user.value.uid),
          {
            displayName,
            updatedAt: new Date(),
          }
        );

        // Atualizar o estado local
        user.value = {
          ...user.value,
          displayName,
        };

        return true;
      } catch (err: any) {
        error.value = err.message;
        throw err;
      } finally {
        loading.value = false;
      }
    }

    return {
      user,
      loading,
      error,
      initialized,
      initAuth,
      register,
      login,
      logout,
      updateUserProfile,
    };
  }
);
