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
let firestoreAvailable = false;

if (app) {
  try {
    db = getFirestore(app);
    firestoreAvailable = true;
  } catch (error) {
    console.warn('Firestore initialization failed:', error);
    firestoreAvailable = false;
  }
}

// Helper function to check if Firestore is available
const checkFirestoreAvailable = () => {
  if (!firestoreAvailable || !db) {
    console.warn('Firestore is not available. Please configure Firebase in your environment variables.');
    return false;
  }
  return true;
};

// Workspace operations
export const saveWorkspaceToFirestore = async (workspace: Workspace) => {
  if (!checkFirestoreAvailable()) {
    throw new Error('Firestore is not configured');
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
    console.error('Error saving workspace:', error);
    throw new Error('Failed to save workspace to Firestore');
  }
};

export const updateWorkspaceInFirestore = async (
  workspaceId: string,
  workspace: Workspace
) => {
  if (!checkFirestoreAvailable()) {
    throw new Error('Firestore is not configured');
  }
  
  try {
    const { id, ...workspaceData } = workspace;
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    await setDoc(workspaceRef, {
      ...workspaceData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating workspace:', error);
    throw new Error('Failed to update workspace in Firestore');
  }
};

export const getWorkspacesFromFirestore = async (userId: string) => {
  if (!checkFirestoreAvailable()) {
    return []; // Return empty array instead of throwing error
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
    console.error('Error fetching workspaces:', error);
    return []; // Return empty array on error
  }
};

export const deleteWorkspaceFromFirestore = async (workspaceId: string) => {
  if (!checkFirestoreAvailable()) {
    throw new Error('Firestore is not configured');
  }
  
  try {
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    await deleteDoc(workspaceRef);
  } catch (error) {
    console.error('Error deleting workspace:', error);
    throw new Error('Failed to delete workspace from Firestore');
  }
};

// Thread operations
export const saveThreadToFirestore = async (thread: ChatThread) => {
  if (!checkFirestoreAvailable()) {
    throw new Error('Firestore is not configured');
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
    console.error('Error saving thread:', error);
    throw new Error('Failed to save thread to Firestore');
  }
};

export const updateThreadInFirestore = async (
  threadId: string,
  thread: ChatThread
) => {
  if (!checkFirestoreAvailable()) {
    throw new Error('Firestore is not configured');
  }
  
  try {
    const { id, ...threadData } = thread;
    const threadRef = doc(db, 'threads', threadId);
    await setDoc(threadRef, {
      ...threadData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating thread:', error);
    throw new Error('Failed to update thread in Firestore');
  }
};

export const getThreadsFromFirestore = async (userId: string, workspaceId?: string) => {
  if (!checkFirestoreAvailable()) {
    return []; // Return empty array instead of throwing error
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
    console.error('Error fetching threads:', error);
    return []; // Return empty array on error
  }
};

export const deleteThreadFromFirestore = async (threadId: string) => {
  if (!checkFirestoreAvailable()) {
    throw new Error('Firestore is not configured');
  }
  
  try {
    const threadRef = doc(db, 'threads', threadId);
    await deleteDoc(threadRef);
  } catch (error) {
    console.error('Error deleting thread:', error);
    throw new Error('Failed to delete thread from Firestore');
  }
};