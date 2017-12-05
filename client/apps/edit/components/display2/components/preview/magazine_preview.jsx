import PropTypes from 'prop-types'
import React from 'react'
import { crop } from '../../../../../../components/resizer/index.coffee'
import { IconSocialEmail } from '@artsy/reaction-force/dist/Components/Publishing/Icon/IconSocialEmail'
import { IconSocialFacebook } from '@artsy/reaction-force/dist/Components/Publishing/Icon/IconSocialFacebook'
import { IconSocialTwitter } from '@artsy/reaction-force/dist/Components/Publishing/Icon/IconSocialTwitter'

export const MagazinePreview = (props) => {
  const { article } = props

  return (
    <div className='edit-display__preview edit-display__prev-mag'>
      <div className='edit-display__prev-mag--left'>
        <div className='edit-display__prev-mag--date'>
          {article.date('published_at').format('MMMM Do')}
        </div>
        <div className='edit-display__prev-mag--headline'>
          {article.get('thumbnail_title')}
        </div>
        <div className='edit-display__prev-mag--byline'>
          {`By ${article.getByline()}`}
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
          {article.get('thumbnail_image')
            ? <img src={crop(article.get('thumbnail_image'), {width: 300, height: 200})} />
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
