import { FirestoreService } from './firestore';
import { Project, Task, Discussion } from '~/types';

export class ProjectSeedingService {
  static async seedUserProjects(
    userId: string,
    userEmail: string,
    userName: string
  ) {
    try {
      const seedProjects = this.getSeedProjects(userId, userEmail, userName);

      for (const project of seedProjects) {
        // Create the project
        const projectId = await FirestoreService.createProject(project);

        // Add sample tasks for each project
        const tasks = this.getSeedTasks(projectId, userId, userName);
        for (const task of tasks) {
          await FirestoreService.createTask(task);
        }

        // Add sample discussions
        const discussions = this.getSeedDiscussions(
          projectId,
          userId,
          userName
        );
        for (const discussion of discussions) {
          await FirestoreService.createDiscussion(discussion);
        }
      }

      console.log('Successfully seeded projects for user:', userId);
    } catch (error) {
      console.error('Error seeding projects:', error);
      // Don't throw error - seeding is optional
    }
  }

  private static getSeedProjects(
    userId: string,
    userEmail: string,
    userName: string
  ): Omit<Project, 'id' | 'createdAt' | 'updatedAt'>[] {
    return [
      {
        name: 'Digital Marketing Campaign Q1',
        description:
          'Launch comprehensive digital marketing strategy for Q1 2024 including social media, email campaigns, and content marketing initiatives.',
        ownerId: userId,
        members: [
          {
            userId,
            email: userEmail,
            name: userName,
            role: 'owner',
            joinedAt: new Date(),
          },
        ],
        color: '#3B82F6',
        isArchived: false,
        imageUrl:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
        tags: ['Marketing', 'Digital', 'Q1 2024', 'Strategy'],
        priority: 'high',
        department: 'Marketing',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        status: 'active',
        progress: 25,
      },
      {
        name: 'Mobile App Development',
        description:
          "Develop and launch the company's first mobile application with cross-platform compatibility and modern UI/UX design.",
        ownerId: userId,
        members: [
          {
            userId,
            email: userEmail,
            name: userName,
            role: 'owner',
            joinedAt: new Date(),
          },
        ],
        color: '#10B981',
        isArchived: false,
        imageUrl:
          'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop',
        tags: ['Development', 'Mobile', 'React Native', 'UI/UX'],
        priority: 'critical',
        department: 'Engineering',
        deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
        status: 'active',
        progress: 45,
      },
      {
        name: 'Team Training & Development',
        description:
          'Comprehensive training program to upskill team members in latest technologies and improve overall productivity.',
        ownerId: userId,
        members: [
          {
            userId,
            email: userEmail,
            name: userName,
            role: 'owner',
            joinedAt: new Date(),
          },
        ],
        color: '#F59E0B',
        isArchived: false,
        imageUrl:
          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop',
        tags: ['Training', 'HR', 'Development', 'Team Building'],
        priority: 'medium',
        department: 'Human Resources',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        status: 'planning',
        progress: 10,
      },
    ];
  }

  private static getSeedTasks(
    projectId: string,
    userId: string,
    userName: string
  ): Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] {
    const baseTasks = [
      {
        title: 'Project Planning & Research',
        description:
          'Conduct initial research and create detailed project plan with milestones and deliverables.',
        projectId,
        assigneeId: userId,
        assigneeName: userName,
        creatorId: userId,
        creatorName: userName,
        status: 'done' as const,
        priority: 'high' as const,
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        estimatedHours: 16,
        actualHours: 14,
        tags: ['Planning', 'Research'],
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Stakeholder Meetings',
        description:
          'Schedule and conduct meetings with all key stakeholders to align on project objectives and expectations.',
        projectId,
        assigneeId: userId,
        assigneeName: userName,
        creatorId: userId,
        creatorName: userName,
        status: 'in_progress' as const,
        priority: 'high' as const,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        estimatedHours: 8,
        actualHours: 4,
        tags: ['Meetings', 'Stakeholders'],
      },
      {
        title: 'Resource Allocation',
        description:
          'Identify and allocate necessary resources including team members, budget, and tools required for project success.',
        projectId,
        assigneeId: userId,
        assigneeName: userName,
        creatorId: userId,
        creatorName: userName,
        status: 'todo' as const,
        priority: 'medium' as const,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        estimatedHours: 12,
        tags: ['Resources', 'Planning'],
      },
      {
        title: 'Quality Assurance Setup',
        description:
          'Establish quality assurance processes and testing protocols to ensure project deliverables meet standards.',
        projectId,
        assigneeId: userId,
        assigneeName: userName,
        creatorId: userId,
        creatorName: userName,
        status: 'todo' as const,
        priority: 'medium' as const,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        estimatedHours: 20,
        tags: ['QA', 'Testing'],
      },
    ];

    return baseTasks;
  }

  private static getSeedDiscussions(
    projectId: string,
    userId: string,
    userName: string
  ): Omit<Discussion, 'id' | 'createdAt' | 'updatedAt'>[] {
    return [
      {
        projectId,
        title: 'Project Kickoff Discussion',
        content:
          "Welcome to the project! Let's use this space to discuss our goals, share updates, and collaborate effectively. Feel free to ask questions and share ideas.",
        authorId: userId,
        authorName: userName,
        replies: [],
        tags: ['Welcome', 'Kickoff'],
        isPinned: true,
      },
      {
        projectId,
        title: 'Weekly Progress Updates',
        content:
          "Please share your weekly progress updates here. Include what you've completed, what you're working on, and any blockers you're facing.",
        authorId: userId,
        authorName: userName,
        replies: [],
        tags: ['Progress', 'Weekly'],
        isPinned: false,
      },
    ];
  }
}
