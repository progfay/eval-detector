module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'standard',
    'standard-with-typescript',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/react'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  rules: {
    'prettier/prettier': 'error'
  },
  plugins: ['@typescript-eslint', 'prettier']
}
