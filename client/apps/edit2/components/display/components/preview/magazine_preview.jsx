import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import { IconSocialEmail } from '@artsy/reaction-force/dist/Components/Publishing/Icon/IconSocialEmail'
import { IconSocialFacebook } from '@artsy/reaction-force/dist/Components/Publishing/Icon/IconSocialFacebook'
import { IconSocialTwitter } from '@artsy/reaction-force/dist/Components/Publishing/Icon/IconSocialTwitter'
import { getArticleByline } from 'client/models/article.js'
import { crop } from '../../../../../../components/resizer/index.coffee'

export const MagazinePreview = (props) => {
  const { article } = props
  const date = article.published ? article.published_at : new Date()

  return (
    <div className='edit-display__preview edit-display__prev-mag'>
      <div className='edit-display__prev-mag--left'>
        <div className='edit-display__prev-mag--date'>
          {moment(date).format('MMMM Do')}
        </div>
        <div className='edit-display__prev-mag--headline'>
          {article.thumbnail_title}
        </div>
        <div className='edit-display__prev-mag--byline'>
          {`By ${getArticleByline(article)}`}
        </div>
        <div className='edit-display__prev-mag--social'>
          <IconSocialEmail />
          <IconSocialFacebook />
          <IconSocialTwitter />
        </div>
      </div>

      <div className='edit-display__prev-mag--right'>
        <div className='edit-display__prev-mag--placeholder' />
        <div className='edit-display__prev-mag--placeholder'>
          {article.thumbnail_image
            ? <img src={crop(article.thumbnail_image, {width: 300, height: 200})} />
            : <div className='edit-display__prev--x' />
          }
        </div>
        <div className='edit-display__prev-mag--placeholder' />
      </div>
    </div>
  )
}

MagazinePreview.propTypes = {
  article: PropTypes.object
}
