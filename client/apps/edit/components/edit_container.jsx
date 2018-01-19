import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from 'client/actions/editActions'

import { EditAdmin } from './admin/index.jsx'
import { EditContent } from './content/index.jsx'
import { EditDisplay } from './display/index.jsx'
import EditHeader from './header/index.jsx'
import EditError from './error/index.jsx'

class EditContainer extends Component {
  static propTypes = {
    article: PropTypes.object,
    actions: PropTypes.object,
    channel: PropTypes.object,
    edit: PropTypes.object,
    error: PropTypes.object,
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
    const { article, actions } = this.props
    const { changeSavedStatus, saveArticle } = actions

    if (article.get('published')) {
      changeSavedStatus(false)
    } else {
      saveArticle(article)
    }
    this.setState({ lastUpdated: new Date() })
  }

  getActiveView = () => {
    const { article, channel, edit } = this.props
    const { activeView } = edit

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
    const { error } = this.props.edit

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
  channel: state.app.channel,
  edit: state.edit
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditContainer)
