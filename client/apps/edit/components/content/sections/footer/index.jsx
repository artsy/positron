import PropTypes from 'prop-types'
import React from 'react'
import Paragraph from '../../../../../../components/rich_text/components/paragraph.coffee'

export const SectionFooter = (props) => {
  const { article, channel, onChange } = props

  return (
    <div className='SectionFooter'>

      {channel.hasFeature('postscript') &&
        <div
          className='SectionFooter__postscript'
          data-layout='column_width'
        >
          <Paragraph
            html={article.get('postscript') || ''}
            layout={article.get('layout')}
            linked
            onChange={(html) => onChange('postscript', html)}
            placeholder='Postscript (optional)'
            type='postscript'
          />
        </div>
      }

    </div>
  )
}

SectionFooter.propTypes = {
  article: PropTypes.object.isRequired,
  channel: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}
