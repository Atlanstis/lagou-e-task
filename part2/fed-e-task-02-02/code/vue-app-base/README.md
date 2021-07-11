# vue-app-base(webpack5 + vue2.x)

![](https://github.com/Atlanstis/lagou-e-task/blob/master/part2/fed-e-task-02-02/code/vue-app-base/assets/webpack5%20%2B%20vue2.x.png)

## 基础资源处理

### 将 ES6+ 转 ES5

将 ES 高等级的特性，转化为大多数浏览器能识别的语法。

#### 依赖

```shell
npm install @babel/core babel-loader @babel/preset-env -D
```

#### 相关配置

```js
module.exports = {
	// ...
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
}
```

同时修改 `babel.config.js`：

```js
module.exports = {
  presets: ['@babel/preset-env']
}
```

### 处理 css，less

css，less 的处理，可通过 `style-loader`、`css-loader`、`less-loader` 进行处理。

`css-loader` 用于加载 .css 文件，并且转换成 commonjs 对象。

`style-loader ` 将样式通过 `<style> `标签插入到 head 中。

#### 依赖

```shell
npm install style-loader css-loader less less-loader -D
```

#### 相关配置

```js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.css$/,
        // loader的执行顺序是从右向左，从下到上。
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      }
    ]
  }
}
```

### css 增加浏览器兼容

#### 依赖

postcss-loader 可以通过js来转换css样式如适配，加前缀，css的重置等等。

postcss-loader 本身功能很少，需要借助其他插件，因此我们可以通过 `postcss-preset-env` 来拓展功能。

```
npm i postcss-loader postcss-preset-env -D
```

#### 相关配置

##### 增加 `postcss.config.js` 配置文件

```js
module.exports = {
  plugins: [require('postcss-preset-env')]
}
```

##### 更改 webpack 配置

```js
module.exports = {
  // ...
  module: {
    rules: [
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
  }
}
```

### 处理图片等静态资源

对于图片等静态资源，可采用 `file-loader`、`url-loader` 来进行处理。

`file-loader` 解决 css 等文件中引入图片路径的问题。

`url-loader ` 当图片较小的时候会把图片BASE64编码，大于 limit 参数的时候还是使用`file-loader`进行拷贝。

#### 依赖

```shell
npm install url-loader file-loader -D
```

#### 相关配置

```js
module.exports = {
	// ...
  module: {
    rules: [
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
      }
    ]
  }
}
```

### 处理字体文件

对于字体文件，与图片等静态资源相同处理。

#### 相关配置

```js
module.exports = {
  // ...
  module: {
    rules: [
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
      }
    ]
  }
}
```

### 处理 vue2.x 文件

Vue2.x 文件，可使用 `vue-loader`、`vue-template-compiler` 来进行处理。

vue-template-compiler：该模块可用于将 Vue 2.0 模板预编译为渲染函数（template => ast => render），以避免运行时编译开销和 CSP 限制。大多数场景下，与 `vue-loader `一起使用。

#### 依赖

```shell
npm install vue-loader vue-template-compiler -D
```

#### 相关配置

```js
const { VueLoaderPlugin } = require('vue-loader/lib/index')

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}
```

## 环境处理

### 环境配置分离

在正常开发中，我们会将环境分为 `development` 和 `production`。针对不同的环境，我们可将配置文件分为两份 `webpack.dev.js` 与 `webpack.prod.js` 。两份配置环境中，包含大量相同的对基础资源的处理，因此，我们可通过 `webpack-merge` 插件，对相同的配置进行抽离再合并。

#### 依赖

```shell
npm install webpack-merge -D 
```

### 模式设置

在  `development` 和 `production` 环境中，我们可将 mode 属性分别设置为  `development` 和 `production`。此时 webpack 根据配置的不同自动开启一些配置。

[模式(Mode) | webpack 中文文档](https://webpack.docschina.org/configuration/mode/)

### sourcemap 设置

在 不同的环境中，我们可以设置不同的  `devtool` 来更改生成的 `sourcemap`，以便我们进行调试。

sourcemap：打包编译后的文件和源文件的映射关系，用于开发者调试用。

- source-map 把映射文件生成到单独的文件，最完整但最慢
- cheap-module-source-map 在一个单独的文件中产生一个不带列映射的Map
- eval-source-map 使用eval打包源文件模块,在同一个文件中生成完整sourcemap
- cheap-module-eval-source-map sourcemap和打包后的JS同行显示，没有映射列

对于 `production` 环境，推荐使用 `none`，不生成 `sourcemap`。

> webpack5 中，devtool 设置为 false，来达到以上目的。

对于 `development` 环境，推荐使用 `eval-cheap-module-source-map`。

### development 开启热更新

webpack-dev-server：为你提供了一个基本的 web server，并且具有 live reloading (实时重新加载) 功能。

模块热替换(HMR - hot module replacement)功能会在应用程序运行过程中，替换、添加或删除模块，而无需重新加载整个页面。主要是通过以下几种方式，来显著加快开发速度。

#### 依赖

```shell
npm install --save-dev webpack-dev-server
```

#### 相关配置

```js
const webpack = require('webpack')
const prodConfig = {
  // 解决热更新失效问题
  target: 'web',

  devServer: {
    port: 3000,
    hot: true,
    open: true,
    contentBase: './dist'
  },

  plugins: [
    // ...
    new webpack.HotModuleReplacementPlugin()
  ]
}
```

在 `webpack@5.43.0`当前版本中，当项目根目录存在 `.browserslistrc` 文件，或者 `package.json` 存在` “browserslist”` 时，热更新失效，此时，`target` 设置为`web`，暂作处理。

## 插件使用

### 创建 html

我们可以通过 `html-webpack-plugin	` 将打包出的 js 文件，自动链接到 html 文件上。

#### 依赖

```shell
npm install html-webpack-plugin -D
```

#### 相关配置

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // ...
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      title: 'Vue',
      favicon: './public/favicon.ico'
    })
  ]
}
```

针对 `production` 环境，我们可以开启一些配置，进一步对文件进行压缩。

```js
{
  minify: {
    removeComments: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeScriptTypeAttributes: true
  }
}
```

### 清除打包文件

在 `production`  环境下，我们可以通过 `clean-webpack-plugin`，自动清理构建目录。防止目录中存在非本次打包的文件。

> webpack 5 中，也可通过 output.clean 配置，不用此插件。

#### 依赖

```shell
npm i clean-webpack-plugin -D
```

#### 相关配置

```js
const path = require('path')

