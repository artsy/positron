import PropTypes from 'prop-types'
import React from 'react'

export class DropDownItem extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isActive: props.active || false
    }
  }

  render () {
    const {
      active,
      children,
      index,
      onClick,
      title
    } = this.props

    return (
      <div className='DropDownItem' key={'DropDownItem-' + index}>
        <div
          className='DropDownItem__title'
          onClick={() => onClick(index)}
          data-active={active}
        >
          <h1 className={!title && 'placeholder'}>
            {title || 'Missing Title'}
          </h1>
          <div className='icon' />
        </div>
        {active &&
          <div className='DropDownItem__item'>
            {children}
          </div>
        }
      </div>
    )
  }
}

DropDownItem.propTypes = {
  active: PropTypes.bool,
  index: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.any
}
