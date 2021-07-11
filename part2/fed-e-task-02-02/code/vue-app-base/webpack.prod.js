const path = require('path')
const { merge } = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const commonConfig = require('./webpack.common.js')

const prodConfig = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist')
  },

  devtool: false,

  optimization: {
    minimizer: [new CssMinimizerPlugin()]
  },

  // 缓存
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },

  module: {
    rules: [
      // 将 ES 高等级的特性，转化为大多数浏览器能识别的语法
      {
        test: /\.js$/,
        use: ['thread-loader', 'babel-loader']
      },
      {
        test: /\.css$/,
        // loader的执行顺序是从右向左，从下到上。
        use: [
          MiniCssExtractPlugin.loader,
          'thread-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'less-loader'
        ]
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      title: 'Vue',
      favicon: './public/favicon.ico',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeScriptTypeAttributes: true
      }
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    })
  ]
}

module.exports = merge(commonConfig, prodConfig)
