const path = require('path')
const { VueLoaderPlugin } = require('vue-loader/lib/index')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'js/[name].[contenthash:8].js',
    publicPath: '/',
    chunkFilename: 'js/[name].[contenthash:8].js'
  },

  module: {
    rules: [
      {
        // enforce: 'pre' 使其优于 其它 loader 执行
        enforce: 'pre',
        test: /\.(vue|(j|t)sx?)$/,
        exclude: /node_modules/,
        use: 'eslint-loader'
      },
      {
        test: /\.(jpg|png|jpeg|gif|bmp)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 4 * 1024,
            // 可能出现打包图片以后图片不能正常显示，查看元素可以发现 src 显示是 module，
            // 这是webpack他默认会以esmodule的形式打包，就被打包成一个模块，加上一个配置项 esModule: false 即可
            esModule: false,
            fallback: {
              loader: 'file-loader',
              options: {
                name: 'img/[name].[hash:8].[ext]'
              }
            }
          }
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 4 * 1024,
          esModule: false,
          fallback: {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[hash:8].[ext]'
            }
          }
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: 'public/test.js'
        }
      ]
    })
  ]
}
