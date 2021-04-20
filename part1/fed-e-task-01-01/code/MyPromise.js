/*
尽可能还原 Promise 中的每一个 API, 并通过注释的方式描述思路和原理.
*/

// Promise 有三种状态，分别为 pending(等待)，rejected(失败)，fulfilled(成功)
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  // 实例对象的一个属性，初始为等待
  status = PENDING
  // 成功之后的值
  value = undefined
  // 失败之后的原因
  reason = undefined

  onFulfilledCallback = []
  onRejectedCallback = []

  constructor(executor) {
    try {
      // executor 是一个执行器，进入会立即执行，并传入 resolve 和 reject 方法
      executor(this.resolve, this.reject)
    } catch (e) {
      this.reject(e)
    }
  }

  // resolve和reject为什么要用箭头函数？
  // 如果直接调用的话，普通函数this指向的是window或者undefined
  // 用箭头函数就可以让this指向当前实例对象
  resolve = (value) => {
    // 判断状态是不是等待，阻止程序向下执行，实现状态只能变更一次
    if (this.status !== PENDING) {
      return
    }
    // 将状态改成成功
    this.status = FULFILLED
    // 保存成功之后的值
    this.value = value
    // 判断成功回调是否存在。如果存在，则调用
    while (this.onFulfilledCallback.length) {
      this.onFulfilledCallback.shift()()
    }
  }

  reject = (reason) => {
    if (this.status !== PENDING) {
      return
    }
    // 将状态改为失败
    this.status = REJECTED
    // 保存失败之后的原因
    this.reason = reason
    // 判断失败回调是否存在。如果存在，则调用
    while (this.onRejectedCallback.length) {
      this.onRejectedCallback.shift()()
    }
  }

  then(onFulfilled, onRejected) {
    // 处理 then 方法中，参数可选
    onFulfilled = onFulfilled ? onFulfilled : (value) => value
    onRejected = onRejected
      ? onRejected
      : (reason) => {
          throw reason
        }
    const promise2 = new MyPromise((resolve, reject) => {
      //判断状态
      if (this.status === FULFILLED) {
        // 因为new Promise需要执行完成之后才有promise2，同步代码中没有pormise2，
        // 所以这部分代码需要异步执行
        setTimeout(() => {
          try {
            // x是上一个promise回调函数的return返回值
            // 判断 x 的值时普通值还是 promise 对象
            // 如果是普通值 直接调用 resolve
            // 如果是 promise 对象 查看 promise 对象返回的结果
            // 再根据 promise 对象返回的结果 决定调用 resolve 还是 reject
            const x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      } else {
        // 等待，将成功与失败回调进行缓存
        this.onFulfilledCallback.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
        this.onRejectedCallback.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
      }
    })
    return promise2
  }

  static all(array) {
    const result = []
    const index = 0
    return new MyPromise((resolve, reject) => {
      const addData = (i, value) => {
        result[i] = value
        index++
        // 如果计数器和数组长度相同，那说明所有的元素都执行完毕了，就可以输出了
        if (index === array.length) {
          resolve(result)
        }
      }

      for (let i = 0; i < array.length; i++) {
        const curry = array[i]
        if (curry instanceof MyPromise) {
          // promise对象就执行then，如果是resolve就把值添加到数组中去，如果是错误就执行reject返回
          curry.then(
            (value) => addData(i, value),
            (reason) => reject(reason)
          )
        } else {
          // 普通值就加到对应的数组中去
          addData(i, curry)
        }
      }
    })
  }

  static race(array) {
    return new MyPromise((resolve, reject) => {
      for (let i = 0; i < array.length; i++) {
        const curry = array[i]
        if (curry instanceof MyPromise) {
          // 返回第一个成功的值，或失败的原因
          curry.then(resolve, reject)
        } else {
          // 返回成功
          resolve(curry)
        }
      }
    })
  }

  static resolve(value) {
    // 如果是promise对象，就直接返回
    if (value instanceof MyPromise) {
      return value
    } else {
      // 如果是值就返回一个promise对象，并返回值
      return new MyPromise((resolve) => resolve(value))
    }
  }

  static reject(value) {
    if (value instanceof MyPromise) {
      return value
    } else {
      return new MyPromise((resolve, reject) => reject(value))
    }
  }

  catch(onRejected) {
    return this.then(undefined, onRejected)
  }

  finally(callback) {
    // 如何拿到当前的promise的状态，使用then方法，而且不管怎样都返回callback
    // 而且then方法就是返回一个promise对象，那么我们直接返回then方法调用之后的结果即可
    // 我们需要在回调之后拿到成功的回调，所以需要把value也return
    // 失败的回调也抛出原因
    // 如果callback是一个异步的promise对象，我们还需要等待其执行完毕，所以需要用到静态方法resolve
    return this.then(
      (value) => {
        // 把callback调用之后返回的promise传递过去，并且执行promise，且在成功之后返回value
        return MyPromise.resolve(callback()).then(() => value)
      },
      (reason) => {
        // 失败之后调用的then方法，然后把失败的原因返回出去。
        return MyPromise.resolve(callback()).then(() => {
          throw reason
        })
      }
    )
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  // 如果相等了，说明return的是自己，抛出类型错误并返回
  if (promise2 === x) {
    return reject(
      new TypeError('Chaining cycle detected for promise #<Promise>')
    )
  }
  if (x instanceof MyPromise) {
    x.then(resolve, reject)
  } else {
    resolve(x)
  }
}

module.exports = MyPromise
