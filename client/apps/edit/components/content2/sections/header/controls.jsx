import React, { Component } from 'react'
import components from '@artsy/reaction-force/dist/components/publishing/index'

const IconFullscreen = components.Icon.LayoutFullscreen
const IconSplit = components.Icon.LayoutSplit
const IconText = components.Icon.LayoutText

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
    const type = e.target.name ? e.target.name : $(e.target).closest('a').attr('name')
    this.props.onChange('type', type)
  }

  renderLayouts() {
    if (this.state.isOpen) {
      return (
        <div className='edit-header--controls__layout'>
          <a
            onClick={this.onChangeLayout}
            name='text'>
            <IconText />
            Default
          </a>
          <a
            onClick={this.onChangeLayout}
            name='fullscreen'>
            <IconFullscreen />
            Overlay
          </a>
          <a
            onClick={this.onChangeLayout}
            name='split'>
            <IconSplit />
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
