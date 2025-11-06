import js from '@eslint/js';
import globals from 'globals';

export default [
    {
        files: ['**/*.js'],
        ignores: ['node_modules', 'dist', 'coverage'],

        languageOptions: {
            sourceType: 'module',
            globals: {
                ...globals.node,
            },
        },

        rules: {
            ...js.configs.recommended.rules,

            semi: ['error', 'always'],
            quotes: ['error', 'single'],
            'object-curly-spacing': ['error', 'always'],
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        },
    },
];