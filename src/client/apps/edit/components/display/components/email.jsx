import PropTypes from "prop-types"
import React, { Component } from "react"
import { connect } from "react-redux"
import { clone } from "lodash"
import { Col, Row } from "react-styled-flexboxgrid"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { CharacterLimit } from "client/components/character_limit"
import { EmailPreview } from "./preview/email_preview"
import ImageUpload from "client/apps/edit/components/admin/components/image_upload.coffee"

export class DisplayEmail extends Component {
  static propTypes = {
    article: PropTypes.object,
    onChangeArticleAction: PropTypes.func,
  }

  onChange = (key, value) => {
    const { article, onChangeArticleAction } = this.props
    const emailMetadata = clone(article.email_metadata) || {}

    emailMetadata[key] = value
    onChangeArticleAction("email_metadata", emailMetadata)
  }

  render() {
    const { article, onChangeArticleAction } = this.props
    const emailMetadata = article.email_metadata || {}
    const { author, custom_text, headline, image_url } = emailMetadata

    return (
      <Row className="DisplayEmail">
        <Col xs={4}>
          <div className="field-group">
            <label>Email Image</label>
            <ImageUpload
              name="image_url"
              src={image_url || ""}
              onChange={this.onChange}
            />
          </div>

          <div className="field-group">
            <CharacterLimit
              label="Email Headline"
              limit={97}
              type="textarea"
              onChange={value => this.onChange("headline", value)}
              defaultValue={headline}
            />
          </div>

          <div className="field-group">
            <CharacterLimit
              label="Custom Text"
              limit={160}
              type="textarea"
              onChange={value => this.onChange("custom_text", value)}
              defaultValue={custom_text}
            />
          </div>

          <div className="field-group">
            <label>Author</label>
            <input
              onChange={e => this.onChange("author", e.target.value)}
              defaultValue={author || ""}
              className="bordered-input"
            />
          </div>
        </Col>

        <Col xs={8} className="col--right">
          <EmailPreview article={article} />
        </Col>

        <Col xs={12}>
          <div
            className="field-group flat-checkbox"
            onClick={() =>
              onChangeArticleAction("send_body", !article.send_body)
            }
          >
            <input readOnly type="checkbox" checked={article.send_body} />
            <label>Send Article Body To Sailthru</label>
          </div>
        </Col>
      </Row>
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
)(DisplayEmail)
