import { Box, color } from "@artsy/palette"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import { DropDownList } from "../../../../components/drop_down/drop_down_list"
import { AdminAppearances } from "./components/appearances"
import AdminArticle from "./components/article"
import { AdminFeaturing } from "./components/featuring"
import AdminSponsor from "./components/sponsor"
import AdminSuperArticle from "./components/super_article"
import AdminTags from "./components/tags"
import AdminVerticalsTags from "./components/verticals_tags"

interface EditAdminProps {
  isNews: boolean
  isEditorial: boolean
}

export class EditAdmin extends Component<EditAdminProps> {
  getSections = () => {
    const { isNews, isEditorial } = this.props

    if (isNews) {
      return [
        { title: "Verticals & Tagging" },
        { title: "Article" },
        { title: "Featuring" },
      ]
    } else if (isEditorial) {
      return [
        { title: "Verticals & Tagging" },
        { title: "Article" },
        { title: "Featuring" },
        { title: "Additional Appearances" },
        { title: "Super Article" },
        { title: "Sponsor" },
      ]
    } else {
      return [
        { title: "Tags" },
        { title: "Article" },
        { title: "Featuring" },
        { title: "Additional Appearances" },
      ]
    }
  }

  render() {
    const { isNews, isEditorial } = this.props
    const sections = this.getSections()

    return (
      <EditAdminContainer pb={95} pt={135} maxWidth={960} px={3} mx="auto">
        <DropDownList activeSections={[0, 1]} openMany sections={sections}>
          {isEditorial ? (
            <Box pt={4}>
              <AdminVerticalsTags />
            </Box>
          ) : (
            <Box pt={4}>
              <AdminTags />
            </Box>
          )}

          <Box pt={4}>
            <AdminArticle />
          </Box>

          <Box pt={4}>
            <AdminFeaturing />
          </Box>

          {!isNews && (
            <Box pt={4}>
              <AdminAppearances />
            </Box>
          )}

          {isEditorial &&
            !isNews && (
              <Box pt={4}>
                <AdminSuperArticle />
              </Box>
            )}

          {isEditorial &&
            !isNews && (
              <Box pt={4}>
                <AdminSponsor />
              </Box>
            )}
        </DropDownList>
      </EditAdminContainer>
    )
  }
}

const mapStateToProps = state => ({
  isNews: state.edit.article.layout === "news",
  isEditorial: state.app.channel.type === "editorial",
})

export default connect(mapStateToProps)(EditAdmin)

export const EditAdminContainer = styled(Box)`
  input[disabled],
  textarea[disabled] {
    background-color: ${color("black10")};
    cursor: no-drop;
  }
  .image-upload-form {
    margin-top: 10px;
  }
  .image-upload-form.disabled {
    background-color: ${color("black10")};
    h1,
    h2,
    span {
      color: ${color("black30")};
    }
  }
`
