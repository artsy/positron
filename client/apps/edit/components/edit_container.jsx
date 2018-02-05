import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  changeSavedStatus,
  saveArticle,
  toggleSpinner
} from 'client/actions/editActions'
import { ErrorBoundary } from 'client/components/error/error_boundary'
import { EditAdmin } from './admin/index.jsx'
import { EditContent } from './content/index.jsx'
import { EditDisplay } from './display/index.jsx'
import EditHeader from './header/index.jsx'
import EditError from './error/index.jsx'

export class EditContainer extends Component {
  static propTypes = {
    activeView: PropTypes.string,
    article: PropTypes.object,
    changeSavedStatusAction: PropTypes.func,
    channel: PropTypes.object,
    error: PropTypes.object,
    isSaved: PropTypes.bool,
    saveArticleAction: PropTypes.func,
    toggleSpinnerAction: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.beforeUnload = this.beforeUnload.bind(this)
    this.setupBeforeUnload()

    props.article.sections.on(
      'change add remove reset',
      () => this.maybeSaveArticle()
    )
  }

  componentDidMount = () => {
    this.props.toggleSpinnerAction(false)
  }

  setupBeforeUnload = () => {
    const { article } = this.props

    if (article.get('published')) {
      article.on(
        'change',
        () => window.addEventListener('beforeunload', this.beforeUnload)
      )
    }
  }

  beforeUnload = (e) => {
    const { isSaved } = this.props
    // Custom messages are deprecated in most browsers
    // and will show default browser message instead
    if ($.active > 0) {
      e.returnValue = 'Your article is not finished saving.'
    } else if (!isSaved) {
      e.returnValue = 'You have unsaved changes, do you wish to continue?'
    } else {
      e.returnValue = undefined
    }
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

        <ErrorBoundary>
          <EditHeader
            {...this.props}
            beforeUnload={this.beforeUnload}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          {error && <EditError />}
          {this.getActiveView()}
        </ErrorBoundary>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  activeView: state.edit.activeView,
  channel: state.app.channel,
  error: state.edit.error,
  isSaved: state.edit.isSaved,
  lastUpdated: state.edit.lastUpdated
})

const mapDispatchToProps = {
  changeSavedStatusAction: changeSavedStatus,
  saveArticleAction: saveArticle,
  toggleSpinnerAction: toggleSpinner
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditContainer)
