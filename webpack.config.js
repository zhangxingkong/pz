'use strict';
//拼接路径
const path = require('path');
//引入webpack默认插件
const webpack = require('webpack');
//读取版本号
const fs = require("fs");
const version =JSON.parse(fs.readFileSync('./package.json','utf8')).version;
console.log(version);
//对html生进行路径更改插件
const htmlWebPackPlugin = require('html-webpack-plugin');
//分离css层叠样式表插件
const ExtractTextPlugin = require("extract-text-webpack-plugin");
//压缩css插件
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
//自动删除dist文件
const cleanWebpackPlugin = require('clean-webpack-plugin');
//压缩js插件
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
    entry:{
        main: path.join(__dirname,'./src/main.js'),
        vendors:['vue','axios','vue-router','vue-preview','moment']
    },
    output:{
        path:path.join(__dirname,'dist'),
        chunkFilename: 'js/chunk[id].js?[chunkhash]',
        publicPath: "/",
    },
    module:{
        loaders:[
            //处理css
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                  fallback: "style-loader",
                  use: "css-loader!autoprefixer-loader"
                }),
            },
             //处理less
            {
                test:/\.less$/,
                loader:'style-loader!css-loader!autoprefixer-loader!less-loader'
            }
            //处理二进制文件
            ,{//url(路径)
                test:/\.(jpg|svg|png|jepg|ttf|gif)$/,
                loader:'url-loader',
                options:{
                    limit: 4096,
                    name: "static/[name].[hash].[ext]"
                  }
            },
            {
                test:/\.js$/,
                exclude:/node_modules/,
                loader:'babel-loader'
            },
            //vue-loader->  vue-template-compiler
            //style-loader!css-loader file-loader可以写在loader里面
            {
                test:/\.vue$/,
                loader:'vue-loader'
            },
            {
              test: /vue-preview.src.*?js$/,
              loader: 'babel-loader'
            }
        ]
    }
    ,plugins:[
        //js压缩
        new UglifyJSPlugin(),
          // 创建一个删除文件夹的插件，把dist目录传递进去
        new cleanWebpackPlugin(['dist']),
        //分离css
        new ExtractTextPlugin("css/[name].[contenthash].css"),
        ////压缩css//不好用
        new OptimizeCssAssetsPlugin({
          assetNameRegExp: /\*\.css$/,
          //cssProcessor: require('cssnano'),
          //cssProcessorOptions: { discardComments: {removeAll: true } },
          //canPrint: true
        }),
        //进行插件的分离
        new webpack.optimize.CommonsChunkPlugin({
          names:['vendors','manifest']
        }),
        //指定index文件的位置
        new htmlWebPackPlugin({
          // 模板页面
          template: path.join(__dirname, './src/index.html'),
          // 在内容中生成页面名称
          filename: 'index.html',

          // 压缩HTML
          minify: {
            // 移除空白
            collapseWhitespace: true,
            // 移除注释
            removeComments: true,
            // 移除属性中的双引号
            removeAttributeQuotes: true
          }
        }),
    ]
}
if(process.argv.length === 2){
  //生产环境
  module.exports.output.filename = 'js/[name].[chunkhash].js';  // main.312321.js
  //让vue知道是生产环境不输出日志
  module.exports.plugins.push(new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"production"'
    }
  }));
}else{  //参数个数为7
  //开发环境
  //webpack-dev-server启动的时候，没有真实的生成文件，chunkhash就用不了
  module.exports.output.filename = 'js/[name].js';
}