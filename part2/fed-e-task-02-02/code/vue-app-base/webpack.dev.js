const webpack = require('webpack')
const { merge } = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const commonConfig = require('./webpack.common.js')

const prodConfig = {
  mode: 'development',

  devtool: 'eval-cheap-module-source-map',

  // 解决热更新失效问题
  target: 'web',

  // 缓存
  cache: {
    type: 'memory'
  },

  // webpack-dev-server 配置
  devServer: {
    port: 3000,
    hot: true,
    open: true,
    contentBase: './dist'
  },

  module: {
    rules: [
      // 将 ES 高等级的特性，转化为大多数浏览器能识别的语法
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        // loader的执行顺序是从右向左，从下到上。
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader']
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      title: 'Vue',
      favicon: './public/favicon.ico'
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
}

module.exports = merge(commonConfig, prodConfig)
