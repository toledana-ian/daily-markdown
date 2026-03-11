# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

## Recommended File Structure:

```text
my-app/
├─ public/
├─ src/
│  ├─ app/
│  │  ├─ router/
│  │  ├─ providers/
│  │  ├─ layouts/
│  │  └─ index.tsx
│  │
│  ├─ components/
│  │  ├─ ui/               # shadcn/ui generated components
│  │  └─ shared/           # reusable app components
│  │
│  ├─ features/
│  │  ├─ auth/
│  │  │  ├─ api/
│  │  │  ├─ components/
│  │  │  ├─ hooks/
│  │  │  ├─ schemas/
│  │  │  ├─ types/
│  │  │  └─ pages/
│  │  │
│  │  ├─ profile/
│  │  │  ├─ api/
│  │  │  ├─ components/
│  │  │  ├─ hooks/
│  │  │  ├─ schemas/
│  │  │  ├─ types/
│  │  │  └─ pages/
│  │  │
│  │  ├─ home/
│  │  │  ├─ components/
│  │  │  │  ├─ hero-section.tsx
│  │  │  │  ├─ featured-projects-section.tsx
│  │  │  │  └─ cta-section.tsx
│  │  │  │
│  │  │  └─ pages/
│  │  │     └─ home-page.tsx
│  │  │
│  │  └─ projects/
│  │     ├─ api/
│  │     │  ├─ get-projects.ts
│  │     │  ├─ create-project.ts
│  │     │  └─ update-project.ts
│  │     │
│  │     ├─ components/
│  │     ├─ hooks/
│  │     ├─ schemas/
│  │     ├─ types/
│  │     └─ pages/
│  │
│  ├─ lib/
│  │  ├─ supabase/
│  │  │  ├─ client.ts
│  │  │  ├─ types.ts
│  │  │  ├─ queries.ts
│  │  │  └─ auth.ts
│  │  │
│  │  ├─ utils.ts
│  │  ├─ constants.ts
│  │  └─ env.ts
│  │
│  ├─ hooks/
│  │  └─ use-mobile.ts
│  │
│  ├─ stores/              # Zustand or other global state
│  ├─ types/
│  ├─ styles/
│  │  ├─ globals.css
│  │  └─ tailwind.css
│  │
│  ├─ test/
│  │  ├─ setup.ts
│  │  └─ utils.tsx
│  │
│  ├─ main.tsx
│  └─ vite-env.d.ts
│
├─ supabase/
│  ├─ migrations/
│  ├─ functions/
│  │  ├─ create-payment/
│  │  └─ webhook-stripe/
│  └─ config.toml
│
├─ docs/
├─ .env
├─ .env.example
├─ components.json         # shadcn/ui
├─ eslint.config.js
├─ prettier.config.js
├─ tailwind.config.js
├─ tsconfig.json
├─ vite.config.ts
└─ vitest.config.ts
```
