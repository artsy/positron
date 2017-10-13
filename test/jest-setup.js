import $ from 'jquery'
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
