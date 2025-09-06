# 🌐 SynergySphere - Advanced Team Collaboration Platform

> _A mobile-first collaboration platform that acts like a central nervous system for teams_

SynergySphere is built on a simple idea: teams do their best work when their tools truly support how they think, communicate, and move forward together. This platform goes beyond traditional project management software by becoming an intelligent backbone for teams — helping them stay organized, communicate better, manage resources more effectively, and make informed decisions without friction.

## ✨ Features

### 🔐 Authentication & User Management

- Secure email/password authentication with Firebase Auth
- User profile management
- Persistent login sessions

### 📋 Project Management

- Create and manage multiple projects
- Real-time project collaboration
- Project member management
- Progress tracking and analytics

### ✅ Task Management

- Create, assign, and track tasks
- Task status management (To Do, In Progress, Done)
- Priority levels (Low, Medium, High)
- Due date tracking
- Task progress visualization

### 💬 Team Communication

- Project-specific discussions
- Real-time messaging
- Threaded conversations

### 📊 Analytics & Progress Tracking

- Overall progress dashboard
- Task completion analytics
- Priority distribution insights
- Project-wise progress tracking
- Overdue task alerts

### 🎨 Modern Mobile UI

- Beautiful, intuitive mobile-first design
- Dark/Light theme support
- Professional UX following mobile best practices
- Responsive layouts for all screen sizes

## 🛠 Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router with Drawer + Tabs
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand
- **Backend**: Firebase (Firestore + Auth)
- **Real-time**: Firebase real-time listeners
- **TypeScript**: Full type safety
- **Development**: Husky for pre-commit hooks, ESLint, Prettier

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd SynergySphere
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up Firebase**
   - Follow the detailed [Firebase Setup Guide](./FIREBASE_SETUP.md)
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Update `lib/firebase.ts` with your config

4. **Start the development server**

   ```bash
   yarn start
   ```

5. **Run on device/simulator**

   ```bash
   # iOS
   yarn ios

   # Android
   yarn android
   ```

## 📱 App Structure

```
app/
├── (auth)/                 # Authentication screens
│   ├── login.tsx          # Login screen
│   ├── signup.tsx         # Registration screen
│   └── _layout.tsx        # Auth layout
├── (drawer)/              # Main app with drawer navigation
│   ├── index.tsx          # Projects dashboard
│   └── _layout.tsx        # Drawer layout with user profile
├── project/[id]/          # Project detail screens
│   └── index.tsx          # Project overview, tasks, discussions
├── task/                  # Task management
│   ├── create.tsx         # Create new task
│   └── [id].tsx          # Task detail and editing
├── task-progress/         # Analytics dashboard
│   └── index.tsx         # Progress tracking and insights
├── chat/                  # Team communication
│   └── index.tsx         # Project discussions
├── modal.tsx             # Project creation modal
└── index.tsx             # Auth routing logic

components/               # Reusable UI components
contexts/                # React contexts (AuthProvider)
lib/                     # Utilities and configurations
services/                # Firebase service functions
store/                   # Zustand state management
types/                   # TypeScript type definitions
```

## 🎯 Key Features Walkthrough

### 1. **Smart Dashboard**

- Overview of all projects with progress indicators
- Quick stats on tasks and completion rates
- Easy project creation and navigation

### 2. **Project Management**

- Comprehensive project views with tabs (Overview, Tasks, Discussions)
- Real-time collaboration with live updates
- Team member management

### 3. **Task System**

- Intuitive task creation with priority levels
- Status tracking with visual indicators
- Due date management and overdue alerts

### 4. **Team Communication**

- Project-specific chat rooms
- Real-time messaging with Firebase
- Discussion threads for better organization

### 5. **Analytics Dashboard**

- Visual progress tracking with charts
- Priority distribution analysis
- Project-wise performance metrics
- Upcoming and overdue task management

## 🔧 Development

### Code Quality

- **ESLint**: Configured with Expo and Prettier rules
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks for linting and formatting
- **TypeScript**: Strict type checking enabled

### Scripts

```bash
# Development
yarn start              # Start Expo development server
yarn ios               # Run on iOS simulator
yarn android           # Run on Android emulator

# Code Quality
yarn lint              # Run ESLint and Prettier checks
yarn format           # Auto-fix linting and formatting issues

# Building
yarn build:dev         # Development build
yarn build:preview     # Preview build
yarn build:prod        # Production build
```

## 🌟 Design Philosophy

SynergySphere follows a **mobile-first** design philosophy:

- **Intuitive Navigation**: Easy-to-use drawer and tab navigation
- **Touch-Friendly**: All interactions optimized for mobile devices
- **Visual Hierarchy**: Clear information architecture
- **Performance**: Optimized for smooth mobile experience
- **Accessibility**: Following mobile accessibility guidelines

## 🔐 Security & Privacy

- **Firebase Authentication**: Secure user authentication
- **Firestore Security Rules**: Proper data access controls
- **Data Encryption**: All data encrypted in transit and at rest
- **Privacy First**: No unnecessary data collection

## 🚀 Deployment

### Building for Production

1. **Configure EAS Build**

   ```bash
   eas build:configure
   ```

2. **Build for iOS/Android**

   ```bash
   eas build --platform ios
   eas build --platform android
   ```

3. **Submit to App Stores**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add TypeScript types for all new code
- Write meaningful commit messages
- Test on both iOS and Android
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Firebase** for the robust backend infrastructure
- **Expo** for the amazing React Native development experience
- **NativeWind** for bringing Tailwind CSS to React Native
- **React Navigation** for smooth navigation experience

---

**SynergySphere** - _Where teams sync, collaborate, and thrive_ 🚀 – Advanced Team Collaboration Platform

**Built by Team "Oblivion Syndicate" for the Odoo x NMIT Hackathon.**

SynergySphere is an intelligent, proactive collaboration platform designed to be the central nervous system for modern teams. It streamlines tasks, communication, and project tracking to help teams operate at their best.

## Vision

Teams do their best work when their tools truly support how they think, communicate, and move forward together. SynergySphere aims to go beyond traditional project management software by becoming an intelligent backbone that helps teams stay organized, communicate better, and make informed decisions without friction.

## MVP Features (Hackathon Deliverable)

- [x] **User Authentication:** Secure user registration and login.
- [x] **Project Creation & Management:** Users can create projects and add team members.
- [x] **Task Management:** Create tasks with titles, descriptions, assignees, and due dates.
- [x] **Kanban Board:** A clear, intuitive drag-and-drop interface to visualize task progress across statuses (`To-Do`, `In Progress`, `Done`).
- [x] **Team Communication:** Project-specific threaded discussions within each task.
- [x] **Responsive Design:** A seamless experience on both desktop and mobile devices.
- [x] **Basic Notifications:** Real-time feedback for key events.

## Tech Stack

- **Frontend:** React (Vite)
- **Styling:** Tailwind CSS
- **Backend & Database:** Supabase (PostgreSQL, Auth, Realtime APIs)
- **Deployment:** Vercel

## Screenshots

_(We'll add screenshots of the final application here)_

**Desktop View:**
![Desktop Screenshot](placeholder-desktop.png)

**Mobile View:**
![Mobile Screenshot](placeholder-mobile.png)

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/your-username/synergysphere.git](https://github.com/your-username/synergysphere.git)
    cd synergysphere
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    Create a `.env.local` file in the root of the project and add your Supabase project URL and Anon Key.

    ```
    VITE_SUPABASE_URL=YOUR_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## Team

**Oblivion Syndicate** - We build smart solutions, fast.
