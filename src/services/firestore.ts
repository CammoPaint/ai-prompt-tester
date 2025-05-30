import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from './firebase';
import { SavedPrompt, ApiKeys } from '../types';

const db = getFirestore(app);

export const savePromptToFirestore = async (
  userId: string,
  prompt: SavedPrompt
) => {
  try {
    const promptsRef = collection(db, 'prompts');
    const docRef = await addDoc(promptsRef, {
      ...prompt,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    throw new Error('Failed to save prompt to Firestore');
  }
};

export const updatePromptInFirestore = async (
  promptId: string,
  prompt: SavedPrompt
) => {
  try {
    const promptRef = doc(db, 'prompts', promptId);
    await setDoc(promptRef, {
      ...prompt,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    throw new Error('Failed to update prompt in Firestore');
  }
};

export const getPromptsFromFirestore = async (userId: string) => {
  try {
    const promptsRef = collection(db, 'prompts');
    const q = query(promptsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SavedPrompt[];
  } catch (error) {
    throw new Error('Failed to fetch prompts from Firestore');
  }
};

export const deletePromptFromFirestore = async (promptId: string) => {
  try {
    const promptRef = doc(db, 'prompts', promptId);
    await deleteDoc(promptRef);
  } catch (error) {
    throw new Error('Failed to delete prompt from Firestore');
  }
};

export const saveApiKeys = async (userId: string, apiKeys: ApiKeys) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { apiKeys }, { merge: true });
  } catch (error) {
    throw new Error('Failed to save API keys');
  }
};

export const getApiKeys = async (userId: string): Promise<ApiKeys> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? (userDoc.data().apiKeys || {}) : {};
  } catch (error) {
    throw new Error('Failed to fetch API keys');
  }
};