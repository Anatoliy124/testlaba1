import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "@typescript-eslint/explicit-function-return-type": "warn",
    },
    ignores: [
        "**/node_modules/**",
        "**/dist/**",
    ]
  },
);
