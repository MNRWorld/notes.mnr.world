# আমার নোট (Amar Note) - Technical & UX Documentation

<p align="center">
  <img src="https" alt="আমার নোট app icon" width="120">
</p>

<p align="center">
  <strong>আপনার চিন্তার জন্য একটি নির্মল ও ব্যক্তিগত জায়গা।</strong><br/>
  <em>(A serene and private space for your thoughts.)</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-cyan?logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Capacitor-6-blue?logo=capacitor" alt="Capacitor">
  <img src="https://img.shields.io/badge/Storage-IndexedDB-red" alt="IndexedDB">
</p>

"আমার নোট" (Amar Note) is a modern, offline-first, and privacy-focused note-taking application designed for a seamless writing experience. It is built with Next.js and styled with Tailwind CSS and ShadCN UI components. This document provides a deep dive into its architecture, design philosophy, and technical implementation.

---

## Table of Contents

1.  [Project Vision & UX Philosophy](#1-project-vision--ux-philosophy)
2.  [Architecture Overview](#2-architecture-overview)
3.  [UI/UX Design Decisions](#3-uiux-design-decisions)
4.  [Page-by-Page Breakdown](#4-page-by-page-breakdown)
5.  [Core Logic & Data Flow](#5-core-logic--data-flow)
6.  [Offline-First Behavior](#6-offline-first-behavior)
7.  [State Management with Zustand](#7-state-management-with-zustand)
8.  [Extensibility](#8-extensibility)
9.  [Mobile (Capacitor Integration)](#9-mobile-capacitor-integration)
10. [Developer Guide](#10-developer-guide)

---

## 1. Project Vision & UX Philosophy

The core philosophy of "আমার নোট" is to provide a tranquil and secure space for capturing thoughts.

- **Privacy-Focused & Offline-First**: In an era of cloud-based services, this app takes a different approach. All data lives exclusively on the user's device within **IndexedDB**. There is no server, no database, and no network requests for notes. This guarantees absolute privacy and makes the app fully functional without an internet connection.
- **Core UX Goals**:
  - **Fast & Responsive**: The UI is optimized for speed, with minimal load times and smooth 60fps animations. This is achieved through code-splitting, lazy loading of heavy components, and efficient state management.
  - **Distraction-Free Writing**: The editor provides a "Zen Mode" that hides all non-essential UI, allowing the user to focus solely on writing.
  - **Minimal UI**: The design is clean and uncluttered. It uses a carefully selected color palette and typography to be aesthetically pleasing without being overwhelming.
  - **Mobile-First**: The app is designed from the ground up for mobile devices, featuring a touch-friendly bottom navigation and a floating action button (FAB). It then gracefully adapts to larger screens for a great desktop experience.

## 2. Architecture Overview

The application follows a modern frontend architecture that is decoupled, scalable, and optimized for an offline context.

```
+------------------+      +--------------------+      +-----------------+
|   Next.js UI     | <--> |   Zustand Stores   | <--> |    IndexedDB    |
| (React Components) |      | (State Management) |      | (Browser Storage) |
+------------------+      +--------------------+      +-----------------+
        ^                                                    |
        |                                                    |
        +----------------------------------------------------+
        |                   Capacitor Wrapper                  |
        |                  (For Android APK Build)             |
        +----------------------------------------------------+
```

- **Frontend (UI Layer)**: Built with **Next.js** and **React**. Components are crafted using **ShadCN UI** and styled with **Tailwind CSS**. This layer is responsible for rendering the UI and capturing user interactions.
- **State Management**: **Zustand** acts as the central nervous system. It holds the application's state (notes, settings) in stores. UI components subscribe to these stores and re-render only when relevant data changes.
- **Offline Backend (Storage Layer)**: **IndexedDB** is the "database." All notes are persisted here via the `idb-keyval` library. The `src/lib/storage.ts` file abstracts all database operations, acting as a service layer.
- **Mobile (Native Layer)**: **Capacitor** wraps the entire Next.js web app into a native Android container. It allows the web app to be deployed as an APK and access native device features, providing a seamless mobile experience.

## 3. UI/UX Design Decisions

Every design choice is intentional, aimed at creating a fluid and intuitive experience.

- **Mobile-First Layout**:
  - **Bottom Navigation**: On small screens, primary navigation is handled by a bottom navigation bar, which is ergonomic and standard for native mobile apps.
  - **Floating Action Button (FAB)**: The most common action, creating a new note, is accessible via a FAB.
  - **Adaptive Sidebar**: On larger screens (tablets/desktops), the navigation transitions to a traditional, full-featured sidebar.
  - **Adaptive Grids**: Note lists are displayed in a responsive grid that adjusts the number of columns based on screen width, optimizing space.
- **Component Consistency**: **ShadCN UI** is used as the base for all UI components (buttons, dialogs, cards). This ensures a consistent look and feel across the app. Components are customized in `src/components/ui` to match the app's aesthetic.
- **Responsive Design**: **Tailwind CSS** enables a utility-first approach to styling, making it easy to build responsive layouts that adapt from a 360px wide phone to a 4K desktop monitor.
- **Accessibility (a11y)**:
  - **Semantic HTML** is used throughout.
  - Interactive elements have sufficient `44px` tap targets.
  - `aria-label` attributes are used for icon-only buttons.
  - Color palettes are chosen to ensure sufficient contrast ratios for readability.

## 4. Page-by-Page Breakdown

The app is structured using the Next.js App Router, with clear separation of concerns.

- **/notes**: The main dashboard. It displays a list or grid of all active notes. Features include searching (by title, content, or tags), sorting, and view mode toggling (grid/list).
- **/editor**: The core writing experience. A rich text editor powered by **Editor.js**. It features a clean, block-based interface, autosaving to IndexedDB, and a distraction-free "Zen Mode."
- **/archive**: A dedicated view for archived notes. Users can browse archived notes, restore them to the main list, or delete them permanently.
- **/profile**: The user's settings hub. Here, users can personalize their experience by changing the app's theme and font. It also provides access to data management options.
- **/templates**: A gallery of pre-defined note templates (e.g., Meeting Notes, Daily Journal). This helps users start writing faster. Users can also save their own notes as custom templates.
- **/trash**: Deleted notes are moved here temporarily. Users can restore notes from the trash or empty it to permanently delete them.
- **/mnrAI**: An experimental AI chat interface for exploring information, currently integrated with Wikipedia search.
- **/\_not-found**: A user-friendly 404 page that guides users back to the home page.

## 5. Core Logic & Data Flow

The app's data flow is designed to be efficient and reliable in an offline environment.

**Note Creation/Saving Flow**:

1.  **User Action**: A user creates a new note or edits an existing one in the `/editor`.
2.  **Editor.js**: The editor captures changes. An `onChange` event is fired.
3.  **Debounced Autosave**: To prevent excessive writes, the save operation is debounced. After a short period of inactivity (e.g., 2 seconds), the save logic is triggered.
4.  **Zustand Action**: The component calls an action in `useNotesStore` (e.g., `updateNote`).
5.  **Optimistic UI Update**: The Zustand store immediately updates its state. The UI re-renders with the new content instantly.
6.  **IndexedDB Persistence**: In the background, the same store action calls a function in `src/lib/storage.ts`, which writes the updated note to IndexedDB.

**Search & Filtering**:

- Search is performed client-side on the notes array held in `useNotesStore`.
- A `useDebounce` hook prevents re-filtering on every keystroke, ensuring the UI remains responsive.
- The filtering logic checks the note's title, content (by converting Editor.js blocks to plain text), and tags.

**Settings Persistence**:

- The `useSettingsStore` is configured with `zustand/middleware/persist`, which automatically saves any changes to `localStorage`. This ensures settings like theme and font are preserved across sessions.

## 6. Offline-First Behavior

The app is architected to work perfectly without an internet connection.

- **Primary Storage**: **IndexedDB** is the single source of truth for all notes. `idb-keyval` provides a simple promise-based API for interacting with it.
- **Centralized CRUD**: All database operations (Create, Read, Update, Delete) are handled exclusively by functions in `src/lib/storage.ts`. This ensures that interaction with the database is consistent and predictable.
- **Optimistic UI**: When a user performs an action (e.g., archiving a note), the UI is updated _immediately_ by the Zustand store. The asynchronous database write happens in the background. This makes the app feel instantaneous, even if the database write takes a few milliseconds.

## 7. State Management with Zustand

Zustand was chosen for its simplicity, performance, and minimal boilerplate.

- **Why Zustand?**: Unlike Redux, Zustand doesn't require complex setup with reducers, actions, and dispatchers. Unlike React Context, it avoids the "Context lost" issue and only re-renders components that subscribe to the specific state slices they use, preventing unnecessary re-renders.
- **Store Structure**:
  - `useNotesStore`: Manages the state of all notes (active, archived, trashed). It contains actions for all CRUD operations, which handle both the state update and the call to the storage layer.
  - `useSettingsStore`: Manages user-specific settings. It uses persist middleware to sync with `localStorage`.
- **Syncing Logic**: The stores are the bridge between the UI and IndexedDB. Components call store actions, the store updates its state (triggering a UI re-render), and then the store calls the storage function to persist the change.

## 8. Extensibility

The codebase is designed to be modular and easy to extend.

- **Adding Editor.js Tools**: To add a new formatting tool, simply install the plugin package, import it in `src/lib/editor-tools.ts`, and add it to the `tools` configuration object.
- **Adding Templates**: New default templates can be added by defining them in the `src/lib/templates.ts` array. The UI will automatically render them.
- **Adding Features**: The modular structure (hooks, stores, services) makes it straightforward to add new features without disturbing existing logic.

## 9. Mobile (Capacitor Integration)

The web application is packaged for Android using Capacitor, providing a near-native experience.

- **Wrapping Process**: The `next build` and `next export` commands generate a static version of the site, which Capacitor then wraps in a native Android WebView.
- **Offline Storage**: IndexedDB works seamlessly inside the Capacitor WebView, so no changes to the storage logic are needed for mobile.
- **Performance Adjustments**:
  - The `capacitor.config.ts` is configured with a background color to prevent a white flash on app startup.
  - Mobile-specific UI patterns (bottom nav, FAB) are used to enhance the native feel.
  - The same web performance optimizations (code-splitting, lazy loading, image optimization) directly benefit the mobile app's performance.

## 10. Developer Guide

A quick guide to get the project up and running.

**Prerequisites**:

- Node.js (v18.x or later)
- npm or yarn
- Android Studio (for building the APK)

**Running Locally**:

```bash
# 1. Clone the repository
git clone https://github.com/your-repo/amar-note.git
cd amar-note

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev

# Open http://localhost:3000 in your browser.
```

**Building for Production (Web)**:

```bash
# Create a production-optimized build
npm run build
```

**Building for Android (APK)**:

```bash
# 1. Build the Next.js static site
npm run build:mobile

# 2. Sync the web assets with Capacitor
npx cap sync android

# 3. Open the project in Android Studio
npx cap open android

# 4. Build the APK using Android Studio
# Go to Build > Build Bundle(s) / APK(s) > Build APK(s)
```

**Contributing**:
Contributions are welcome! Please open an issue or submit a pull request. Ensure your code follows the existing style and passes all linting checks.
