## Vue.js 源码剖析-响应式原理、虚拟 DOM、模板编译和组件化

### 简答题

#### 1、请简述 Vue 首次渲染的过程。

<img src="assets/首次渲染过程.png" alt="首次渲染过程" style="zoom:50%;" />

1. 首先进行 Vue 的初始化工作，包括 Vue 的静态成员及实例成员。

   在 src/platforms/web/runtime/index.js 下，处理了与平台相关的函数。

   - 注册和平台相关的全局指令：v-model、v-show
   - 注册和平台相关的全局组件： v-transition、v-transition-group
   - 全局方法：
     - _patch__：把虚拟 DOM 转换成真实 DOM
     - $mount：挂载方法

   ```js
   // src/platforms/web/runtime/index.js
   
   // 判断是否是关键属性（表单元素的 input/checked/selected/muted）
   // 如果是这些属性，设置 el.props 属性（属性不设置到标签上）
   Vue.config.mustUseProp = mustUseProp
   Vue.config.isReservedTag = isReservedTag
   Vue.config.isReservedAttr = isReservedAttr
   Vue.config.getTagNamespace = getTagNamespace
   Vue.config.isUnknownElement = isUnknownElement
   
   // 注册 指令 v-model、v-show
   extend(Vue.options.directives, platformDirectives)
   // 注册 组件 transition、transition-group
   extend(Vue.options.components, platformComponents)
   
   Vue.prototype.__patch__ = inBrowser ? patch : noop
   
   Vue.prototype.$mount = function (
     el?: string | Element,
     hydrating?: boolean
   ): Component {
     el = el && inBrowser ? query(el) : undefined
     return mountComponent(this, el, hydrating)
   }
   ```

   在 src/core/index.js 下，通过 initGlobalAPI 方法，给 Vue 的构造函数增加了静态方法。

   ```js
   export function initGlobalAPI (Vue: GlobalAPI) {
     // config
     const configDef = {}
     configDef.get = () => config
     if (process.env.NODE_ENV !== 'production') {
       configDef.set = () => {
         warn(
           'Do not replace the Vue.config object, set individual fields instead.'
         )
       }
     }
     // 初始化 Vue.config 对象
     Object.defineProperty(Vue, 'config', configDef)
   
     // exposed util methods.
     // NOTE: these are not considered part of the public API - avoid relying on
     // them unless you are aware of the risk.
     // 这些工具方法不视作全局 API 的一部分，除非你已经意识到某些风险，否则不要去依赖它们
     Vue.util = {
       warn,
       extend,
       mergeOptions,
       defineReactive
     }
   
     // 静态方法 set/del/nextTick
     Vue.set = set
     Vue.delete = del
     Vue.nextTick = nextTick
   
     // 2.6 explicit observable API
     // 让一个对象可响应
     Vue.observable = <T>(obj: T): T => {
       observe(obj)
       return obj
     }
     
     // 初始化 Vue.options 对象，并给其拓展
     // components/directives/filters
     Vue.options = Object.create(null)
     ASSET_TYPES.forEach(type => {
       Vue.options[type + 's'] = Object.create(null)
     })
   
     // this is used to identify the "base" constructor to extend all plain-object
     // components with in Weex's multi-instance scenarios.
     Vue.options._base = Vue
   
     // 设置 keep-alive 组件
     extend(Vue.options.components, builtInComponents)
   
     // 注册 Vue.use() 用来注册插件
     initUse(Vue) 实现混入
     // 注册 Vue.mixin()
     initMixin(Vue)
     // 注册 Vue.extend() 基于传入的 options 返回一个组件的构造函数
     initExtend(Vue)
     // 注册 Vue.directive()、Vue.component()、Vue.filter()
     initAssetRegisters(Vue)
   }
   ```

   在 src/core/instance/index.js 下，定义了 Vue 的构造函数，给 Vue 中混入了常用的实例成员。

   ```js
   // src/core/instance/index.js
   
   // 此处不用 class 的原因是因为方便后续给 Vue 实例混入实例变量
   function Vue (options) {
     if (process.env.NODE_ENV !== 'production' &&
       !(this instanceof Vue)
     ) {
       warn('Vue is a constructor and should be called with the `new` keyword')
     }
     // 调用 _init 方法
     this._init(options)
   }
   
   // 注册 vm 的 _init 方法，初始化 vm
   initMixin(Vue)
   // 注册 vm 的 $data/$props/$set/$delete/$watch
   stateMixin(Vue)
   // 初始化事件相关方法
   // $on/$off/$once/$emit
   eventsMixin(Vue)
   // 初始化生命周期相关的混入方法
   // _update/$forceUpdate/$destroy
   lifecycleMixin(Vue)
   // 混入 render
   // $nextTick/_render
   renderMixin(Vue)
   ```

