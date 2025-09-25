const js = require('@eslint/js');
const prettier = require('eslint-plugin-prettier');
const security = require('eslint-plugin-security');

module.exports = [
    js.configs.recommended,
    security.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'commonjs',
            globals: {
                // Node.js globals
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                global: 'readonly',
                module: 'readonly',
                require: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
                // Browser globals (for client-side files)
                window: 'readonly',
                document: 'readonly',
                alert: 'readonly',
                fetch: 'readonly',
                IntersectionObserver: 'readonly',
                Stripe: 'readonly',
                io: 'readonly',
                URL: 'readonly'
            }
        },
        plugins: {
            prettier,
            security
        },
        rules: {
            // Code quality rules - relaxed for this codebase
            'no-console': 'off', // This is a server/dashboard app where console output is expected
            'no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
            ],
            'prefer-const': 'error',
            'no-var': 'error',

            // Security rules
            'no-eval': 'error',
            'no-implied-eval': 'error',

            // Allow case declarations (common in switch statements)
            'no-case-declarations': 'off',

            // Security rules - configured for this application type
            'security/detect-non-literal-fs-filename': 'off', // This app manages files with dynamic names
            'security/detect-object-injection': 'off', // Many legitimate uses in this bot system

            // Style rules (handled by prettier)
            'prettier/prettier': [
                'error',
                {
                    singleQuote: true,
                    semi: true,
                    tabWidth: 4,
                    trailingComma: 'none'
                }
            ]
        }
    },
    {
        ignores: [
            'node_modules/**',
            '.git/**',
            'dist/**',
            'build/**',
            'coverage/**',
            '.nyc_output/**',
            'logs/**',
            'data/**',
            'backups/**',
            '*.log'
        ]
    },
    {
        files: ['tests/**/*.js'],
        languageOptions: {
            globals: {
                // Jest globals
                jest: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                expect: 'readonly',
                test: 'readonly'
            }
        }
    },
    {
        files: ['scripts/**/*.js'],
        rules: {
            'no-console': 'off'
        }
    }
];
