import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '~/lib/firebase';
import { Project, Task, Discussion, Chat, ChatMessage } from '~/types';

export class FirestoreService {
  // Projects
  static async getProject(projectId: string): Promise<Project | null> {
    try {
      const docRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          deadline: data.deadline?.toDate() || null,
        } as Project;
      }
      return null;
    } catch (error) {
      console.error('Error getting project:', error);
      return null;
    }
  }

  static async createProject(
    projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  static async getUserProjects(userId: string): Promise<Project[]> {
    try {
      const q = query(
        collection(db, 'projects'),
        where('ownerId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          deadline: data.deadline?.toDate() || null,
        } as Project;
      });
    } catch (error) {
      console.error('Error getting user projects:', error);
      return [];
    }
  }

  static async addTeamMember(
    projectId: string,
    memberEmail: string,
    role: 'member' | 'admin' = 'member'
  ) {
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        members: arrayUnion({ email: memberEmail, role, joinedAt: new Date() }),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  }

  static listenToUserProjects(
    userId: string,
    callback: (projects: Project[]) => void
  ) {
    const q = query(
      collection(db, 'projects'),
      where('ownerId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const projects = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          deadline: data.deadline?.toDate() || null,
        } as Project;
      });
      callback(projects);
    });
  }

  // Discussions
  static async createDiscussion(
    discussionData: Omit<Discussion, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    try {
      const docRef = await addDoc(collection(db, 'discussions'), {
        ...discussionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating discussion:', error);
      throw error;
    }
  }

  static async getProjectDiscussions(projectId: string): Promise<Discussion[]> {
    try {
      const q = query(
        collection(db, 'discussions'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Discussion;
      });
    } catch (error) {
      console.error('Error getting project discussions:', error);
      return [];
    }
  }

  static listenToProjectDiscussions(
    projectId: string,
    callback: (discussions: Discussion[]) => void
  ) {
    const q = query(
      collection(db, 'discussions'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const discussions = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Discussion;
      });
      callback(discussions);
    });
  }

  static async addDiscussionReply(
    discussionId: string,
    reply: string,
    authorId: string,
    authorName: string
  ) {
    try {
      const discussionRef = doc(db, 'discussions', discussionId);
      const discussionSnap = await getDoc(discussionRef);

      if (discussionSnap.exists()) {
        const currentReplies = discussionSnap.data().replies || [];
        const newReply = {
          id: Date.now().toString(),
          content: reply,
          authorId,
          authorName,
          createdAt: new Date(),
        };

        await updateDoc(discussionRef, {
          replies: [...currentReplies, newReply],
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error adding discussion reply:', error);
      throw error;
    }
  }

  // Tasks
  static async createTask(
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...taskData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  static async updateTask(taskId: string, updates: Partial<Task>) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  static async getProjectTasks(projectId: string): Promise<Task[]> {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        dueDate: doc.data().dueDate?.toDate() || null,
      })) as Task[];
    } catch (error) {
      console.error('Error getting project tasks:', error);
      return [];
    }
  }

  static listenToProjectTasks(
    projectId: string,
    callback: (tasks: Task[]) => void
  ) {
    const q = query(
      collection(db, 'tasks'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const tasks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        dueDate: doc.data().dueDate?.toDate() || null,
      })) as Task[];
      callback(tasks);
    });
  }

  // Chat functionality
  static async createOrGetDirectChat(
    currentUserId: string,
    currentUserEmail: string,
    currentUserName: string,
    targetEmail: string
  ): Promise<string | null> {
    try {
      // First, find the target user by email
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', targetEmail)
      );
      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        throw new Error(`User with email ${targetEmail} not found`);
      }

      const targetUser = usersSnapshot.docs[0];
      const targetUserData = targetUser.data();
      const targetUserId = targetUser.id;

      // Check if a direct chat already exists between these two users
      const chatsQuery = query(
        collection(db, 'chats'),
        where('isGroup', '==', false)
      );
      const chatsSnapshot = await getDocs(chatsQuery);

      let existingChatId = null;
      chatsSnapshot.forEach((doc) => {
        const chat = doc.data() as Chat;
        const participantIds = chat.participants.map((p) => p.userId);
        if (
          participantIds.includes(currentUserId) &&
          participantIds.includes(targetUserId)
        ) {
          existingChatId = doc.id;
        }
      });

      if (existingChatId) {
        return existingChatId;
      }

      // Create new direct chat
      const chatData = {
        participants: [
          {
            userId: currentUserId,
            email: currentUserEmail,
            name: currentUserName,
            joinedAt: new Date(),
            isActive: true,
          },
          {
            userId: targetUserId,
            email: targetUserData.email,
            name: targetUserData.name,
            joinedAt: new Date(),
            isActive: true,
          },
        ],
        isGroup: false,
        lastMessageAt: new Date(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'chats'), chatData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating/getting direct chat:', error);
      throw error;
    }
  }

  static async sendMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    senderEmail: string,
    content: string
  ): Promise<string> {
    try {
      const messageData = {
        chatId,
        senderId,
        senderName,
        senderEmail,
        content,
        type: 'text' as const,
        readBy: [senderId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const messageRef = await addDoc(collection(db, 'messages'), messageData);

      // Update chat's last message info
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return messageRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async getUserChats(userId: string): Promise<Chat[]> {
    try {
      const q = query(
        collection(db, 'chats'),
        orderBy('lastMessageAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const userChats = querySnapshot.docs
        .filter((doc) => {
          const chat = doc.data() as Chat;
          return chat.participants.some((p) => p.userId === userId);
        })
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
          } as Chat;
        });

      return userChats;
    } catch (error) {
      console.error('Error getting user chats:', error);
      return [];
    }
  }

  static async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as ChatMessage;
      });
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }
  }

  static listenToChatMessages(
    chatId: string,
    callback: (messages: ChatMessage[]) => void
  ) {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as ChatMessage;
      });
      callback(messages);
    });
  }

  static listenToUserChats(userId: string, callback: (chats: Chat[]) => void) {
    const q = query(collection(db, 'chats'), orderBy('lastMessageAt', 'desc'));

    return onSnapshot(q, (querySnapshot) => {
      const userChats = querySnapshot.docs
        .filter((doc) => {
          const chat = doc.data() as Chat;
          return chat.participants.some((p) => p.userId === userId);
        })
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
          } as Chat;
        });
      callback(userChats);
    });
  }

  static async markMessageAsRead(messageId: string, userId: string) {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        readBy: arrayUnion(userId),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }
}
