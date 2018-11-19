console.log 'xD'

new webpack.DefinePlugin({
  'process.env': {
    'ENV': JSON.stringify(metadata.ENV),
    'NODE_ENV': JSON.stringify(metadata.ENV),
    'HMR': HMR,
    'API_URL': JSON.stringify(process.env.API_URL)
  }
})
