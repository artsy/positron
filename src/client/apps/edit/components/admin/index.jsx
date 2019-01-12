import { connect } from "react-redux"
import PropTypes from "prop-types"
import React, { Component } from "react"
import { DropDownList } from "client/components/drop_down/drop_down_list"
import { AdminAppearances } from "./components/appearances.tsx"
import { AdminFeaturing } from "./components/featuring/index.tsx"
import AdminArticle from "./components/article"
import AdminSponsor from "./components/sponsor"
import AdminSuperArticle from "./components/super_article"
import AdminTags from "./components/tags"
import AdminVerticalsTags from "./components/verticals_tags"

export class EditAdmin extends Component {
  static propTypes = {
    isNews: PropTypes.bool,
    isEditorial: PropTypes.bool,
  }

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
      <div className="EditAdmin">
        <DropDownList
          className="EditDisplay admin-form-container max-width-container"
          activeSections={[0, 1]}
          openMany
          sections={sections}
        >
          {isEditorial ? <AdminVerticalsTags /> : <AdminTags />}

          <AdminArticle />

          <AdminFeaturing />

          {!isNews && <AdminAppearances />}
          {isEditorial && !isNews && <AdminSuperArticle />}
          {isEditorial && !isNews && <AdminSponsor />}
        </DropDownList>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  isNews: state.edit.article.layout === "news",
  isEditorial: state.app.channel.type === "editorial",
})

export default connect(mapStateToProps)(EditAdmin)
