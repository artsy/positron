import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { DropDownList } from 'client/components/drop_down/drop_down_list'

import AdminArticle from './article/index.coffee'
import AdminFeaturing from './featuring/index.coffee'
import AdminSuperArticle from './components/super_article'
import AdminAppearances from './components/appearances'
import AdminSponsor from './components/sponsor'
import AdminTags from './components/tags'
import AdminVerticalsTags from './components/verticals_tags'

export class EditAdmin extends Component {
  static propTypes = {
    article: PropTypes.object,
    channel: PropTypes.object,
    onChange: PropTypes.func
  }

  componentWillMount = () => {
    const { article } = this.props
    article.fetchFeatured()
    article.fetchMentioned()
  }

  getSections = () => {
    const { channel } = this.props
    const sections = [
      {title: 'Tags'},
      {title: 'Article'},
      {title: 'Featuring'},
      {title: 'Additional Appearances'}
    ]

    if (channel.type === 'editorial') {
      sections.push({title: 'Super Article'})
      sections.push({title: 'Sponsor'})
      sections[0].title = 'Verticals & Tagging'
    }
    return sections
  }

  render () {
    const { channel } = this.props
    const sections = this.getSections()
    const isEditorial = channel.type === 'editorial'

    return (
      <div className='EditAdmin'>
        <DropDownList
          className='EditDisplay admin-form-container max-width-container'
          activeSections={[0, 1]}
          openMany
          sections={sections}
        >

          {isEditorial
            ? <AdminVerticalsTags />
            : <AdminTags />
          }

          <AdminArticle {...this.props} />

          <AdminFeaturing {...this.props} />

          <AdminAppearances />

          {isEditorial &&
            <AdminSuperArticle />
          }
          {isEditorial &&
            <AdminSponsor />
          }
        </DropDownList>
      </div>
    )
  }
}
