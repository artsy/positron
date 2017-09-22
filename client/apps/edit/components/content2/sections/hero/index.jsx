import React, { Component } from 'react'
import SectionContainer from '../../section_container/index.coffee'
import SectionTool from '../../section_tool/index.jsx'

export default class SectionHero extends Component {
  constructor (props) {
    super(props)

    this.state = {
      editing: false
    }
  }

  onSetEditing = (isEditing) => {
    if (isEditing) {
      this.setState({ editing: true })
    } else {
      this.setState({ editing: false })
    }
  }

  render() {
    const { article, channel, section, sections } = this.props
    const { editing } = this.state
    return (
      <div className='edit-section--hero'>
        { section.keys().length
          ?
          <SectionContainer
            article={article}
            section={section}
            sections={sections}
            onSetEditing={this.onSetEditing}
            isHero={true}
            index={-1}
            editing={editing}
            channel={channel} />
          :
          <SectionTool
            section={section}
            sections={sections}
            onSetEditing={this.onSetEditing}
            isHero={true}
            index={-1}
            editing={editing} />
        }
      </div>
    )
  }
}
