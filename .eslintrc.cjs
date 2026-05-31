module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // Enforce domain purity: src/domain must not import from framework/IO layers
    'no-restricted-imports': [
      'error',
      {
        paths: [],
        patterns: [
          {
            group: ['react', 'react-dom', 'react/*'],
            message: 'src/domain must stay framework-free.',
          },
          {
            group: ['dexie', 'dexie/*'],
            message: 'src/domain must not touch IndexedDB.',
          },
          {
            group: ['zustand', 'zustand/*'],
            message: 'src/domain must not use UI state.',
          },
          {
            group: ['vite-plugin-pwa', 'workbox-*'],
            message: 'src/domain must not use browser APIs.',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      // Only enforce domain purity inside src/domain
      files: ['src/domain/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['react', 'react-dom', 'react/*'],
                message: 'src/domain must stay framework-free.',
              },
              {
                group: ['dexie', 'dexie/*'],
                message: 'src/domain must not touch IndexedDB.',
              },
              {
                group: ['zustand', 'zustand/*'],
                message: 'src/domain must not use UI state.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['*.test.ts', '*.test.tsx'],
      env: { node: true },
    },
  ],
  env: { browser: true, es2020: true },
}
