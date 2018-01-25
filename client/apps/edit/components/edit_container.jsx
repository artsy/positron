import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { changeSavedStatus, saveArticle } from 'client/actions/editActions'

import { EditAdmin } from './admin/index.jsx'
import { EditContent } from './content2/index.jsx'
import { EditDisplay } from './display/index.jsx'
import EditHeader from './header/index.jsx'
import EditError from './error/index.jsx'

class EditContainer extends Component {
  static propTypes = {
    activeView: PropTypes.string,
    article: PropTypes.object,
    changeSavedStatusAction: PropTypes.func,
    channel: PropTypes.object,
    error: PropTypes.object,
    saveArticleAction: PropTypes.func,
    user: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.state = {
      lastUpdated: null
    }

    props.article.sections.on(
      'change add remove reset',
      () => this.maybeSaveArticle()
    )
  }

  onChange = (key, value) => {
    const { article } = this.props

    article.set(key, value)
    this.maybeSaveArticle()
  }

  onChangeHero = (key, value) => {
    const { article } = this.props
    const hero = article.get('hero_section') || {}
    hero[key] = value
    this.onChange('hero_section', hero)
  }

  maybeSaveArticle = () => {
    const {
      article,
      changeSavedStatusAction,
      saveArticleAction
    } = this.props

    if (article.get('published')) {
      changeSavedStatusAction(article.attributes, false)
    } else {
      saveArticleAction(article)
    }
  }

  getActiveView = () => {
    const { activeView, article, channel } = this.props

    const props = {
      article,
      channel,
      onChange: this.onChange,
      onChangeHero: this.onChangeHero
    }

    switch (activeView) {
      case 'admin':
        return <EditAdmin {...props} />
      case 'content':
        return <EditContent {...props} />
      case 'display':
        return <EditDisplay {...props} />
    }
  }

  render () {
    const { error } = this.props

    return (
      <div className='EditContainer'>

        <EditHeader {...this.props} />

        {error && <EditError />}

        {this.getActiveView()}

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  activeView: state.edit.activeView,
  channel: state.app.channel,
  error: state.edit.error,
  lastUpdated: state.edit.lastUpdated
})

const mapDispatchToProps = {
  changeSavedStatusAction: changeSavedStatus,
  saveArticleAction: saveArticle
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditContainer)
