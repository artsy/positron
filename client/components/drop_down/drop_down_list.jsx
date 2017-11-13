import PropTypes from 'prop-types'
import React from 'react'
import { without } from 'lodash'
import DropDownItem from './index.jsx'

export class DropDownList extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      activeSections: [],
      activeSection: null
    }
  }

  setActiveSections = (index) => {
    const { activeSections } = this.state
    let sections = activeSections

    if (activeSections.includes(index)) {
      sections = without(activeSections, index)
    } else {
      sections.push(index)
    }
    this.setState({ activeSections: sections })
  }

  setActiveSection = (index) => {
    index = index === this.state.activeSection ? null : index
    this.setState({ activeSection: index })
  }

  isActive = (index) => {
    const { openMany } = this.props
    const { activeSection, activeSections } = this.state

    if (openMany) {
      return activeSections.includes(index)
    } else {
      return index === activeSection
    }
  }

  render () {
    const { children, openMany, sections } = this.props
    const onOpen = openMany ? this.setActiveSections : this.setActiveSection

    return (
      <div className='DropDownList'>
        {children.map((child, i) =>
          <DropDownItem
            title={sections[i].title || sections[i].name}
            active={this.isActive(i)}
            index={i}
            onClick={() => onOpen(i)}
          >
            {child}
          </DropDownItem>
        )}
      </div>
    )
  }
}

DropDownList.propTypes = {
  children: PropTypes.any,
  openMany: PropTypes.bool,
  sections: PropTypes.array
}
