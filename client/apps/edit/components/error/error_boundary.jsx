import React, { Component } from 'react'

export class ErrorBoundary extends Component {
  componentDidCatch (error, errorInfo) {
    debugger
    console.log('THERE WAS AN ERROR')
    alert(error)
  }

  render () {
    return this.props.children
  }
}
