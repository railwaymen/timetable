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
    'react/jsx-filename-extension': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/forbid-prop-types': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/anchor-has-content': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/label-has-for': 'off',
    'jsx-a11y/no-autofocus ': 'off',
    'jsx-a11y/no-noninteractive-tabindex': 'off',
    'jsx-a11y/control-has-associated-label': 'off',
    'no-param-reassign': 'off',
    'no-alert': 'off',
    'camelcase': 'off',

    // TODO: enable these rules:

    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'react/destructuring-assignment': 'off',
    'react/sort-comp': 'off',
    'class-methods-use-this': 'off',
    'max-len': ["error", { "code": 180 }]
  },
  globals: {
    I18n: 'readonly',
    currentUser: 'readonly',
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', './app/javascript'],
          ['@components', './app/javascript/components'],
          ['@hooks', './app/javascript/hooks'],
          ['@models', './app/javascript/models'],
        ]
      }
    }
  }
};
