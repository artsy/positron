import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Embed } from '@artsy/reaction-force/dist/Components/Publishing'
import { EmbedControls } from './controls'

// Embed section supports external content via iframes

export class SectionEmbed extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    editing: PropTypes.bool,
    section: PropTypes.object.isRequired
  }

  componentWillMount = () => {
    const { section } = this.props

    if (!section.get('layout')) {
      section.set('layout', 'column_width')
    }
  }

  componentWillUnmount = () => {
    const { section } = this.props

    if (!this.hasUrl()) {
      section.destroy()
    }
  }

  hasUrl = () => {
    const { section } = this.props

    return section.get('url') && section.get('url').length
  }

  render () {
    const {
      article,
      editing,
      section
    } = this.props

    return (
      <section className='SectionEmbed'>
        {editing &&
          <EmbedControls
            articleLayout={article.layout}
            section={section}
          />
        }
        {this.hasUrl()
          ? <Embed section={section.toJSON()} />

          : <div className='SectionEmbed__placeholder'>
              Add URL above
            </div>
        }
      </section>
    )
  }
}
