import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  changeSavedStatus,
  saveArticle,
  startEditingArticle,
  stopEditingArticle,
  updateArticle
} from 'client/actions/editActions'

import { EditAdmin } from './admin/index.jsx'
import { EditContent } from './content/index.jsx'
import { EditDisplay } from './display/index.jsx'
import EditHeader from './header/index.jsx'
import EditError from './error/index.jsx'

import { MessageModal } from './message'

class EditContainer extends Component {
  static propTypes = {
    activeView: PropTypes.string,
    article: PropTypes.object,
    changeSavedStatusAction: PropTypes.func,
    channel: PropTypes.object,
    error: PropTypes.object,
    saveArticleAction: PropTypes.func,
    startEditingArticleAction: PropTypes.func,
    stopEditingArticleAction: PropTypes.func,
    updateArticleAction: PropTypes.func,
    user: PropTypes.object,
    currentSession: PropTypes.object
  }

  constructor (props) {
    super(props)

    const session = props.currentSession
    const isCurrentUserEditing = props.user && session && props.user.id === session.user.id

    this.state = {
      lastUpdated: null,
      isOtherUserInSession: !!props.currentSession && !isCurrentUserEditing,
      inactivityPeriodEntered: false,
      shouldShowModal: true
    }

    props.article.sections.on(
      'change add remove reset',
      () => this.maybeSaveArticle()
    )
  }

  componentDidMount () {
    const { startEditingArticleAction, user } = this.props
    startEditingArticleAction({
      user,
      article: this.props.article.id
    })

    window.addEventListener('beforeunload', this.sendStopEditing)
  }

  componentWillUnmount () {
    this.sendStopEditing()
    window.removeEventListener('beforeunload', this.sendStopEditing)
  }

  onChange = (key, value) => {
    const { article, updateArticleAction } = this.props

    article.set(key, value)
    updateArticleAction({
      article: article.id
    })
    this.maybeSaveArticle()
  }

  onChangeHero = (key, value) => {
    const { article } = this.props
    const hero = article.get('hero_section') || {}
    hero[key] = value
    this.onChange('hero_section', hero)
  }

  sendStopEditing = () => {
    const { article, stopEditingArticleAction } = this.props
    stopEditingArticleAction({
      article: article.id
    })
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

  modalDidClose = () => {
    this.setState({
      shouldShowModal: false
    })
  }

  render () {
    const { error, currentSession } = this.props
    const { isOtherUserInSession, inactivityPeriodEntered, shouldShowModal } = this.state

    let modalType = isOtherUserInSession ? 'locked' : (inactivityPeriodEntered ? 'timeout' : '')

    return (
      <div className='EditContainer'>
        <EditHeader {...this.props} />
        {error && <EditError />}
        {this.getActiveView()}
        {shouldShowModal && modalType && <MessageModal type={modalType} session={currentSession} onClose={this.modalDidClose} />}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  activeView: state.edit.activeView,
  channel: state.app.channel,
  error: state.edit.error,
  lastUpdated: state.edit.lastUpdated,
  user: state.app.user,
  currentSession: state.edit.currentSession
})

const mapDispatchToProps = {
  changeSavedStatusAction: changeSavedStatus,
  saveArticleAction: saveArticle,
  startEditingArticleAction: startEditingArticle,
  stopEditingArticleAction: stopEditingArticle,
  updateArticleAction: updateArticle
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditContainer)
