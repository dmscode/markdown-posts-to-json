Markdown posts to JSON
===

本插件主要功能是将 Markdown 文档头部的 YAML 格式数据进行提取，其余部分作为文章内容转化为 HTML 格式，并将上述内容转换为 JSON 格式输出。

主要是为了满足对博客文章的处理需求。

同时会生成一个索引文件（JSON），内容为一个包含所有文章元数据（文章头部 YAML 格式部分）内容的对象。对象结构与目录结构相同，并支持将 `index.md` 文件的元数据合并至它所在目录的对象中

## 使用方法：

本插件需配合 Webpack 服用，只需在 Webpack 配置文件中如下配置即可，对于 Markdown-It 的配置，可在属性前加上 “mi_” 前缀，所有选项均非必须（但估计你不会喜欢我的默认值）

```js
  plugins: [
    // Markdown posts 2 json data
    new mp2j({
      // input path, your posts path
      postPath: path.resolve(__dirname, './posts'),
      // output path
      outPath: 'dist/posts',
      // include sub dir
      includeSubPath: false,
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
```

## 更新日志：

### 0.0.7
文章数据分割正则优化

### 0.0.6
修正索引文件层级问题，可以设置索引文件中子节点的名称

### 0.0.5
分割正则优化

### 0.0.4
包信息完善

### 0.0.3
优化索引文件结构

### 0.0.2
实现了 Markdown-it 的参数传入

### 0.0.1
功能初步实现