2. 调用 new Vue() 进行实例的创建，在其构造函数中，调用 this._init()方法，对各种配置参数进行处理。

   - 将用户传入的配置跟基础配置进行合并。
   - 初始化生命周期，事件，各项数据，并且在相应的阶段触发相应钩子函数的回调。
   - 调用 $mount，挂载到 DOM 树上。

   ```js
   Vue.prototype._init = function (options?: Object) {
     // ...
     // // 合并 options
     vm.$options = mergeOptions(
       resolveConstructorOptions(vm.constructor),
       options || {},
       vm
     )
     // ...
     // 初始化操作
     vm._self = vm
     // vm 的生命周期相关变量初始化
     // #children/$parent/$root/$refs
     initLifecycle(vm)
     // vm 的事件监听初始化，父组件绑定在当前组件上的事件
     initEvents(vm)
     // vm 的编译 render 初始化
     // $slots/$socpedSlots/_c/$createElement/$attrs/$listener
     initRender(vm)
     // beforeCreate 钩子的回调
     callHook(vm, 'beforeCreate')
     // 把 inject 的成员注入到 vm 上
     initInjections(vm) // resolve injections before data/props
     // 初始化 vm 的 _props/methods/_data/computed/watch
     initState(vm)
     // 初始化 provide
     initProvide(vm) // resolve provide after data/props
     // create 钩子的回调 
     callHook(vm, 'created')
     
     // 调用 $mounted() 挂载
     if (vm.$options.el) {
       vm.$mount(vm.$options.el)
     }
   }
   ```

