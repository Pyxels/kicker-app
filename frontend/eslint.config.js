import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser'; // ✅ required
import tsParser from '@typescript-eslint/parser';
import pluginTs from '@typescript-eslint/eslint-plugin';
import globals from 'globals';

export default [
  ...pluginVue.configs['flat/recommended'],

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
