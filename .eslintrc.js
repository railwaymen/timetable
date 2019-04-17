module.exports = {
  parser: "babel-eslint",
  env: {
    browser: true,
    es6: true,
    jquery: true,
  },
  extends: 'airbnb',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'react/jsx-filename-extension': 'off',
    'jsx-a11y/anchor-has-content': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'no-script-url': 'off',
    'react/forbid-prop-types': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/label-has-for': 'off',
    'camelcase': 'off',
    'no-param-reassign': 'off',
    'jsx-a11y/no-autofocus ': 'off',
    'jsx-a11y/no-noninteractive-tabindex': 'off',
    'no-param-reassign': 'off',

    // TODO: enable these rules:

    'react/no-access-state-in-setstate': 'off',
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'class-methods-use-this': 'off',
    'react/destructuring-assignment': 'off',
    'react/sort-comp': 'off',
    'react/no-unused-prop-types': 'off',
    'max-len': ["error", { "code": 1000 }]
  },
  globals: {
    I18n: 'readOnly',
    currentUser: 'readOnly',
  }
};