3. 针对 编辑器 + 运行时 版本，在 src/platforms/web/entry-runtime-with-compiler.js 下，进行了额外处理。

   首先缓存了 vue 实例的 $mount 方法，之后针对 template / el 及 render 等参数进行处理。

   - el 不能是 body 或者 html 标签。
   - 如果没有 render 函数，把 template / el 通过 compileToFunctions 函数转换成 render 函数。
   - 如果有 render 函数，直接调用 mount 挂载 DOM。

   ```js
   // src/platforms/web/entry-runtime-with-compiler.js
   
   // 保留 Vue 实例的 $mount 方法
   const mount = Vue.prototype.$mount
   Vue.prototype.$mount = function (
     el?: string | Element,
     // 非 ssr 情况下为 false，ssr 时候为 true
     hydrating?: boolean
   ): Component {
     // 获取 el 对象
     el = el && query(el)
   
     /* istanbul ignore if */
     // el 不能为 body 或者 html
     if (el === document.body || el === document.documentElement) {
       process.env.NODE_ENV !== 'production' && warn(
         `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
       )
       return this
     }
   
     const options = this.$options
     // resolve template/el and convert to render function
     // 把 template/el 转换成 render 函数
     if (!options.render) {
       let template = options.template
       // 如果模板存在
       if (template) {
         if (typeof template === 'string') {
           // 如果模板是 id 选择器
           if (template.charAt(0) === '#') {
             // 获取对应的 DOM 对象的 innerHTML
             template = idToTemplate(template)
             /* istanbul ignore if */
             if (process.env.NODE_ENV !== 'production' && !template) {
               warn(
                 `Template element not found or is empty: ${options.template}`,
                 this
               )
             }
           }
         } else if (template.nodeType) {
           // 如果模板是元素，返回元素的 innerHTML
           template = template.innerHTML
         } else {
           if (process.env.NODE_ENV !== 'production') {
             warn('invalid template option:' + template, this)
           }
           return this
         }
       } else if (el) {
         template = getOuterHTML(el)
       }
       if (template) {
         /* istanbul ignore if */
         if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
           mark('compile')
         }
   
         const { render, staticRenderFns } = compileToFunctions(template, {
           outputSourceRange: process.env.NODE_ENV !== 'production',
           shouldDecodeNewlines,
           shouldDecodeNewlinesForHref,
           delimiters: options.delimiters,
           comments: options.comments
         }, this)
         options.render = render
         options.staticRenderFns = staticRenderFns
   
         /* istanbul ignore if */
         if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
           mark('compile end')
           measure(`vue ${this._name} compile`, 'compile', 'compile end')
         }
       }
     }
     // 调用 mount 方法，渲染 DOM
     return mount.call(this, el, hydrating)
   }
   ```

4. $mount 方法，本质上调用了 mountComponent 方法。

   ```js
   Vue.prototype.$mount = function (
     el?: string | Element,
     hydrating?: boolean
   ): Component {
     el = el && inBrowser ? query(el) : undefined
     return mountComponent(this, el, hydrating)
   }
   ```

5. 在 mountComponent 中，定义了 updateComponent() 函数但是并未调用，这个函数中调用了 _render() 和 _update() 两个方法，\_render() 是用于生成虚拟 DOM，\_update() 是将虚拟 DOM 转化为真实 DOM 并挂载到 DOM 树上，最终渲染到页面上。

   ```js
   updateComponent = () => {
     vm._update(vm._render(), hydrating)
   }
   ```

6. 创建 Watcher 实例，该实例作为渲染 Watcher，用于与之相关的响应式对象发生变化时，接受通知，调用 updateComponent() 函数进行页面视图的变更。在实例的创建过程中，也会 调用其自身的 get 方法，该方法中也会调用 updateComponent() 函数进行页面视图的首次渲染。

   ```js
   new Watcher(vm, updateComponent, noop, {
     before () {
       if (vm._isMounted && !vm._isDestroyed) {
         callHook(vm, 'beforeUpdate')
       }
     }
   }, true /* isRenderWatcher */)
   ```

7. 触发 mounted 钩子函数后返回当前 vm 实例。

　

#### 2、请简述 Vue 响应式原理。

<img src="assets/响应式处理过程.png" alt="响应式处理过程" style="zoom:50%;" />　



#### 3、请简述虚拟 DOM 中 Key 的作用和好处。

使用 Key 最大的作用是重用 DOM ，减少 DOM 操作。

Key 的使用在函数 sameVnode 中，Key 是判断比较两个 VNode 是否相同的重要依据。

```js
function sameVnode (a, b) {
  return (
    a.key === b.key &&
    // ...
  )
}
```

当页面由于数据的变化发生重新渲染时，此时会重新生成 VNode，Vue 会调用 patch 方法通过对比新、旧节点的变化来更新视图。

如果新旧节点都存在，且旧 VNode 不为真实 DOM，同时通过 sameVnode 函数判断为相同节点，此时就会调用 patchVnode 函数进行 diff 操作，比对新旧节点的差异。

```js
// 新旧 VNode 都存在，更新
const isRealElement = isDef(oldVnode.nodeType)
if (!isRealElement && sameVnode(oldVnode, vnode)) {
  // 旧 VNode 不为真实 DOM，且新旧节点相同
  // 更新操作，diff 算法
  patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
}
```

在 patchVnode 函数中，若新节点没有文本，且新节点和旧节点都有子节点，则需对子节点进行 Diff 操作，即调用 updateChildren，Key 就在 updateChildren 起了大作用。

```js
if (isUndef(vnode.text)) {
  // 新节点没有文本
  if (isDef(oldCh) && isDef(ch)) {
    // 新老节点都有子节点
    // 对子节点进行 diff 操作，调用 updateChildren
    if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
  }
  // ...
}
```

updateChildren 中会遍历对比新、旧节点的子节点，并按 Diff 算法通过 sameVnode 来判断要对比的节点是否相同。

```js
// diff 算法
// 当新节点与旧节点都没有遍历完成
while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
  // ...
  if (sameVnode(oldStartVnode, newStartVnode)) {
    // oldStartVnode 和 newStartVnode 相同
    // 直接将该 VNode 节点进行 patchVnode
    patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
    // 获取下一组节点
    oldStartVnode = oldCh[++oldStartIdx]
    newStartVnode = newCh[++newStartIdx]
  } else if (sameVnode(oldEndVnode, newEndVnode)) {
    // oldEndVnode 和 newEndVnode 相同
    // 直接将该 VNode 节点进行 patchVnode
    patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
    // 获取下一组节点
    oldEndVnode = oldCh[--oldEndIdx]
    newEndVnode = newCh[--newEndIdx]
  } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
    // oldStartVnode 和 newEndVnode 相同
    // 进行 patchVnode，把 oldStartVnode 移动到最后
    patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
    canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
    // 移动游标，获取下一组节点
    oldStartVnode = oldCh[++oldStartIdx]
    newEndVnode = newCh[--newEndIdx]
  } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
    // oldEndVnode 和 newStartVnode 相同
    // 进行 patchVnode，把 oldEndVnode 移动到最左
    patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
    canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
    // 移动游标，获取下一组节点
    oldEndVnode = oldCh[--oldEndIdx]
    newStartVnode = newCh[++newStartIdx]
  } else {
    // 以上四种情况都不满足
    // newStartVnode 依次和旧的节点比较

    // 从新的节点开头获取一个，从老节点中查找相同节点
    // 先找新开始节点的 key 与老节点相同的索引，如果没找到再通过 sameVnode 查找
    if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
    idxInOld = isDef(newStartVnode.key)
      ? oldKeyToIdx[newStartVnode.key]
      : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
      // 如果没有找到
    if (isUndef(idxInOld)) { // New element
      // 创建节点并插入到最前面
      createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
    } else {
      // 找到
      // 获取要移动的老节点，
      vnodeToMove = oldCh[idxInOld]
      // 如果使用 newStartVnode 找到相同的老节点
      if (sameVnode(vnodeToMove, newStartVnode)) {
        // 执行 patchVnode，并将找到的旧节点移动到最前面
        patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        oldCh[idxInOld] = undefined
        canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
      } else {
        // 如果 key 相同，但是是不同的元素，创建新元素
        // same key but different element. treat as new element
        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
      }
    }
    newStartVnode = newCh[++newStartIdx]
  }
}
if (oldStartIdx > oldEndIdx) {
  // 当结束时，oldStartIdx > oldEndIdx，旧节点遍历完，但是新节点还没有
  // 说明新节点比老节点多，把剩下的新节点插入到老节点后面
  refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
  addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
} else if (newStartIdx > newEndIdx) {
  // newStartIdx > newEndIdx，新节点遍历完，但是老节点还没有
  // 移除剩余老节点
  removeVnodes(oldCh, oldStartIdx, oldEndIdx)
}
```

在 diff 算法中，会先从新旧节点的首尾两端开始比较，依次向中间靠拢，共分为四种情况。

- 若这里的子节点未设置 Key，则此时的每个新、旧子节点在执行 sameVnode 时会判定相同，然后再次执行一次 patchVnode 来对比这些子节点，假设这些子节点的文本内容不同，此时就会进行 DOM 的操作。
- 若设置了 Key，当执行 sameVnode 进行判定时，
  - 若 Key 不同， sameVnode 返回 false，然后执行后续判断；
  - 若 Key 相同，sameVnode 返回 true，然后再执行 patchVnode 来对比这些子节点。之后节点会发生移位，减少 DOM 的操作。

即，使用了 Key 后，可以优化新、旧节点的对比判断，减少了遍历子节点的层次，少使用很多次 patchVnode，减少 DOM 的操作。

#### 4、请简述 Vue 中模板编译的过程。

<img src="assets/模板编译过程.png" alt="模板编译过程" style="zoom:50%;" />

　

　