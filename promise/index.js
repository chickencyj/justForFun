const { isFunction,  isArray } = require('./utils')

const STATUS = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
}

class Promise {
  constructor(excutor) {
    const self = this
    const resolve = (value) => {
      self.value = value
      self.status = STATUS.FULFILLED
      self.done()
    }

    const reject = (reason) => {
      self.value = reason
      self.status = STATUS.REJECTED
    }
    
    self.value = undefined
    self.status = STATUS.PENDING
    self.defferd = []

    process.nextTick(() => {
      excutor(resolve, reject)
    })
  }

  done() {
    const status = this.status
    const defferd = this.defferd

    for (let i = 0; i < defferd.length; i++) {
      this.handle(defferd[i])
    }
  }

  handle(fn) {
    if (!fn) {
      return
    }
    const value = this.value
    const promise = fn.promise
    let p = undefined
    if (this.status === STATUS.FULFILLED) {
      p = fn.onFullfilled(value)
    } else {
      p = fn.onRejected(value)
    }
    
    if (promise) {
      if (p && p instanceof Promise) {
        p.defferd = promise.defferd
      } else {
        p = this
        p.defferd = promise.defferd
        this.done()
      }
    }

  }

  then(onFullfilled, onRejected) {
    const onCallback = {
      onFullfilled: onFullfilled,
      onRejected: onRejected
    }
    const status = this.status

    onCallback.promise = new this.constructor(() => {})

    if (status === STATUS.PENDING) {
      this.defferd.push(onCallback)
    } else {
      this.handle(onCallback)
    }
    return onCallback.promise
  }
}