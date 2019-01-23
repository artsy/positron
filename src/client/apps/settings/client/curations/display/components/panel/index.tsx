import { Box, Col, Row, Serif } from "@artsy/palette"
import { Input } from "@artsy/reaction/dist/Components/Input"
import { CharacterLimit } from "client/components/character_limit"
import { FormLabel } from "client/components/form_label"
import React from "react"
import { CampaignProps } from "../campaign"
import { PanelImages } from "./panel_images"

export const Panel: React.SFC<CampaignProps> = props => {
  const { campaign, index, onChange } = props
  const { panel } = campaign

  return (
    <div>
      <Serif size="6" py={4}>
        Panel
      </Serif>

      <Row key={index}>
        <Col lg pr={[0, 2]}>
          <Box pb={4}>
            <CharacterLimit
              label="Headline"
              placeholder="Headline"
              defaultValue={panel.headline || ""}
              onChange={value => onChange("panel.headline", value, index)}
              limit={25}
            />
          </Box>
          <Box pb={4}>
            <FormLabel>CTA link</FormLabel>
            <Input
              block
              placeholder="Find Out More"
              defaultValue={panel.link ? panel.link.url : ""}
              onChange={e =>
                onChange("panel.link.url", e.currentTarget.value, index)
              }
            />
          </Box>
          <Box pb={50}>
            <CharacterLimit
              type="textarea"
              label="Body"
              placeholder="Body"
              defaultValue={panel.body || ""}
              onChange={value => onChange("panel.body", value, index)}
              html
              limit={45}
            />
          </Box>
          <Box pb={4}>
            <FormLabel>Pixel Tracking Code (optional)</FormLabel>
            <Input
              block
              placeholder="Paste 3rd party script here"
              defaultValue={panel.pixel_tracking_code || ""}
              onChange={e =>
                onChange(
                  "panel.pixel_tracking_code",
                  e.currentTarget.value,
                  index
                )
              }
            />
          </Box>
        </Col>
        <Col lg pl={[0, 2]}>
          <PanelImages campaign={campaign} index={index} onChange={onChange} />
        </Col>
      </Row>
    </div>
  )
}
