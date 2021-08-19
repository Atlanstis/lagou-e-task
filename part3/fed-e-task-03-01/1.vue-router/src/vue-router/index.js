let _Vue = null
export default class VueRouter {
  static install (Vue) {
    // 1. 判断当前插件是否已经被安装
    if (VueRouter.install.installed) {
      return
    }
    VueRouter.install.installed = true
    // 2. 把 Vue 构造函数记录到全局变量
    _Vue = Vue
    // 3. 把创建 Vue 实例时传入的 router 对象注入到 Vue 实例上
    // 通过混入方式，在 beforeCreate 时，在 Vue 原型上挂载属性
    _Vue.mixin({
      beforeCreate () {
        // 仅在 new Vue() 初始化时传入了 router 对象，因此通过该属性存在与否，防止多次挂载
        if (this.$options.router) {
          _Vue.prototype.$router = this.$options.router
          // 初始化
          this.$options.router.init()
        }
      }
    })
  }

  constructor (options) {
    this.options = options
    // 之后解析路由规则，并以键值对形式保存
    this.routeMap = {}
    // 判断路由方式，调用不同的实例
    const mode = options.mode || 'hash'
    switch (mode) {
      case 'history': {
        this.history = new History(this)
        break
      }
      case 'hash': {
        this.history = new Hash(this)
        break
      }
    }
  }

  init () {
    this.createRouteMap()
    this.initComponents(_Vue)
    this.initEvent()
  }

  createRouteMap () {
    // 遍历所有的路由规则，把路由规则解析成键值对的形式，存储到 routeMap 中
    const { routes } = this.options
    if (Array.isArray(routes)) {
      routes.forEach(route => {
        this.routeMap[route.path] = route.component
      })
    }
  }

  initComponents (Vue) {
    Vue.component('router-link', {
      props: {
        to: String
      },
      render (h) {
        return h(
          'a',
          {
            attrs: {
              href: this.to
            },
            on: {
              click: this.onClick
            }
          },
          [this.$slots.default]
        )
      },
      methods: {
        onClick (e) {
          this.$router.history.pushPath(this.to)
          // 更改响应式对象的值，触发页面自动更新
          this.$router.data.current = this.to
          e.preventDefault()
        }
      }
    })
    const _this = this
    Vue.component('router-view', {
      render (h) {
        const { routeMap, data } = _this
        // 获取渲染的组件，同时会随着响应式对象的值发生变化而变化
        const component = routeMap[data.current]
        return h(component)
      }
    })
  }

  initEvent () {
    this.history.addEventListener()
  }
}

function getHash () {
  let hash = window.location.hash
  const index = hash.indexOf('#')
  if (index < 0) return ''
  hash = hash.slice(index + 1)
  return hash
}

class History {
  constructor (_this) {
    this._this = _this
    // 记录当前路由，并通过 Vue.observable 创建一个响应式对象
    _this.data = _Vue.observable({
      current: window.location.pathname
    })
  }

  pushPath (path) {
    history.pushState({}, '', path)
  }

  addEventListener () {
    window.addEventListener('popstate', () => {
      this._this.data.current = window.location.pathname
    })
  }
}

class Hash {
  constructor (_this) {
    this._this = _this
    // 记录当前路由，并通过 Vue.observable 创建一个响应式对象
    _this.data = _Vue.observable({
      current: getHash()
    })
    // 处理访问路径为非 hash 的情况
    const path = getHash()
    if (path === '') {
      this.pushPath('/')
    }
  }

  pushPath (path) {
    window.location.hash = path
  }

  addEventListener () {
    window.addEventListener('hashchange', () => {
      this._this.data.current = getHash()
    })
  }
}
