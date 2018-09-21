import moment from "moment"
import PropTypes from "prop-types"
import React from "react"

export const SearchPreview = props => {
  const { article, forceURL } = props
  const {
    description,
    published_at,
    scheduled_publish_at,
    search_description,
    search_title,
    slug,
    thumbnail_title,
  } = article

  const date = published_at || scheduled_publish_at || new Date()
  const body = description || search_description

  return (
    <div className="edit-display__preview edit-display__prev-search">
      {searchResult()}
      {searchResult()}

      <div className="edit-display__prev-search--result">
        <div className="edit-display__prev-search--headline">
          {search_title || thumbnail_title}
        </div>
        <div className="edit-display__prev-search--slug">
          {`${forceURL}/article/${slug}`}
        </div>
        <div className="edit-display__prev-search--dd">
          <span className="edit-display__prev-search--date">
            {moment(date).format("ll") + (body ? " - " : "")}
          </span>
          <span className="edit-display__prev-search--description">{body}</span>
        </div>
      </div>

      {searchResult()}
      {searchResult()}
    </div>
  )
}

const searchResult = () => {
  return (
    <div className="edit-display__prev-search--result">
      <div className="edit-display__prev-search--result-headline" />
      <div className="edit-display__prev-search--result-line" />
      <div className="edit-display__prev-search--result-line" />
      <div className="edit-display__prev-search--result-line" />
    </div>
  )
}

SearchPreview.propTypes = {
  article: PropTypes.object,
  forceURL: PropTypes.string,
}
