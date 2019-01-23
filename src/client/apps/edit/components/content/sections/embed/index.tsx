import { Embed } from "@artsy/reaction/dist/Components/Publishing/Sections/Embed"
import React from "react"
import EmbedControls from "./controls"

interface SectionEmbedProps {
  editing: boolean
  section: any
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
        <div className="edit-section__placeholder">Add URL above</div>
      )}
    </section>
  )
}
