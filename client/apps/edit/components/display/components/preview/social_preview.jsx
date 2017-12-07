import PropTypes from 'prop-types'
import React from 'react'
import { crop } from '../../../../../../components/resizer/index.coffee'
import Icon from '@artsy/reaction-force/dist/Components/Icon'

export const SocialPreview = (props) => {
  const { article } = props

  return (
    <div className='edit-display__preview edit-display__prev-social'>
      <div className='edit-display__prev-social--post' />

      <div className='edit-display__prev-social--post'>
        <div className='edit-display__prev-social--identity'>
          <Icon name='logo-unscaled' color='#e5d5d5' />
          <div className='edit-display__prev-social--icontainer'>
            <div className='edit-display__prev-social--name'>
              Artsy
            </div>
            <div className='edit-display__prev-social--hours-ago'>
              1hr
            </div>
          </div>
        </div>

        <div className='edit-display__prev-social--content'>
          <div className='edit-display__prev-social--placeholder'>
          {article.getThumbnailImage('social_image')
            ? <img src={crop(article.getThumbnailImage('social_image'), {width: 300, height: 155})} />
            : <div className='edit-display__prev--x' />
          }
          </div>

          <div className='edit-display__prev-social--meta'>
            <div className='edit-display__prev-social--headline'>
              {article.getThumbnailTitle('social_title')}
            </div>
            <div className='edit-display__prev-social--description'>
              {article.getDescription('social_description')}
            </div>
            <div className='edit-display__prev-social--author'>
              Artsy.net
            </div>
          </div>
        </div>
      </div>

      <div className='edit-display__prev-social--post' />
    </div>
  )
}

SocialPreview.propTypes = {
  article: PropTypes.object
}
