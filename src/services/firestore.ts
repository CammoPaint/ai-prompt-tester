import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from './firebase';
import { SavedPrompt, ApiKeys } from '../types';

let db: any = null;

if (app) {
  try {
    db = getFirestore(app);
  } catch (error) {
    console.warn('Firestore initialization failed:', error);
  }
}

export const savePromptToFirestore = async (prompt: SavedPrompt) => {
  if (!db) {
    throw new Error('Firestore is not configured. Please set up your Firebase environment variables.');
  }
  
  try {
    const { id, ...promptData } = prompt;
    const promptsRef = collection(db, 'prompts');
    const docRef = await addDoc(promptsRef, {
      ...promptData,
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
  if (!db) {
    throw new Error('Firestore is not configured. Please set up your Firebase environment variables.');
  }
  
  try {
    const { id, ...promptData } = prompt;
    const promptRef = doc(db, 'prompts', promptId);
    await setDoc(promptRef, {
      ...promptData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    throw new Error('Failed to update prompt in Firestore');
  }
};

export const getPromptsFromFirestore = async (userId: string) => {
  if (!db) {
    throw new Error('Firestore is not configured. Please set up your Firebase environment variables.');
  }
  
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
  if (!db) {
    throw new Error('Firestore is not configured. Please set up your Firebase environment variables.');
  }
  
  try {
    const promptRef = doc(db, 'prompts', promptId);
    await deleteDoc(promptRef);
  } catch (error) {
    throw new Error('Failed to delete prompt from Firestore');
  }
};

export const saveApiKeys = async (userId: string, apiKeys: ApiKeys) => {
  if (!db) {
    throw new Error('Firestore is not configured. Please set up your Firebase environment variables.');
  }
  
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { apiKeys }, { merge: true });
  } catch (error) {
    throw new Error('Failed to save API keys');
  }
};

export const getApiKeys = async (userId: string): Promise<ApiKeys> => {
  if (!db) {
    throw new Error('Firestore is not configured. Please set up your Firebase environment variables.');
  }
  
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? (userDoc.data().apiKeys || {}) : {};
  } catch (error) {
    throw new Error('Failed to fetch API keys');
  }
};