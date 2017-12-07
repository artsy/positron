import PropTypes from 'prop-types'
import React from 'react'

export const SearchPreview = (props) => {
  const { article } = props

  return (
    <div className='edit-display__preview edit-display__prev-search'>
      {searchResult()}
      {searchResult()}
      <div className='edit-display__prev-search--result'>
        <div className='edit-display__prev-search--headline'>
          {article.getThumbnailTitle('search_title')}
        </div>
        <div className='edit-display__prev-search--slug'>
          {article.getFullSlug()}
        </div>
        <div className='edit-display__prev-search--dd'>
          <div className='edit-display__prev-search--date'>
            {article.date('published_at').format('ll') + ' - '}
          </div>
          <div className='edit-display__prev-search--description'>
            {article.getDescription('search_description')}
          </div>
        </div>
      </div>
      {searchResult()}
      {searchResult()}
    </div>
  )
}

const searchResult = () => {
  return (
    <div className='edit-display__prev-search--result'>
      <div className='edit-display__prev-search--result-headline' />
      <div className='edit-display__prev-search--result-line' />
      <div className='edit-display__prev-search--result-line' />
      <div className='edit-display__prev-search--result-line' />
    </div>
  )
}

SearchPreview.propTypes = {
  article: PropTypes.object
}
