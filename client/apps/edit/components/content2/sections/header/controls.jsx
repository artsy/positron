import React, { Component } from 'react'
import components from '@artsy/reaction-force/dist/components/publishing/index'

export default class FeatureHeaderControls extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isOpen: false
    }
  }

  toggleLayoutControls = () => {
    this.setState({isOpen: !this.state.isOpen})
  }

  onChangeLayout = (e) => {
    this.props.onChange('type', e.target.name)
  }

  renderLayouts() {
    if (this.state.isOpen) {
      return (
        <div className='edit-header--controls__layout'>
          <a
            onClick={this.onChangeLayout}
            name='text'>
            Default
          </a>
          <a
            onClick={this.onChangeLayout}
            name='fullscreen'>
            Overlay
          </a>
          <a
            onClick={this.onChangeLayout}
            name='split'>
            Split
          </a>
        </div>
      )
    }
  }

  renderModal() {
    if (this.state.isOpen) {
      return (
        <div
          onClick={this.toggleLayoutControls}
          className='edit-header--controls__bg'>
        </div>
      )
    }
  }

  render() {
    return (
      <div className='edit-header--controls'>
        {this.renderModal()}
        <div className='edit-header--controls__menu'>
          <div
            onClick={this.toggleLayoutControls}
            className='edit-header--controls-open'>Change Header</div>
            {this.renderLayouts()}
        </div>
      </div>
    )
  }
}
