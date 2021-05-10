// 实现这个项目的构建任务

const { src, dest, parallel, series, watch } = require("gulp");

const del = require("del");

// 热更新服务器
const browserSync = require("browser-sync");

// 自动加载插件
const loadPlugins = require("gulp-load-plugins");
const plugins = loadPlugins();

// 创建一个开发服务器
const bs = browserSync.create();

const data = {
  menus: [
    {
      name: "Home",
      icon: "aperture",
      link: "index.html",
    },
    {
      name: "About",
      link: "about.html",
    },
  ],
  pkg: require("./package.json"),
  date: new Date(),
};

const clean = () => {
  // 参数为需要清除的文件路径
  return del(["dist", "temp"]);
};

const style = () => {
  // { base: 'src' } 设置基准路径，此时写入流，会按照 src() 中匹配之后的路径（此处路径为 /assets/styles/），生成文件
  return src("src/assets/styles/*.scss", { base: "src" })
    .pipe(plugins.sass({ outputStyle: "expanded" })) // { outputStyle: 'expanded' } css 文件中，将中括号完全展开
    .pipe(dest("temp"))
    .pipe(bs.reload({ stream: true }));
};

const script = () => {
  return src("src/assets/scripts/*.js", { base: "src" })
    .pipe(plugins.babel({ presets: ["@babel/preset-env"] }))
    .pipe(dest("temp"))
    .pipe(bs.reload({ stream: true }));
};

const page = () => {
  // src/**/*.html 任意子目录下的 html
  return src("src/*.html", { base: "src" })
    .pipe(plugins.swig({ data, defaults: { cache: false } })) // 防止模板缓存导致页面不能及时更新
    .pipe(dest("temp"))
    .pipe(bs.reload({ stream: true }));
};

const image = () => {
  return src("src/assets/images/**", { base: "src" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};

const font = () => {
  return src("src/assets/fonts/**", { base: "src" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};

const extra = () => {
  return src("public/**", { base: "public" }).pipe(dest("dist"));
};

const serve = () => {
  // 第一个参数为路径，第二个参数为执行的任务
  watch("src/assets/styles/*.scss", style);
  watch("src/assets/scripts/*.js", script);
  watch("src/*.html", page);
  // 图片字体资源等，发生变化，重新加载即可
  watch(
    ["src/assets/images/**", "src/assets/fonts/**", "public/**"],
    bs.reload
  );

  bs.init({
    notify: false,
    port: 2080, // 启动端口
    open: true, // 是否自动打开浏览器
    // files: 'dist/**', // 监听的文件，发生变化后，自动更新浏览器
    server: {
      baseDir: ["temp", "src", "public"], // 当为数组时，会按照顺序依次查找文件
      routes: {
        "/node_modules": "node_modules", // 针对 / 开头请求，进行转接
      },
    },
  });
};

const useref = () => {
  return (
    src("temp/*.html", { base: "temp" })
      // searchPath: 查找路径
      .pipe(plugins.useref({ searchPath: ["temp", "."] }))
      // 压缩 js css html
      .pipe(plugins.if(/\.js$/, plugins.uglify()))
      .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
      .pipe(
        plugins.if(
          /\.html$/,
          plugins.htmlmin({
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
          })
        )
      )
      .pipe(dest("dist"))
  );
};

const compile = parallel(style, script, page);

const build = series(
  clean,
  parallel(series(compile, useref), image, font, extra)
);

// 先进行编译，再打开浏览器，防止浏览器资源不存在
const develop = series(compile, serve);

module.exports = {
  clean,
  build,
  develop,
};
