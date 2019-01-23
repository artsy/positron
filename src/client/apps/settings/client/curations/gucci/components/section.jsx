import moment from "moment"
import PropTypes from "prop-types"
import React from "react"
import { Box, Checkbox, Col, Flex, Row } from "@artsy/palette"
import { FormLabel } from "client/components/form_label"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { Metadata } from "client/apps/settings/client/curations/gucci/components/metadata"
import { Input } from "@artsy/reaction/dist/Components/Input"
const ImageUpload = require("client/apps/edit/components/admin/components/image_upload.coffee")

export const SectionAdmin = props => {
  const { section, onChange } = props

  return (
    <Box pb={95} maxWidth={960} px={3} mx="auto">
      <Row>
        <Col lg={8} pl={0}>
          <Box pb={3}>
            <FormLabel>Featuring</FormLabel>
            <Input
              block
              placeholder="Start typing..."
              defaultValue={section.featuring || ""}
              onChange={e => onChange("featuring", e.currentTarget.value)}
            />
          </Box>

          <Box pb={4}>
            <FormLabel>About the Film</FormLabel>
            <Box className="bordered-input">
              <Paragraph
                hasLinks
                html={section.about || ""}
                onChange={html => onChange("about", html)}
              />
            </Box>
          </Box>

          <Flex pb={3}>
            <Box pr={3}>
              <FormLabel>Release Date</FormLabel>
              <Input
                block
                type="date"
                defaultValue={
                  section.release_date &&
                  moment(section.release_date).format("YYYY-MM-DD")
                }
                onChange={e =>
                  onChange(
                    "release_date",
                    moment(e.currentTarget.value).toISOString()
                  )
                }
              />
            </Box>

            <Checkbox
              onSelect={() => onChange("published", !section.published)}
              selected={section.published}
            >
              <FormLabel>Published</FormLabel>
            </Checkbox>
          </Flex>
        </Col>

        <Col lg={4}>
          <Box pb={3}>
            <FormLabel>Video Embed Url</FormLabel>
            <Input
              block
              placeholder="http://youtube.com/xxx"
              defaultValue={section.video_url || ""}
              onChange={e => onChange("video_url", e.currentTarget.value)}
            />
          </Box>
          <Box pb={3}>
            <FormLabel>Video Cover Image</FormLabel>
            <ImageUpload
              name="cover_image_url"
              src={section.cover_image_url || ""}
              onChange={(key, value) => onChange(key, value)}
            />
          </Box>
        </Col>
      </Row>
      <Metadata
        section={section}
        onChange={(key, value) => onChange(key, value)}
      />
    </Box>
  )
}

SectionAdmin.propTypes = {
  section: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
}
