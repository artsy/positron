import PropTypes from "prop-types"
import React from "react"
import { Box, Col, Row } from "@artsy/palette"
import { FormLabel } from "client/components/form_label"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { Input } from "@artsy/reaction/dist/Components/Input"
import { Metadata } from "client/apps/settings/client/curations/gucci/components/metadata"
import ImageUpload from "client/apps/edit/components/admin/components/image_upload.coffee"

export const SeriesAdmin = props => {
  const { curation, onChange } = props

  return (
    <Box pb={95} maxWidth={960} px={3} mx="auto">
      <Row>
        <Col lg={8} pl={0}>
          <Box pb={4}>
            <FormLabel>About the Series</FormLabel>
            <Box className="bordered-input">
              <Paragraph
                hasLinks
                html={curation.get("about") || ""}
                onChange={html => onChange("about", html)}
              />
            </Box>
          </Box>
        </Col>

        <Col lg={4}>
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
    </Box>
  )
}

SeriesAdmin.propTypes = {
  curation: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
}
