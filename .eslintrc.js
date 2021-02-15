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
    "react/jsx-filename-extension": [1, { 'extensions': ['.js'] }],
    'react/jsx-props-no-spreading': ['error', { 'html': 'ignore', 'exceptions': ['DatePicker'] }] ,
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
    'max-len': ['error', { 'code': 160 }],

    // TODO: enable these rules:
    'react/sort-comp': 'off',
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'react/destructuring-assignment': 'off',
    'class-methods-use-this': 'off'
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
