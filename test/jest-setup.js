import 'raf/polyfill'
import $ from 'jquery'
import Adapter from 'enzyme-adapter-react-16'
import Enzyme from 'enzyme'
import React from 'react'
import DOM from 'react-dom-factories'
import createClass from 'create-react-class'
import sd from 'sharify'
import { FeatureArticle } from '@artsy/reaction-force/dist/Components/Publishing/Fixtures/Articles'

// Patch React 16 with deprecated helpers
React.DOM = DOM
React.createClass = createClass

Enzyme.configure({
  adapter: new Adapter()
})

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

sd.data = {
  ARTICLE: FeatureArticle,
  CHANNEL: {},
  USER: {}
}
