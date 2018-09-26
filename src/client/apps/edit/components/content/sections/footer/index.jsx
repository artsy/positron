import PropTypes from "prop-types"
import React, { Component } from "react"
import { connect } from "react-redux"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { Text } from "@artsy/reaction/dist/Components/Publishing/Sections/Text"

export class SectionFooter extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    channel: PropTypes.object.isRequired,
    onChangeArticleAction: PropTypes.func.isRequired,
  }

  render() {
    const { article, channel, onChangeArticleAction } = this.props

    return (
      <div className="SectionFooter">
        {channel.type === "editorial" && (
          <div className="SectionFooter__postscript" data-layout="column_width">
            <Text layout={article.layout} postscript>
              <Paragraph
                allowedStyles={["b"]}
                hasLinks
                html={article.postscript || ""}
                onChange={html => onChangeArticleAction("postscript", html)}
                placeholder="Postscript (optional)"
              />
            </Text>
          </div>
        )}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
  channel: state.app.channel,
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionFooter)
