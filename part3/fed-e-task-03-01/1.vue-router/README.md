# vue-router

### Hash

表象上，url 上存在 /#/ 形式，例如：https://www.xxx.com/#/detail?id=213

#### 原理

Hash 模式是基于锚点，以及 onhashchange 事件

- URL 中 # 后面的内容作为路径地址
- 监听 hashchange 事件
- 根据当前路由地址找到对应组件重新渲染



在本例中，通过 `window.location.hash` 进行 hash 的变更，通过监听 `hashchange` 事件，来切换显示组件。

同时，定义了 `History` 与`Hash` 两个类，将初始化处理，更改 url，事件监听 进行抽象，便于通过配置的的方式，从 `history` 与 `hash	` 模式中进行切换。
