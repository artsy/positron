import { Box } from "@artsy/palette"
import { Input } from "@artsy/reaction/dist/Components/Input"
import { CharacterLimit } from "client/components/character_limit"
import { FormLabel } from "client/components/form_label"
import React from "react"
import { CampaignProps } from "../campaign"

export const CanvasText: React.SFC<CampaignProps> = props => {
  const { campaign, index, onChange } = props
  const { canvas } = campaign

  return (
    <div>
      <Box pb={4}>
        {campaign.canvas.layout === "overlay" ? (
          <CharacterLimit
            type="textarea"
            label="Body"
            placeholder="Body"
            defaultValue={canvas.headline || ""}
            onChange={html => onChange("canvas.headline", html, index)}
            limit={70}
          />
        ) : (
          <CharacterLimit
            label="Headline"
            placeholder="Headline"
            defaultValue={canvas.headline || ""}
            onChange={value => onChange("canvas.headline", value, index)}
            limit={45}
          />
        )}
      </Box>
      <Box pb={4}>
        <CharacterLimit
          label="CTA Text"
          placeholder="Find Out More"
          defaultValue={canvas.link ? canvas.link.text : ""}
          onChange={value => onChange("canvas.link.text", value, index)}
          limit={25}
        />
      </Box>
      <Box pb={4}>
        <FormLabel>CTA Link</FormLabel>
        <Input
          block
          placeholder="http://example.com"
          defaultValue={canvas.link ? campaign.canvas.link.url : ""}
          onChange={e =>
            onChange("canvas.link.url", e.currentTarget.value, index)
          }
        />
      </Box>
      <Box pb={4}>
        <CharacterLimit
          type="textarea"
          label="Disclaimer (optional)"
          placeholder="Enter legal disclaimer here"
          defaultValue={canvas.disclaimer || ""}
          onChange={value => onChange("canvas.disclaimer", value, index)}
          limit={150}
        />
      </Box>
      <Box pb={4}>
        <FormLabel>Pixel Tracking Code (optional)</FormLabel>
        <Input
          block
          placeholder="Paste 3rd party script here"
          defaultValue={canvas.pixel_tracking_code || ""}
          onChange={e =>
            onChange("canvas.pixel_tracking_code", e.currentTarget.value, index)
          }
        />
      </Box>
    </div>
  )
}
