import PropTypes from 'prop-types'
import React from 'react'

export default class DropDownItem extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isActive: props.active || false
    }
  }
  render () {
    const { active, index, onClick, title } = this.props
    return (
      <div className='drop-down'>
        <div className='drop-down__item' onClick={() => onClick(index)} data-active={active}>
          <h1>{title || 'Missing Title'}</h1>
          <div className='icon' />
        </div>
        {this.props.children}
      </div>
    )
  }
}

DropDownItem.propTypes = {
  active: PropTypes.bool,
  index: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.children
}
