require('regenerator-runtime/runtime')
require('@babel/register')({
  extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx']
})
require('coffeescript/register')
require('raf/polyfill')
require('should')
require('dotenv').config({
  path: require('path').join(process.cwd(), '.env.test')
})

const $ = require('jquery')
const Adapter = require('enzyme-adapter-react-16')
const Enzyme = require('enzyme')
const React = require('react')
const DOM = require('react-dom-factories')
const createClass = require('create-react-class')
const sd = require('sharify')
const { FeatureArticle } = require('@artsy/reaction/dist/Components/Publishing/Fixtures/Articles')

// Patch React 16 with deprecated helpers
React.DOM = DOM
React.createClass = createClass

Enzyme.configure({
  adapter: new Adapter()
})

try {
  global.$ = global.jQuery = $
  window.innerHeight = 900
  window.innerWidth = 1400
  window.matchMedia = window.matchMedia || function () {
    return {
      matches: false,
      addListener: function () { },
      removeListener: function () { }
    }
  }
} catch (error) { }

sd.data = {
  ARTICLE: FeatureArticle,
  CHANNEL: {},
  USER: { id: '57b5fc6acd530e65f8000406' }
}
