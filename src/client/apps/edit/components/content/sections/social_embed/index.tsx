import { SocialEmbed } from "@artsy/reaction/dist/Components/Publishing/Sections/SocialEmbed"
import { SectionData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { EditSectionPlaceholder } from "client/components/edit_section_placeholder"
import React from "react"
import SocialEmbedControls from "./controls"

interface SectionSocialEmbedProps {
  editing: boolean
  section: SectionData
}

// Embed section supports twitter and instagram embeds
export const SectionSocialEmbed: React.SFC<SectionSocialEmbedProps> = ({
  editing,
  section,
}) => {
  return (
    <section>
      {editing && <SocialEmbedControls />}

      {section.url ? (
        <SocialEmbed section={section} />
      ) : (
        <EditSectionPlaceholder>
          Add Twitter or Instagram URL above
        </EditSectionPlaceholder>
      )}
    </section>
  )
}
