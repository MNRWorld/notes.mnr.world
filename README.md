# আমার নোট - Project Documentation

"আমার নোট" (Amar Note - My Notes) is a modern, offline-first, and privacy-focused note-taking application designed for a seamless writing experience. It is built with Next.js and styled with Tailwind CSS and ShadCN UI components.

## Tech Stack

- **Framework**: Next.js (with App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI
- **State Management**: Zustand
- **Mobile**: Capacitor for Android support
- **Rich Text Editor**: Editor.js

## Project Structure

The project follows a standard Next.js App Router structure. Here's a breakdown of the key directories and their purposes:

```
.
├── src/
│   ├── app/
│   │   ├── (main)/              # Main application layout and pages
│   │   │   ├── notes/           # Main page for listing, searching, and managing notes
│   │   │   ├── editor/          # The rich text editor page for creating/editing notes
│   │   │   ├── dashboard/       # User dashboard with writing stats and analytics
│   │   │   ├── archive/         # Page to view and manage archived notes
│   │   │   ├── profile/         # User profile and application settings
│   │   │   ├── layout.tsx       # Layout for the main authenticated section
│   │   │   └── page.tsx         # Entry point, redirects to the notes list
│   │   ├── globals.css          # Global styles and Tailwind CSS directives
│   │   └── layout.tsx           # Root layout of the application
│   ├── components/
│   │   ├── layout/              # Sidebar and Header components
│   │   └── ui/                  # ShadCN UI components (Button, Card, etc.)
│   ├── hooks/
│   │   └── use-debounce.ts      # Custom hook for debouncing input
│   ├── lib/
│   │   ├── editor-tools.ts      # Configuration for the Editor.js tools
│   │   ├── editor.tsx           # Wrapper component for Editor.js
│   │   ├── storage.ts           # IndexedDB interactions for storing and managing notes
│   │   ├── types.ts             # Core TypeScript types (e.g., Note)
│   │   ├── utils.ts             # Utility functions used across the app
│   │   └── welcome-note.ts      # The default note for new users
│   └── stores/
│       ├── use-notes.ts         # Zustand store for managing notes state
│       └── use-settings.ts      # Zustand store for user settings (theme, font, etc.)
├── public/                      # Static assets (images, fonts, manifest)
└── capacitor.config.ts          # Configuration for Capacitor (mobile builds)
```

### Key Components & Logic

- **`src/app/(main)/`**: This route group contains all the core pages of the application that share a common layout (`src/app/(main)/layout.tsx`), which includes the main sidebar and header.

- **`src/app/(main)/notes/`**: This is the primary view where users can see a list or grid of their notes. It includes functionality for searching, sorting, and performing actions on notes.

- **`src/app/(main)/editor/`**: The heart of the note-taking experience. It features a rich text editor powered by **Editor.js**, allowing for formatted text, lists, quotes, and more. It includes autosaving and manual save functionality.

- **`src/app/(main)/dashboard/`**: Provides users with insights into their writing habits, including a writing heatmap, a weekly word count chart, and challenges to encourage consistent writing.

- **`src/lib/storage.ts`**: This file is crucial for the offline-first functionality. It abstracts all interactions with **IndexedDB** using the `idb-keyval` library. All CRUD (Create, Read, Update, Delete) operations for notes are handled here.

- **`src/stores/`**: The application uses **Zustand** for state management.
  - **`useNotesStore`**: Manages the state of all notes, including fetching, creating, updating, and deleting them. It keeps the UI in sync with the database.
  - **`useSettingsStore`**: Persists user-specific settings like theme, font, and name to `localStorage`.

- **Capacitor**: The project is configured to be wrapped as a native Android application using Capacitor. This allows the web app to be installed and run like a native app on mobile devices.
