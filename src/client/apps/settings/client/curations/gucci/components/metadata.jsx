import PropTypes from "prop-types"
import React from "react"
import { Box, Col, Row } from "@artsy/palette"
import { FormLabel } from "client/components/form_label"
import { Input } from "@artsy/reaction/dist/Components/Input"
const ImageUpload = require("client/apps/edit/components/admin/components/image_upload.coffee")

export const Metadata = props => {
  const { section, onChange } = props

  return (
    <Row justifyContent="space-between">
      <Col lg={8} pl={0}>
        <Box pb={4}>
          <FormLabel>Description</FormLabel>
          <textarea
            className="bordered-input"
            defaultValue={section.description || ""}
            onChange={e => onChange("description", e.target.value)}
          />
        </Box>
        <Box pb={3}>
          <FormLabel>Social Title</FormLabel>
          <Input
            block
            defaultValue={section.social_title || ""}
            onChange={e => onChange("social_title", e.currentTarget.value)}
          />
        </Box>
        <Box pb={3}>
          <FormLabel>Social Description</FormLabel>
          <textarea
            className="bordered-input"
            defaultValue={section.social_description || ""}
            onChange={e => onChange("social_description", e.target.value)}
          />
        </Box>
        <Box pb={3}>
          <FormLabel>Email Title</FormLabel>
          <Input
            block
            defaultValue={section.email_title || ""}
            onChange={e => onChange("email_title", e.currentTarget.value)}
          />
        </Box>
        <Box pb={3}>
          <FormLabel>Email Author</FormLabel>
          <Input
            block
            defaultValue={section.email_author || ""}
            onChange={e => onChange("email_author", e.currentTarget.value)}
          />
        </Box>
        <Box pb={3}>
          <FormLabel>Email Tags</FormLabel>
          <Input
            block
            defaultValue={section.email_tags || ""}
            onChange={e => onChange("email_tags", e.currentTarget.value)}
          />
        </Box>
        <Box pb={3}>
          <FormLabel>Keywords</FormLabel>
          <Input
            block
            defaultValue={section.keywords || ""}
            onChange={e => onChange("keywords", e.currentTarget.value)}
          />
        </Box>
      </Col>
      <Col lg={4}>
        <Box pb={3}>
          <FormLabel>Thumbnail Image</FormLabel>
          <ImageUpload
            name="thumbnail_image"
            src={section.thumbnail_image || ""}
            onChange={(key, value) => onChange(key, value)}
          />
        </Box>
        <Box pb={3}>
          <FormLabel>Social Image</FormLabel>
          <ImageUpload
            name="social_image"
            src={section.social_image || ""}
            onChange={(key, value) => onChange(key, value)}
          />
        </Box>
        <Box pb={3}>
          <FormLabel>Email Image</FormLabel>
          <ImageUpload
            name="email_image"
            src={section.email_image || ""}
            onChange={(key, value) => onChange(key, value)}
          />
        </Box>
      </Col>
    </Row>
  )
}

Metadata.propTypes = {
  section: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
}
