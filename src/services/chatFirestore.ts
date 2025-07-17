import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  orderBy 
} from 'firebase/firestore';
import { app } from './firebase';
import { ChatThread, Workspace } from '../types/chat';

let db: any = null;

if (app) {
  try {
    db = getFirestore(app);
  } catch (error) {
    console.warn('Firestore initialization failed:', error);
  }
}

// Workspace operations
export const saveWorkspaceToFirestore = async (workspace: Workspace) => {
  if (!db) {
    throw new Error('Firestore is not configured. Please set up your Firebase environment variables.');
  }
  
  try {
    const { id, ...workspaceData } = workspace;
    const workspacesRef = collection(db, 'workspaces');
    const docRef = await addDoc(workspacesRef, {
      ...workspaceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    throw new Error('Failed to save workspace to Firestore');
  }
};

export const updateWorkspaceInFirestore = async (
  workspaceId: string,
  workspace: Workspace
) => {
  if (!db) {
    throw new Error('Firestore is not configured. Please set up your Firebase environment variables.');
  }
  
  try {
    const { id, ...workspaceData } = workspace;
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    await setDoc(workspaceRef, {
      ...workspaceData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    throw new Error('Failed to update workspace in Firestore');
  }
};

export const getWorkspacesFromFirestore = async (userId: string) => {
  if (!db) {
    throw new Error('Firestore is not configured. Please set up your Firebase environment variables.');
  }
  
  try {
    const workspacesRef = collection(db, 'workspaces');
    const q = query(
      workspacesRef,
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const workspaces = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Workspace[];
    
    // Sort by updatedAt in memory instead of in the query
    return workspaces.sort((a, b) => 
      new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );
  } catch (error) {
    throw new Error('Failed to fetch workspaces from Firestore');
  }
};

export const deleteWorkspaceFromFirestore = async (workspaceId: string) => {
  if (!db) {
    throw new Error('Firestore is not configured. Please set up your Firebase environment variables.');
  }
  
  try {
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    await deleteDoc(workspaceRef);
  } catch (error) {
    throw new Error('Failed to delete workspace from Firestore');
  }
};

// Thread operations
export const saveThreadToFirestore = async (thread: ChatThread) => {
  if (!db) {
    throw new Error('Firestore is not configured. Please set up your Firebase environment variables.');
  }
  
  try {
    const { id, ...threadData } = thread;
    const threadsRef = collection(db, 'threads');
    const docRef = await addDoc(threadsRef, {
      ...threadData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    throw new Error('Failed to save thread to Firestore');
  }
};

export const updateThreadInFirestore = async (
  threadId: string,
  thread: ChatThread
) => {
  if (!db) {
    throw new Error('Firestore is not configured. Please set up your Firebase environment variables.');
  }
  
  try {
    const { id, ...threadData } = thread;
    const threadRef = doc(db, 'threads', threadId);
    await setDoc(threadRef, {
      ...threadData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    throw new Error('Failed to update thread in Firestore');
  }
};

export const getThreadsFromFirestore = async (userId: string, workspaceId?: string) => {
  if (!db) {
    throw new Error('Firestore is not configured. Please set up your Firebase environment variables.');
  }
  
  try {
    const threadsRef = collection(db, 'threads');
    let q = query(
      threadsRef,
      where('userId', '==', userId)
    );
    
    if (workspaceId) {
      q = query(
        threadsRef,
        where('userId', '==', userId),
        where('workspaceId', '==', workspaceId)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    const threads = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatThread[];
    
    // Sort by updatedAt in memory instead of in the query
    return threads.sort((a, b) => 
      new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );
  } catch (error) {
    throw new Error('Failed to fetch threads from Firestore');
  }
};

export const deleteThreadFromFirestore = async (threadId: string) => {
  if (!db) {
    throw new Error('Firestore is not configured. Please set up your Firebase environment variables.');
  }
  
  try {
    const threadRef = doc(db, 'threads', threadId);
    await deleteDoc(threadRef);
  } catch (error) {
    throw new Error('Failed to delete thread from Firestore');
  }
};