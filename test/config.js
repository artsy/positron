const React = require('react')
const DOM = require('react-dom-factories')
const createClass = require('create-react-class')
const path = require('path')

// Patch React 16 with deprecated helpers
React.DOM = DOM
React.createClass = createClass

require('dotenv').config({
  path: path.join(process.cwd(), '.env.test')
})
