import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { DisplayEmail } from './components/email'
import { DisplayMagazine } from './components/magazine'
import { DisplayPartner } from './components/partner'
import { DisplaySearch } from './components/search'
import { DisplaySocial } from './components/social'
import { DropDownList } from 'client/components/drop_down/drop_down_list'

export class EditDisplay extends Component {
  static propTypes = {
    article: PropTypes.object,
    channel: PropTypes.object
  }

  onChange = (key, value) => {
    this.props.article.set(key, value)
    // TODO: save with redux actions
  }

  render () {
    const { article, channel } = this.props
    const sections = [
      {title: 'Magazine'},
      {title: 'Social'},
      {title: 'Search'},
      {title: 'Email'}
    ]

    if (channel.get('type') === 'partner') {
      return (
        <div className='EditDisplay'>
          <DisplayPartner
            article={article}
            onChange={this.onChange}
          />
        </div>
      )
    } else {
      return (
        <DropDownList
          className='EditDisplay admin-form-container'
          activeSections={[0]}
          openMany
          sections={sections}
        >
          <DisplayMagazine
            article={article}
            onChange={this.onChange}
          />
          <DisplaySocial
            article={article}
            onChange={this.onChange}
          />
          <DisplaySearch
            article={article}
            onChange={this.onChange}
          />
          <DisplayEmail
            article={article}
            onChange={this.onChange}
          />
        </DropDownList>
      )
    }
  }
}
