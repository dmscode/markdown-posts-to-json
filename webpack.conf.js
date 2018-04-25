const path = require('path')
const webpack = require('webpack')
const mp2j = require('./index')

module.exports = {
  entry: './entry-just-for-try.js',
  output: {
    path: __dirname,
    filename: 'dist/bundle.js'
  },
  module: {},
  plugins: [
    // Markdown posts 2 json data
    new mp2j({
      postPath: path.resolve(__dirname, './posts'),
      outPath: 'dist/posts',
      includeSubPath: false,
    })
  ]
}