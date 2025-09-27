// eslint.config.js
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.jsx', '**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        window: true,
        document: true,
        navigator: true,
        console: true,
        localStorage: true,
        fetch: true,
        Headers: true,
        process: true,
        URL: true,
        URLSearchParams: true,
        setTimeout: true,
        it: true // for tests
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/prop-types': 'off',
    },
  },
  prettier,
];
