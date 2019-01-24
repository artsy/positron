import { Embed } from "@artsy/reaction/dist/Components/Publishing/Sections/Embed"
import { SectionData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { EditSectionPlaceholder } from "client/components/edit_section_placeholder"
import React from "react"
import EmbedControls from "./controls"

interface SectionEmbedProps {
  editing: boolean
  section: SectionData
}

// Embed section supports external content via iframes
export const SectionEmbed: React.SFC<SectionEmbedProps> = ({
  editing,
  section,
}) => {
  return (
    <section>
      {editing && <EmbedControls section={section} />}

      {section.url ? (
        <Embed section={section} />
      ) : (
        <EditSectionPlaceholder>Add URL above</EditSectionPlaceholder>
      )}
    </section>
  )
}
