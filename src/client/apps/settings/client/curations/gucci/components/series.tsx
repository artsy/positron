import { Box, Col, Row } from "@artsy/palette"
import { Input } from "@artsy/reaction/dist/Components/Input"
import { Metadata } from "client/apps/settings/client/curations/gucci/components/metadata"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { FormLabel } from "client/components/form_label"
import React from "react"
import { RichTextAreaContainer } from "./section"
const ImageUpload = require("client/apps/edit/components/admin/components/image_upload.coffee")

export interface SeriesAdminProps {
  curation: any
  onChange: (key: string, val: any) => void
}

export const SeriesAdmin: React.SFC<SeriesAdminProps> = props => {
  const { curation, onChange } = props

  return (
    <>
      <Row>
        <Col lg={8} pr={2}>
          <Box pb={4}>
            <FormLabel>About the Series</FormLabel>
            <RichTextAreaContainer>
              <Paragraph
                hasLinks
                html={curation.get("about") || ""}
                onChange={html => onChange("about", html)}
              />
            </RichTextAreaContainer>
          </Box>
        </Col>

        <Col lg={4} pl={2}>
          <Box pb={4}>
            <FormLabel>Partner Logo: Header</FormLabel>
            <ImageUpload
              name="partner_logo_primary"
              src={curation.get("partner_logo_primary") || ""}
              onChange={(key, value) => onChange(key, value)}
            />
          </Box>

          <Box pb={4}>
            <FormLabel>Partner Logo: Footer</FormLabel>
            <ImageUpload
              name="partner_logo_secondary"
              src={curation.get("partner_logo_secondary") || ""}
              onChange={(key, value) => onChange(key, value)}
            />
          </Box>

          <Box pb={4}>
            <FormLabel>Partner Link Url</FormLabel>
            <Input
              block
              placeholder="http://example.com"
              defaultValue={curation.get("partner_link_url") || ""}
              onChange={e =>
                onChange("partner_link_url", e.currentTarget.value)
              }
            />
          </Box>
        </Col>
      </Row>
      <Metadata
        section={curation.toJSON()}
        onChange={(key, value) => onChange(key, value)}
      />
    </>
  )
}
