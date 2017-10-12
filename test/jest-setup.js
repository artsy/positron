import $ from 'jquery'
import dotenv from 'dotenv'
dotenv.config({path: '.env.test'})

console.log('is loaded')
console.log(process.env.NODE_ENV)
process.stderr = function () {
  return {
    stderr: {fd: 2}
  }
}

global.$ = global.jQuery = $

window.innerHeight = 900
window.innerWidth = 1400

window.matchMedia = window.matchMedia || function () {
  return {
    matches: false,
    addListener: function () {},
    removeListener: function () {}
  }
}
