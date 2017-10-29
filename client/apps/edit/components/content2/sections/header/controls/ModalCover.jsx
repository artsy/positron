import PropTypes from 'prop-types'
import React, { Component } from 'react'

export default class ModalCover extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired
  }

  render () {
    return (
      <div
        onClick={this.props.onClick}
        className='edit-header--controls__bg'
      />
    )
  }
}
