import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['.next', 'node_modules']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Underscore-prefixed bindings mark intentionally-unused
      // parameters/destructured elements (mirrors tsconfig's
      // noUnusedParameters convention) rather than dead code.
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  },
  {
    files: ['src/app/api/**/*.ts'],
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
    files: ['src/hooks/useTilt.ts', 'src/components/cards/**/*.tsx'],
    rules: {
      'react-hooks/refs': 'off',
    },
  },
])
