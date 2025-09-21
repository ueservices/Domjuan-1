module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  globals: {
    'Stripe': 'readonly',
    'window': 'readonly'
  },
  rules: {
    // Custom rules can be added here
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    'camelcase': 'off' // Disable camelcase for Stripe API compatibility
  },
  overrides: [
    {
      files: ['*.js'],
      excludedFiles: 'node_modules/*'
    }
  ]
};