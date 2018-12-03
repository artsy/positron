import PropTypes from "prop-types"
import React, { Component } from "react"
import { connect } from "react-redux"
import { once } from "lodash"
import { hot } from "react-hot-loader"
import {
  startEditingArticle,
  stopEditingArticle,
  toggleSpinner,
} from "client/actions/edit/editActions"
import { ErrorBoundary } from "client/components/error/error_boundary"
import EditAdmin from "./admin"
import EditContent from "./content"
import EditDisplay from "./display"
import EditError from "./error"
import EditHeader from "./header"
import { MessageModal } from "./message"
import { Yoast } from "./header/yoast"
import styled from "styled-components"

const INACTIVITY_TIMEOUT = 600 * 1000

export class EditContainer extends Component {
  static propTypes = {
    activeView: PropTypes.string,
    article: PropTypes.object,
    channel: PropTypes.object,
    error: PropTypes.object,
    isSaved: PropTypes.bool,
    startEditingArticleAction: PropTypes.func,
    stopEditingArticleAction: PropTypes.func,
    user: PropTypes.object,
    currentSession: PropTypes.object,
    toggleSpinnerAction: PropTypes.func,
  }

  constructor(props) {
    super(props)

    const session = props.currentSession
    const isCurrentUserEditing =
      props.user && session && props.user.id === session.user.id

    this.state = {
      isOtherUserInSession: !!props.currentSession && !isCurrentUserEditing,
      inactivityPeriodEntered: false,
      shouldShowModal: true,
      sentStopEditingEvent: false,
    }
  }

  componentDidMount() {
    const { article } = this.props

    if (article.id) {
      // wait for new articles to be saved before setup
      this.setupLockout()
      this.props.toggleSpinnerAction(false)
    }
  }

  componentWillReceiveProps = nextProps => {
    if (this.props.article !== nextProps.article) {
      const setupBeforeUnload = once(this.setupBeforeUnload)

      this.resetInactivityCounter()
      setupBeforeUnload()
    }
  }

  componentWillUnmount = () => {
    this.sendStopEditing()
    window.removeEventListener("beforeunload", this.sendStopEditing)
    clearTimeout(this.inactivityTimer)
  }

  setupBeforeUnload = () => {
    const { article } = this.props

    if (article.published) {
      window.addEventListener("beforeunload", this.beforeUnload)
    }
  }

  setupLockout = () => {
    const { article, channel, startEditingArticleAction, user } = this.props

    startEditingArticleAction({
      channel,
      user,
      article: article.id,
    })

    this.resetInactivityCounter()
    window.addEventListener("beforeunload", this.sendStopEditing)
  }

  beforeUnload = e => {
    const { isSaved } = this.props
    // Custom messages are deprecated in most browsers
    // and will show default browser message instead
    if ($.active > 0) {
      e.returnValue = "Your article is not finished saving."
    } else if (!isSaved) {
      e.returnValue = "You have unsaved changes, do you wish to continue?"
    } else {
      e.returnValue = undefined
    }
  }

  resetInactivityCounter = () => {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer)
    }
    this.inactivityTimer = setTimeout(
      this.setInactivityPeriod,
      INACTIVITY_TIMEOUT
    )
  }

  setInactivityPeriod = () => {
    this.setState({
      inactivityPeriodEntered: true,
    })
  }

  sendStopEditing = () => {
    if (this.state.sentStopEditingEvent) return

    const { article, channel, stopEditingArticleAction, user } = this.props
    stopEditingArticleAction({
      channel,
      article: article.id,
      user,
    })

    this.setState({
      sentStopEditingEvent: true,
    })
  }

  getActiveView = () => {
    const { activeView } = this.props

    switch (activeView) {
      case "admin":
        return <EditAdmin />
      case "content":
        return <EditContent />
      case "display":
        return <EditDisplay />
    }
  }

  modalDidClose = () => {
    this.setState({
      shouldShowModal: false,
    })
  }

  render() {
    const { error, currentSession } = this.props
    const {
      isOtherUserInSession,
      inactivityPeriodEntered,
      shouldShowModal,
    } = this.state

    let modalType = isOtherUserInSession
      ? "locked"
      : inactivityPeriodEntered
        ? "timeout"
        : ""

    return (
      <div className="EditContainer">
        <ErrorBoundary>
          <FixedHeader>
            <EditHeader beforeUnload={this.beforeUnload} />
            <Yoast />
          </FixedHeader>
        </ErrorBoundary>

        <ErrorBoundary>
          {error && <EditError />}
          {this.getActiveView()}
        </ErrorBoundary>

        {shouldShowModal &&
          modalType && (
            <MessageModal
              type={modalType}
              session={currentSession}
              onClose={this.modalDidClose}
              onTimerEnded={() => {
                document.location.assign("/")
              }}
            />
          )}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  activeView: state.edit.activeView,
  article: state.edit.article,
  channel: state.app.channel,
  error: state.edit.error,
  user: state.app.user,
  currentSession: state.edit.currentSession,
  isSaved: state.edit.isSaved,
})

const mapDispatchToProps = {
  startEditingArticleAction: startEditingArticle,
  stopEditingArticleAction: stopEditingArticle,
  toggleSpinnerAction: toggleSpinner,
}

export default hot(module)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(EditContainer)
)

export const FixedHeader = styled.div`
  position: fixed;
  top: 0;
  left: 110px;
  right: 0;
  background: white;
  z-index: 100;
`
