import antfu from '@antfu/eslint-config';

export default antfu({
  astro: true,
  typescript: true,
  yaml: false,
  markdown: false,

  stylistic: {
    semi: true,
    indent: 2,
    quotes: 'single',
  },

  ignores: [
    'public/**',
    'dist/**',
    'node_modules/**',
    '.astro/**',
  ],

  rules: {
    // Relax rules that are too noisy for Astro static site patterns
    'no-console': 'warn',
    'ts/no-explicit-any': 'off',
    'ts/no-unsafe-assignment': 'off',
    'ts/no-unsafe-member-access': 'off',
    'ts/no-unsafe-argument': 'off',
    'ts/no-unsafe-call': 'off',
    'ts/no-unsafe-return': 'off',
    'unicorn/prefer-module': 'off',

    // Astro files commonly use .ts extension in imports
    'import/extensions': 'off',

    // Allow unused variables starting with _ (common pattern)
    'no-unused-vars': 'off',
    'ts/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
}, {
  // Vercel serverless functions run in Node.js — process global is standard
  files: ['api/**/*.ts'],
  rules: {
    'node/prefer-global/process': 'off',
  },
});
