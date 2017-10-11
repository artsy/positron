import PropTypes from 'prop-types'
import React from 'react'
import Canvas from './canvas.jsx'

export default class CanvasContainer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      activeLayout: props.campaign.canvas.layout || 'overlay'
    }
  }

  setActiveLayout = (layout) => {
    this.setState({activeLayout: layout})
    this.props.onChange('canvas.layout', layout, this.props.index)
  }

  render () {
    const { campaign, index, onChange } = this.props
    return (
      <div className='display-admin--canvas'>
        <div className='display-admin__section-title'>Canvas</div>
        <div className='display-admin--canvas__layouts'>
          <button
            className='avant-garde-button'
            onClick={() => this.setActiveLayout('overlay')}
            data-active={this.state.activeLayout === 'overlay'}>
            Overlay
          </button>
          <button
            className='avant-garde-button'
            onClick={() => this.setActiveLayout('standard')}
            data-active={this.state.activeLayout === 'standard'}>
            Image/Video
          </button>
          <button
            className='avant-garde-button'
            onClick={() => this.setActiveLayout('slideshow')}
            data-active={this.state.activeLayout === 'slideshow'}>
            Slideshow
          </button>
          </div>
        <Canvas campaign={campaign} index={index} onChange={onChange} />
      </div>
    )
  }
}

CanvasContainer.propTypes = {
  campaign: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
}
