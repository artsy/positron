import PropTypes from "prop-types"
import React from "react"
import { SocialEmbed } from "@artsy/reaction/dist/Components/Publishing/Sections/SocialEmbed"
import SocialEmbedControls from "./controls"

// Embed section supports external content via iframes

export const SectionSocialEmbed = props => {
  const { editing, section } = props

  return (
    <section>
      {editing && <SocialEmbedControls />}

      {section.url ? (
        <SocialEmbed section={section} />
      ) : (
          <div className="edit-section__placeholder">
            Add Twitter or Instagram URL above
        </div>
        )}
    </section>
  )
}

SectionSocialEmbed.propTypes = {
  editing: PropTypes.bool,
  section: PropTypes.object,
}
