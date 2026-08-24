import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['api/**'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['api/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // react-hooks/refs (new in eslint-plugin-react-hooks v7, aimed at
    // React Compiler compatibility) flags any component that receives
    // handlers from a custom hook returning { ref, ...handlers }, since
    // it can't statically verify the handlers only touch ref.current
    // inside event callbacks rather than during render. useTilt does
    // exactly that verified-safe pattern (see its own doc comment) and
    // this project doesn't use the React Compiler, so this is a
    // confirmed false positive rather than a real bug.
    files: ['src/hooks/useTilt.js', 'src/components/cards/**/*.jsx'],
    rules: {
      'react-hooks/refs': 'off',
    },
  },
])
