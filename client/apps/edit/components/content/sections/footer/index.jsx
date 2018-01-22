import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Paragraph from '../../../../../../components/rich_text/components/paragraph.coffee'

export class SectionFooter extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    channel: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  }

  render () {
    const { article, channel, onChange } = this.props

    return (
      <div className='SectionFooter'>

        {channel.type === 'editorial' &&
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
}

const mapStateToProps = (state) => ({
  channel: state.app.channel
})

export default connect(
  mapStateToProps
)(SectionFooter)
