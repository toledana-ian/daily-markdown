web application/stitch/projects/4033078370725311282/screens/d3b977f5ae7948a79a3b576be6b26ce5

# Daily Markdown App — UI/UX Description

## Overview

A minimal, distraction-free daily note-taking app designed around **one fresh page per day**. The core idea is to reduce clutter and mental overload by giving users a clean slate every day, while still allowing powerful organization through hashtags and search.
The UI is inspired by **Google Keep**, featuring a simple and familiar layout: **Header + Sidebar + Main Content**.

---

## Layout Structure

### 1. Header

- **Left:**
  - Hamburger menu (toggles sidebar visibility)
  - App icon / logo
- **Right:**
  - User profile picture (click for account/settings)

---

### 2. Sidebar (Left Panel)

A lightweight navigation panel focused on time-based browsing and tagging.

#### Components:

1. **Search Bar**
   - Allows searching across all notes (full-text + hashtags)
2. **Calendar (Monthly View)**
   - Displays the current month
   - **Current date is selected by default**
   - Clicking a date loads that day's notes
   - Visual indicators for days with notes (optional enhancement)
3. **Hashtag List**
   - Automatically generated from notes
   - Clicking a hashtag filters notes across all dates
   - Hashtags are created dynamically when users include `#tags` in notes

---

### 3. Main Content Area

#### Top Section:

- **"Take a note" input box**
  - Acts as a trigger (not a full editor)
  - Clicking opens a full-screen/modal editor

#### Notes List:

- Displays all notes for the **selected day**
- Notes are shown as rendered **HTML previews**
- Clean, card-style layout (similar to Google Keep)

---

## Note Interaction Flow

### Create Note

1. User clicks **"Take a note"**
2. Opens a **full-page modal editor**
3. Editor uses **Markdown input**
4. User writes content (supports hashtags like `#work`, `#ideas`)
5. On closing modal:
   - Note is **automatically saved**
   - Rendered as **HTML preview** in the main list

---

### View Note

- Clicking a note opens it in **read-only (view mode)**
- Fully rendered Markdown → HTML

---

### Edit Note

- Inside view mode, user clicks **Edit**
- Switches to **Markdown editor**
- On save/close → updates note

---

## Core Concepts

### Daily Reset

- Each day has its own **empty note space by default**
- Encourages a fresh start and avoids clutter buildup

### Hashtag System

- No manual tag management required
- Tags are:
  - **Auto-detected** from content (`#tag`)
  - **Auto-indexed**
  - Clickable for filtering

### Minimalism

- No folders, no complex structure
- Organization is handled through:
  - Dates
  - Search
  - Hashtags

---

## UX Principles

- **Fast capture:** minimal friction to start writing
- **Clean mental model:** one day = one space
- **Low cognitive load:** no clutter, no over-organization
- **Progressive interaction:** simple view → deeper editing only when needed

---

## Summary

A clean, daily-focused Markdown note app that combines:

- The **simplicity of Google Keep**
- The **power of Markdown**
- The **organization of hashtags and calendar navigation**
  Built for users who want a **fresh, uncluttered space every day** while still keeping everything searchable and connected.

## Theme Configuration

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';
@import '@fontsource-variable/jetbrains-mono';
@import '@fontsource-variable/roboto';

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.153 0.006 107.1);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.153 0.006 107.1);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.153 0.006 107.1);
  --primary: oklch(0.511 0.096 186.391);
  --primary-foreground: oklch(0.984 0.014 180.72);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.966 0.005 106.5);
  --muted-foreground: oklch(0.58 0.031 107.3);
  --accent: oklch(0.966 0.005 106.5);
  --accent-foreground: oklch(0.228 0.013 107.4);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.93 0.007 106.5);
  --input: oklch(0.93 0.007 106.5);
  --ring: oklch(0.737 0.021 106.9);
  --chart-1: oklch(0.855 0.138 181.071);
  --chart-2: oklch(0.704 0.14 182.503);
  --chart-3: oklch(0.6 0.118 184.704);
  --chart-4: oklch(0.511 0.096 186.391);
  --chart-5: oklch(0.437 0.078 188.216);
  --radius: 0.45rem;
  --sidebar: oklch(0.988 0.003 106.5);
  --sidebar-foreground: oklch(0.153 0.006 107.1);
  --sidebar-primary: oklch(0.6 0.118 184.704);
  --sidebar-primary-foreground: oklch(0.984 0.014 180.72);
  --sidebar-accent: oklch(0.966 0.005 106.5);
  --sidebar-accent-foreground: oklch(0.228 0.013 107.4);
  --sidebar-border: oklch(0.93 0.007 106.5);
  --sidebar-ring: oklch(0.737 0.021 106.9);
}

.dark {
  --background: oklch(0.153 0.006 107.1);
  --foreground: oklch(0.988 0.003 106.5);
  --card: oklch(0.228 0.013 107.4);
  --card-foreground: oklch(0.988 0.003 106.5);
  --popover: oklch(0.228 0.013 107.4);
  --popover-foreground: oklch(0.988 0.003 106.5);
  --primary: oklch(0.437 0.078 188.216);
  --primary-foreground: oklch(0.984 0.014 180.72);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.286 0.016 107.4);
  --muted-foreground: oklch(0.737 0.021 106.9);
  --accent: oklch(0.286 0.016 107.4);
  --accent-foreground: oklch(0.988 0.003 106.5);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.58 0.031 107.3);
  --chart-1: oklch(0.855 0.138 181.071);
  --chart-2: oklch(0.704 0.14 182.503);
  --chart-3: oklch(0.6 0.118 184.704);
  --chart-4: oklch(0.511 0.096 186.391);
  --chart-5: oklch(0.437 0.078 188.216);
  --sidebar: oklch(0.228 0.013 107.4);
  --sidebar-foreground: oklch(0.988 0.003 106.5);
  --sidebar-primary: oklch(0.704 0.14 182.503);
  --sidebar-primary-foreground: oklch(0.277 0.046 192.524);
  --sidebar-accent: oklch(0.286 0.016 107.4);
  --sidebar-accent-foreground: oklch(0.988 0.003 106.5);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.58 0.031 107.3);
}

@theme inline {
  --font-mono: 'JetBrains Mono Variable', monospace;
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --color-foreground: var(--foreground);
  --color-background: var(--background);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
  --font-sans: 'Roboto Variable', sans-serif;
}
```
