import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { DropDownList } from 'client/components/drop_down/drop_down_list'
import { AdminAppearances } from './components/appearances'
import { AdminFeaturing } from './components/featuring'
import AdminArticle from './components/article'
import AdminSponsor from './components/sponsor'
import AdminSuperArticle from './components/super_article'
import AdminTags from './components/tags'
import AdminVerticalsTags from './components/verticals_tags'

export class EditAdmin extends Component {
  static propTypes = {
    channel: PropTypes.object
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

          <AdminArticle />

          <AdminFeaturing />

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

const mapStateToProps = (state) => ({
  channel: state.app.channel
})

export default connect(
  mapStateToProps
)(EditAdmin)