module.exports = {
  // webpack5 必需配置 path 属性，否则无法生效
  output: {
    path: path.join(__dirname, 'dist')
  },
  // ...
  plugins: [
    new CleanWebpackPlugin()
  ]
}
```

### 复制静态资源

我们可以通过 `copy-webpack-plugin` 插件将一些静态资源，复制到打包目录下。

#### 依赖

```shell
npm i copy-webpack-plugin -D
```

#### 相关配置

```js
module.exports = {
  // ...
  plugins: [
    new CopyPlugin({
      patterns: [
        // 配置复制的文件
        {
          from: 'public/test.js'
        }
      ]
    })
  ]
}
```

### 打包后抽离 css 文件

生产环境，打包后，可使用 `mini-css-extract-plugin` 抽离之前生成在 js 文件中的 css 代码，生成独立文件。

#### 依赖

```shell
npm install mini-css-extract-plugin -D
```

#### 相关配置

```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        // loader的执行顺序是从右向左，从下到上。
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      },
      {
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'less-loader']
      }
    ]
  }
  // ...
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    })
  ]
}
```

#### 压缩打包后的 css 文件

在上一步，使用 `mini-css-extract-plugin` 抽离 css 文件后，我们可以通过插件压缩生成的 css文件。

> webpack 5 推荐使用 css-minimizer-webpack-plugin
>
> webpack 4 可使用 optimize-css-assets-webpack-plugin

#### 依赖

```shell
npm i css-minimizer-webpack-plugin -D
```

#### 相关配置

```js
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
  // ...
  optimization: {
    minimizer: [new CssMinimizerPlugin()]
  },
}
```

## 项目优化

### loader 配置优化

在使用 loader 时，可以通过配置 `include` 和 `exclude` 告诉 loader 处理范围。

### 缓存

webpack5 自带了持久化缓存，配置如下：

生产环境

```js
module.exports = {	
	cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  }
}
```

开发环境

```js
module.exports = {	
	cache: {
    type: 'memory'
  }
}
```

如果在构建时，你主动确定要放弃旧的缓存的话，可以传一个新的 `version` 参数来放弃使用缓存：

```js
module.exports = {	
	cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    },
    version: 'new_version'
  }
}
```

## 多线程打包

### happypack

#### 依赖

```shell
npm install happypack -D
```

#### 相关配置

```js
const Happypack = require('happypack')
const os = require('os')
const happyThreadPool = Happypack.ThreadPool({ size: os.cpus().length })

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'Happypack/loader?id=js',
      }
    ]
  }
  // ...
  plugins: [
     new Happypack({
      id: 'js', // 这个 id 值为上面 Happypack/loader?id=js 问号后跟的参数
      use: ['babel-loader'],
      threadPool: happyThreadPool
    })
  ]
}
```

`happypack` 与 `mini-css-extract-plugin` 有一定冲突，因此建议

- 放弃使用 `happypack`
- 使用 `happypack` 优化`js`和`css`，放弃使用 `mini-css-extract-plugin`
- 使用 `happypack` 优化 `js`，放弃优化 `css`，保留 `mini-css-extract-plugin`

### thread-load

#### 依赖

```shell
npm install thread-loader -D
```

#### 相关配置

```js
module.exports = {
  module: {
    rules: [
       {
        test: /\.js$/,
        use: ['thread-loader', 'babel-loader']
      },
      {
        test: /\.css$/,
        // loader的执行顺序是从右向左，从下到上。
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      },
      {
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, 'thread-loader' ,'css-loader', 'postcss-loader', 'less-loader']
      }
    ]
  }
}
```

## 整合 Eslint

### 依赖

```shell
npm i eslint eslint-loader -D
```

### 流程

- 安装 eslint eslint-loader 模块

- 初始化 `.eslintrc.js` 配置文件
- 新增 webpack 配置

```js
module.exports = {
  module: {
    rules: [
       {
        // enforce: 'pre' 使其优于 其它 loader 执行
        enforce: 'pre',
        test: /\.(vue|(j|t)sx?)$/,
        exclude: /node_modules/,
        use: 'eslint-loader'
      }
    ]
  }
}
```

- package.json 新增自动格式化命令 

```json
{
	"lint": "eslint --fix --ext .js,.vue src"
}
```

