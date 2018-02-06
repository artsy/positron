import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Paragraph from '../../../../../../components/rich_text/components/paragraph.coffee'
import { onChangeArticle } from 'client/actions/editActions'

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
              html={article.postscript || ''}
              layout={article.layout}
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
  article: state.edit.article,
  channel: state.app.channel
})

const mapDispatchToProps = {
  onChange: onChangeArticle
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionFooter)
