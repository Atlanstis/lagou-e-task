/*
  将下面异步代码使用 Promise 的方法改进
  尽量用看上去像同步代码的方式
  setTimeout(function () {
    var a = 'hello'
    setTimeout(function () {
      var b = 'lagou'
      setTimeout(function () {
        var c = 'I ♥ U'
        console.log(a + b +c)
      }, 10)
    }, 10)
  }, 10)
*/

const p = new Promise((resolve) => {
  setTimeout(() => {
    var a = 'hello'
    resolve(a)
  }, 10)
})
const p1 = p.then((value) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      var b = 'lagou'
      resolve(value + b)
    }, 10)
  })
})
const p2 = p1.then((value) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      var c = 'I ♥ U'
      resolve(value + c)
    }, 10)
  })
})
p2.then((value) => {
  console.log(value)
})
