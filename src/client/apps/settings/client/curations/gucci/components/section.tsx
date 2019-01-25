import { Box, Checkbox, Col, color, Flex, Row } from "@artsy/palette"
import { Input } from "@artsy/reaction/dist/Components/Input"
import { Metadata } from "client/apps/settings/client/curations/gucci/components/metadata"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { FormLabel } from "client/components/form_label"
import moment from "moment"
import React from "react"
import styled from "styled-components"
const ImageUpload = require("client/apps/edit/components/admin/components/image_upload.coffee")

export interface SectionAdminProps {
  section: any
  onChange: (key: string, val: any) => void
}

export const SectionAdmin: React.SFC<SectionAdminProps> = ({
  section,
  onChange,
}) => {
  return (
    <Box pb={95}>
      <Row>
        <Col lg={8} pr={2}>
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
            <RichTextAreaContainer>
              <Paragraph
                hasLinks
                html={section.about || ""}
                onChange={html => onChange("about", html)}
              />
            </RichTextAreaContainer>
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

        <Col lg={4} pl={2}>
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

export const RichTextAreaContainer = styled.div`
  border: 1px solid ${color("black10")};
  padding: 10px;
  margin-top: 10px;
  min-height: 8em;
`
