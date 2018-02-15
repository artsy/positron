import PropTypes from 'prop-types'
import React from 'react'
import { Embed } from '@artsy/reaction-force/dist/Components/Publishing'
import EmbedControls from './controls'

// Embed section supports external content via iframes

export const SectionEmbed = (props) => {
  const { editing, section } = props

  return (
    <section className='SectionEmbed'>
      {editing &&
        <EmbedControls section={section} />
      }

      {section.url
        ? <Embed section={section} />

        : <div className='edit-section__placeholder'>
            Add URL above
          </div>
      }
    </section>
  )
}

SectionEmbed.propTypes = {
  editing: PropTypes.bool,
  section: PropTypes.object
}
