import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintPluginAstro from 'eslint-plugin-astro';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import globals from 'globals';
import useImageComponent from './eslint-rules/use-image-component';
import fixEmptySelectItemValue from './eslint-rules/fix-empty-select-item-value';

export default [
  ...eslintPluginAstro.configs.recommended,
  {
    ignores: ['node_modules', 'dist', '.astro', 'public'],
  },
  {
    plugins: {
      react: reactPlugin,
      '@typescript-eslint': tsPlugin,
      'import': importPlugin,
      'custom': {
        rules: {
          'use-image-component': useImageComponent,
          'fix-empty-select-item-value': fixEmptySelectItemValue,
        },
      },
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
        JSX: 'readonly',
        cn: 'readonly',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.astro'],
        },
      },
    },
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    rules: {
      'custom/use-image-component': 'error',
      'custom/fix-empty-select-item-value': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-labels': 'off',
      'no-unused-labels': 'off',
      'no-unused-expressions': 'off',
      'no-console': 'off',
      'no-undef': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'import/no-unresolved': 'off',
      'import/named': 'error',
      'import/default': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXElement[openingElement.name.name="Route"] JSXText[value="Wix Vibe"]',
          message: 'Routes are not implemented. The default "Wix Vibe" route is still present, which means pages are probably not visible to the user. Please implement proper routes for your application.',
        },
        {
          selector: 'CallExpression[callee.name="createBrowserRouter"] JSXElement[openingElement.name.name="div"] JSXText[value="Wix Vibe"]',
          message: 'Routes are not implemented. The default "Wix Vibe" route is still present, which means pages are probably not visible to the user. Please implement proper routes for your application.',
        },
        {
          selector:
            'CallExpression[callee.name="createBrowserRouter"] > ArrayExpression.arguments ' +
            '> ObjectExpression:has(Property[key.name="path"] > Literal[value="/"]) ' +
            '> Property[key.name="errorElement"] > JSXElement > JSXOpeningElement:not([name.name="ErrorPage"])',
          message: 'Root route errorElement must be <ErrorPage />.',
        },
        {
          selector:
            'Program:not(:has(ImportDeclaration[source.value="@/integrations/errorHandlers/ErrorPage"])) ' +
            'CallExpression[callee.name="createBrowserRouter"] > ArrayExpression.arguments ' +
            '> ObjectExpression:has(Property[key.name="path"] > Literal[value="/"]) ' +
            '> Property[key.name="errorElement"] JSXOpeningElement[name.name="ErrorPage"]',
          message: 'ErrorPage must be imported from "@/integrations/errorHandlers/ErrorPage".',
        }
      ],

    },
  },
  {
    files: ['**/*.astro'],
    rules: {
      'astro/no-conflict-set-directives': 'error',
      'astro/no-unused-define-vars-in-style': 'error',
    },
  },
];
