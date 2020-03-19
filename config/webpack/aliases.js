const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '..', '..', 'app/javascript'),
      '@components': path.resolve(__dirname, '..', '..', 'app/javascript/components'),
      '@hooks': path.resolve(__dirname, '..', '..', 'app/javascript/hooks'),
      '@models': path.resolve(__dirname, '..', '..', 'app/javascript/models'),
    },
  },
};
