module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off', // Allow console.log for server logging
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'indent': ['error', 4],
    'no-trailing-spaces': 'error',
    'eol-last': 'error'
  }
};