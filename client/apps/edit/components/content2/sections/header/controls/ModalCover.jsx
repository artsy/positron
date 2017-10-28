import PropTypes from 'prop-types'
import React, { Component } from 'react'

export default class ModalCover extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  }

  render () {
    const { isOpen, onClick } = this.props

    return (
      isOpen &&

      <div
        onClick={onClick}
        className='edit-header--controls__bg'
      />
    )
  }
}
