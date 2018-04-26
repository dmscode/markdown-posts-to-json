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
      // input path, your posts path
      postPath: path.resolve(__dirname, './posts'),
      // output path
      outPath: 'dist/posts',
      // include sub dir
      includeSubPath: true,
      // name for index of JSON
      indexName: 'index',
      // merge index.md's metadatas to its dir
      mergeIndex2dir: true,
      // sub Node's name
      subNode: 'posts',
      // all prefix is 'mi_' keys will be remove prefix and transfered to Markdown-it. This is default option of Markdown-It
      mi_html: false,
      mi_xhtmlOut: false,
      mi_breaks: false,
      mi_langPrefix: 'language-',
      mi_linkify: false,
      mi_typographer: false,
      mi_quotes: '“”‘’',
      mi_highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return '<pre class="hljs"><code>' +
                  hljs.highlight(lang, str, true).value +
                  '</code></pre>';
          } catch (__) {}
        }
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
      }
    })
  ]
}