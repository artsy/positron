import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { DropDownList } from 'client/components/drop_down/drop_down_list'

import AdminArticle from './article/index.coffee'
import AdminFeaturing from './featuring/index.coffee'
import AdminTags from './verticals_tags/index.coffee'
import AdminSuperArticle from './super_article/index.coffee'
import AdminVerticalsTags from './verticals_tags/editorial.coffee'
import AdminAppearances from './appearances/index.coffee'

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

    if (channel.hasFeature('superArticle')) {
      sections.push({title: 'Super Article'})
    }
    if (channel.hasFeature('sponsor')) {
      sections.push({title: 'Sponsor'})
    }
    if (channel.isEditorial()) {
      sections[0].title = 'Verticals & Tagging'
    }
    return sections
  }

  render () {
    const { channel } = this.props
    const sections = this.getSections()

    return (
      <div className='EditAdmin'>
        <DropDownList
          className='EditDisplay admin-form-container max-width-container'
          activeSections={[0, 1]}
          openMany
          sections={sections}
        >

          {channel.isEditorial()
            ? <AdminVerticalsTags {...this.props} />
            : <AdminTags {...this.props} />
          }

          <AdminArticle {...this.props} />

          <AdminFeaturing {...this.props} />

          <AdminAppearances {...this.props} />

          {channel.hasFeature('superArticle') &&
            <AdminSuperArticle {...this.props} />
          }
          {channel.hasFeature('sponsor') &&
            <div>Sponsor</div>
          }
        </DropDownList>
      </div>
    )
  }
}
