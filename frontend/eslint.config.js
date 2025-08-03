import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import tsParser from '@typescript-eslint/parser';
import pluginTs from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist', 'node_modules'] },
  ...pluginVue.configs['flat/recommended'],
  prettier,
  {
    files: ['**/*.ts', '**/*.vue', '**/*.js'],
    ignores: ['dist', 'node_modules'],

    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    plugins: {
      vue: pluginVue,
      '@typescript-eslint': pluginTs,
    },

    rules: {
      ...pluginTs.configs.recommended.rules,
      'vue/multi-word-component-names': 'off',
    },
  },
];
