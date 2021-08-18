## v-html 实现

1. 在 `Compiler` 类中，添加相对应的处理函数 `htmlUpdater`，通过 DOM 节点的 `innerHTML` 方法，添加到 DOM 树中。



## v-on 实现

1. 在 `Vue` 类的构造函数中，先将配置 `options.methods` 对象，注入到 `Vue` 实例中，使其可以通过 `this.` 方式调用。
2. 在 `Compiler` 类中，添加相对应的处理函数 `onUpdater`，解析参数，获取事件名称，及对应的处理函数，通过 `addEventListener` 方法，给相应的节点注册事件。

