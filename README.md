# TaskBuddy

A modern task management application built with React, TypeScript, and Firebase.

## Features

- User authentication with Google Sign-In
- Create, edit, and delete tasks
- Task categorization and tagging
- Due date management
- Drag-and-drop task organization
- Board and list views
- Responsive design
- File attachments
- Activity tracking

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Firebase (Authentication, Firestore, Storage)
- React Router
- Heroicons

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Vagdevi-yalla/taskbuddy.git
cd taskbuddy
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project and enable:
   - Authentication (Google Sign-In)
   - Firestore Database
   - Storage

4. Copy the Firebase configuration from your Firebase Console and update the `.env` file:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/         # Reusable UI components
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── types/             # TypeScript type definitions
├── firebase/          # Firebase configuration
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
