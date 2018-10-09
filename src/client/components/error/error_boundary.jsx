import PropTypes from "prop-types"
import React, { Component } from "react"

export class ErrorBoundary extends Component {
  static propTypes = {
    children: PropTypes.any,
  }

  componentDidCatch(error, errorInfo) {
    console.error(error)
  }

  render() {
    return this.props.children
  }
}
