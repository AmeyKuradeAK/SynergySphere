import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '~/lib/firebase';
import { Project, Task, Discussion, ProjectMember } from '~/types';

export class FirestoreService {
  // Projects
  static async createProject(project: Omit<Project, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        ...project,
        createdAt: Timestamp.fromDate(project.createdAt),
        updatedAt: Timestamp.fromDate(project.updatedAt),
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async getProject(projectId: string): Promise<Project | null> {
    try {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (projectDoc.exists()) {
        const data = projectDoc.data();
        return {
          id: projectDoc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Project;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async getUserProjects(userId: string): Promise<Project[]> {
    try {
      const q = query(
        collection(db, 'projects'),
        where('members', 'array-contains', { userId, role: 'member' })
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Project;
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async updateProject(
    projectId: string,
    updates: Partial<Project>
  ): Promise<void> {
    try {
      const updateData = { ...updates };
      if (updates.updatedAt) {
        updateData.updatedAt = Timestamp.fromDate(updates.updatedAt);
      }
      await updateDoc(doc(db, 'projects', projectId), updateData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async addProjectMember(
    projectId: string,
    member: ProjectMember
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        members: arrayUnion(member),
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async removeProjectMember(
    projectId: string,
    userId: string
  ): Promise<void> {
    try {
      const project = await this.getProject(projectId);
      if (project) {
        const memberToRemove = project.members.find((m) => m.userId === userId);
        if (memberToRemove) {
          await updateDoc(doc(db, 'projects', projectId), {
            members: arrayRemove(memberToRemove),
            updatedAt: Timestamp.now(),
          });
        }
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Tasks
  static async createTask(task: Omit<Task, 'id'>): Promise<string> {
    try {
      const taskData = {
        ...task,
        createdAt: Timestamp.fromDate(task.createdAt),
        updatedAt: Timestamp.fromDate(task.updatedAt),
        dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
        completedAt: task.completedAt
          ? Timestamp.fromDate(task.completedAt)
          : null,
      };

      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
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

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          dueDate: data.dueDate?.toDate() || null,
          completedAt: data.completedAt?.toDate() || null,
        } as Task;
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async updateTask(
    taskId: string,
    updates: Partial<Task>
  ): Promise<void> {
    try {
      const updateData = { ...updates };
      if (updates.updatedAt) {
        updateData.updatedAt = Timestamp.fromDate(updates.updatedAt);
      }
      if (updates.dueDate) {
        updateData.dueDate = Timestamp.fromDate(updates.dueDate);
      }
      if (updates.completedAt) {
        updateData.completedAt = Timestamp.fromDate(updates.completedAt);
      }

      await updateDoc(doc(db, 'tasks', taskId), updateData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async deleteTask(taskId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Discussions
  static async createDiscussion(
    discussion: Omit<Discussion, 'id'>
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'discussions'), {
        ...discussion,
        createdAt: Timestamp.fromDate(discussion.createdAt),
        updatedAt: Timestamp.fromDate(discussion.updatedAt),
        replies: discussion.replies.map((reply) => ({
          ...reply,
          createdAt: Timestamp.fromDate(reply.createdAt),
        })),
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async getProjectDiscussions(projectId: string): Promise<Discussion[]> {
    try {
      const q = query(
        collection(db, 'discussions'),
        where('projectId', '==', projectId),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          replies: data.replies.map((reply: any) => ({
            ...reply,
            createdAt: reply.createdAt.toDate(),
          })),
        } as Discussion;
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Real-time listeners
  static listenToUserProjects(
    userId: string,
    callback: (projects: Project[]) => void
  ): () => void {
    const q = query(
      collection(db, 'projects'),
      where('members', 'array-contains', { userId, role: 'member' })
    );

    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Project;
      });
      callback(projects);
    });
  }

  static listenToProjectTasks(
    projectId: string,
    callback: (tasks: Task[]) => void
  ): () => void {
    const q = query(
      collection(db, 'tasks'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          dueDate: data.dueDate?.toDate() || null,
          completedAt: data.completedAt?.toDate() || null,
        } as Task;
      });
      callback(tasks);
    });
  }

  static listenToProjectDiscussions(
    projectId: string,
    callback: (discussions: Discussion[]) => void
  ): () => void {
    const q = query(
      collection(db, 'discussions'),
      where('projectId', '==', projectId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const discussions = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          replies: data.replies.map((reply: any) => ({
            ...reply,
            createdAt: reply.createdAt.toDate(),
          })),
        } as Discussion;
      });
      callback(discussions);
    });
  }
}
