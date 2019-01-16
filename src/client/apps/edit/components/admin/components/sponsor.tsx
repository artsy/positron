import { Box, Flex } from "@artsy/palette"
import { Input } from "@artsy/reaction/dist/Components/Input"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { FormLabel } from "client/components/form_label"
import { clone } from "lodash"
import React, { Component } from "react"
import { connect } from "react-redux"
const ImageUpload = require("./image_upload.coffee")

interface AdminSponsorProps {
  article: ArticleData
  onChangeArticleAction: (key: string, val: any) => void
}

export class AdminSponsor extends Component<AdminSponsorProps> {
  onChange = (key, value) => {
    const { article, onChangeArticleAction } = this.props
    const sponsor = clone(article.sponsor) || {}

    sponsor[key] = value
    onChangeArticleAction("sponsor", sponsor)
  }

  render() {
    const { article } = this.props
    const sponsor = article.sponsor || {}

    return (
      <Box>
        <Flex justifyContent="space-between" flexDirection={["column", "row"]}>
          <Box width={["100%", "31%"]} pb={4}>
            <FormLabel>Partner Logo Light</FormLabel>
            <ImageUpload
              onChange={this.onChange}
              src={sponsor.partner_light_logo}
              name="partner_light_logo"
            />
          </Box>

          <Box width={["100%", "31%"]} pb={4}>
            <FormLabel>Partner Logo Dark</FormLabel>
            <ImageUpload
              onChange={this.onChange}
              src={sponsor.partner_dark_logo}
              name="partner_dark_logo"
            />
          </Box>

          <Box width={["100%", "31%"]} pb={4}>
            <FormLabel>Partner Logo Condensed</FormLabel>
            <ImageUpload
              onChange={this.onChange}
              src={sponsor.partner_condensed_logo}
              name="partner_condensed_logo"
            />
          </Box>
        </Flex>

        <Flex flexDirection={["column", "row"]}>
          <Box width={["100%", "50%"]} pb={4} pr={[0, 2]}>
            <FormLabel>Partner Link</FormLabel>
            <Input
              block
              defaultValue={sponsor.partner_logo_link}
              onChange={e =>
                this.onChange("partner_logo_link", e.currentTarget.value)
              }
              placeholder="http://example.com..."
            />
          </Box>

          <Box width={["100%", "50%"]} pb={4} pl={[0, 2]}>
            <FormLabel>Pixel Tracking Code</FormLabel>
            <Input
              block
              defaultValue={sponsor.pixel_tracking_code}
              onChange={e =>
                this.onChange("pixel_tracking_code", e.currentTarget.value)
              }
              placeholder="Paste pixel tracking code here"
            />
          </Box>
        </Flex>
      </Box>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminSponsor)
