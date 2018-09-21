import PropTypes from "prop-types"
import React from "react"
import { getArticleByline } from "../../../../../../models/article.js"
import { crop } from "../../../../../../components/resizer/index.coffee"

export const EmailPreview = props => {
  const { article } = props

  const email_metadata = article.email_metadata || {}
  const { author, headline, image_url } = email_metadata
  const image = image_url || article.thumbnail_image

  return (
    <div className="edit-display__preview edit-display__prev-email">
      <div className="edit-display__prev-email--placeholder">
        {image ? (
          <img src={crop(image, { width: 320, height: 188 })} />
        ) : (
          <div className="edit-display__prev--x" />
        )}
      </div>
      <div className="edit-display__prev-email--headline">
        {headline || article.thumbnail_title}
      </div>
      <div className="edit-display__prev-email--author">
        {`By ${author || getArticleByline(article)}`}
      </div>
      <div className="edit-display__prev-email--placeholder" />
    </div>
  )
}

EmailPreview.propTypes = {
  article: PropTypes.object,
}
