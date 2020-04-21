const webpack = require('webpack');
const { environment } = require('@rails/webpacker');
const aliases = require('./aliases');

environment.plugins.prepend('Provide',
  new webpack.ProvidePlugin({
    $: 'jquery/src/jquery',
    jQuery: 'jquery/src/jquery',
  })
)

environment.config.merge(aliases);

module.exports = environment;
