const webpack = require('webpack');
const { environment } = require('@rails/webpacker');
const aliases = require('./aliases');

environment.plugins.prepend('Provide',
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    Popper: ['popper.js', 'default'],
  })
)

environment.config.merge(aliases);

module.exports = environment;
