// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // ── 1. Что линтер не смотрит вообще ──────────────────────────────────────
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', '**/*.mjs', 'http/**'],
  },

  // ── 2. Базовые наборы правил ─────────────────────────────────────────────
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // ── 3. Окружение и парсер с типами ───────────────────────────────────────
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // ── 4. Правила проекта ───────────────────────────────────────────────────
  {
    files: ['**/*.ts'],
    rules: {
      // Необработанный промис в Nest — это потерянная ошибка, а не стиль.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // any прячет реальные типы: если он нужен — только осознанно, через unknown.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',

      // Неиспользуемое удаляем; осознанно пропущенное помечаем префиксом _.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Проект описывает контракты через type, а не interface — держим единообразно.
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],

      // Аннотация типа у свойства DTO нужна для emitDecoratorMetadata,
      // поэтому «избыточной» её считать нельзя.
      '@typescript-eslint/no-inferrable-types': [
        'error',
        { ignoreParameters: true, ignoreProperties: true },
      ],

      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // ── 5. Послабления для тестов ────────────────────────────────────────────
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
    rules: {
      // jest.fn() возвращает any-подобные моки — ругаться на них бессмысленно.
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },

  // ── 6. Prettier последним: гасит стилевые правила, конфликтующие с ним ───
  eslintPluginPrettierRecommended,
  {
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
