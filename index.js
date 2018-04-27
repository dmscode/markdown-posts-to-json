const path = require('path')
const glob = require("glob")
const MarkdownIt = require("markdown-it")
const hljs = require("highlight.js")
const rf = require("fs")
const yaml = require('js-yaml')

let md;
// 合并选项对象
function mp2j(options) {
  mp2j.options = Object.assign({
    postPath: './',
    outPath: 'posts/',
    includeSubPath: false,
    indexName: 'index',
    mergeIndex2dir: true,
    subNode: 'posts'
  }, options);
  let mdOptions = {}
  for(let key in options){
    let reg = /^mi-/
    if(reg.test(key)){
      let k = key.replace(/^mi-/, '');
      mdOptions[k] = options[key];
    }
  }
  md = new MarkdownIt(mdOptions);
}
// 目录树分析函数
function rTree (pathArray, now, treeObject, metas){
  let key = pathArray[now];
  let subNode = mp2j.options.subNode;
  if( treeObject[subNode] == null ){
    treeObject[subNode] = {}
  }
  if((now+1) === pathArray.length){
    if(mp2j.options.mergeIndex2dir && key === 'index'){
      Object.assign(treeObject, metas);
    }else{
      treeObject[subNode][key] = metas
    }
  }else{
    if(treeObject[subNode][key] == null){
      treeObject[subNode][key] = {}
    }
    treeObject[subNode][key] = rTree (pathArray, now+1, treeObject[subNode][key], metas)
  }
  return treeObject;
}
// 功能函数
mp2j.prototype.apply = function(compiler) {
  compiler.plugin('emit', function(compilation, callback) {
    // 初始化搜索字符串，主要是判断是否包含子目录
    let pattern = (mp2j.options.includeSubPath
              ? '**/'
              : '')
            + '*.md';
    // 遍历查找所有符合的文件
    let posts = glob.sync(pattern, {
      cwd: mp2j.options.postPath,
      nodir: true
    });
    // 初始化输出路径
    let outPath = mp2j.options.outPath.substr(mp2j.options.outPath.length-1) !== '/'
                  ? mp2j.options.outPath+'/'
                  : mp2j.options.outPath;
    // 遍历处理所有文件
    let postCount = Object.keys(posts).length;
    let processed = 0;

    let tree = {};
    for(let post of posts){
      // 获取文件绝对地址
      let postPath = path.resolve(mp2j.options.postPath, post);
      // 读取文件并处理
      rf.readFile(postPath, "utf-8", function(err, postData){
        if(err){  
          console.log('Read File '+post+' Error: '+err);
        }else{
          let postOutPath = outPath+post.replace(/\.md$/, '.json');
          // 打散文章数据
          let postArray = postData.split(/(?:-|=){3,}[ \t]*(?:\n|\r)/);
          let metas = '';
          let metaIndex = -1;
          if(postArray.length > 1){
            metaIndex = (postArray[0].replace(/\s*/g,'') === '')
                          ? 1 // 第一组没有内容
                          : 0;
            try {
              metas = yaml.safeLoad(postArray[metaIndex]);
            } catch (e) {
              metaIndex = -1;
              console.log('YAML to JS maybe has an Error at '+post);
            }
          }
          let postContent = '';
          if(typeof(metas) !== 'object' || metaIndex === -1){
            // 没有文章元数据
            metas = { path: postOutPath };
            postContent = postData;
          }else{
            Object.assign(metas, { path: postOutPath } );  
            if(metaIndex === 0){
              postContent = postData.replace(/^[\s\S]*?(-|=){3,}[ \t]*(?:\n|\r)/, '')
            } else {
              postContent = postData.replace(/^([\s\S]*?(-|=){3,}[ \t]*(?:\n|\r)){2}/, '')
            }
          }
          let postJson = JSON.stringify( Object.assign({}, metas, { content: md.render(postContent) }) );
          compilation.assets[ postOutPath ] = {
            source: function() {
              return postJson;
            },
            size: function() {
              return postJson.length;
            }
          };
          // 将当前文件加入文件树
          let pathArray = post.replace(/\.md$/,'').split(/\/|\\/g);
          tree = rTree ( pathArray, 0, tree, metas)
        }

        // 统计已处理文章数量
        processed++;
        // 回调结束插件工作
        if(processed >= postCount){
          postsIndex = JSON.stringify(tree);
          compilation.assets[ outPath+mp2j.options.indexName+'.json' ] = {
            source: function() {
              return postsIndex;
            },
            size: function() {
              return postsIndex.length;
            }
          };
          callback();
        }
      })
    }
  });
};

module.exports = mp2j;