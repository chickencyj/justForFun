const fetch = require('isomorphic-fetch')
const Promise = require("bluebird")
const CONCURRENCY = 5
const URL = 'http://www.hao123.com'
let main_URLS = []
let i = 0
for (let j = 0; j < 100; j++) {
  main_URLS.push(j)
}
const sendReq = (URL, v, url) => {
  return fetch(URL)
    .then(_res => ({URL, v}))
    .then(next_url => {
      i++
      url.push(next_url.v + 'a')
      if (i === CONCURRENCY) {
        spider(url)
      }
      console.log('????????????', next_url.v, i)
      return
    })
}

let _urls = main_URLS.slice(0)
const spider = (url) => {
  i = 0
  console.log('length', url.length)
  let slice_url = url.splice(0, CONCURRENCY)
  slice_url.forEach(v => {
    sendReq(URL, v, url)
  })
}
spider(_urls)


