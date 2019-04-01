import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import {
  startEditingArticle,
  stopEditingArticle,
  toggleSpinner,
} from "client/actions/edit/editActions"
import { ErrorBoundary } from "client/components/error/error_boundary"
import {
  Channel,
  EditActiveView,
  ErrorMessage,
  LockoutData,
  LockoutDataUser,
} from "client/typings"
import { once } from "lodash"
import React, { Component } from "react"
import { hot } from "react-hot-loader"
import { connect } from "react-redux"
import styled from "styled-components"
import EditAdmin from "./admin"
import EditContent from "./content"
import EditDisplay from "./display"
import EditError from "./error"
import EditHeader from "./header"
import { MessageModal } from "./message"
import Yoast from "./yoast"

const INACTIVITY_TIMEOUT = 600 * 1000

interface EditContainerProps {
  activeView: EditActiveView
  article: ArticleData
  channel: Channel
  error: ErrorMessage
  isSaved: boolean
  startEditingArticleAction: (args: LockoutData) => void
  stopEditingArticleAction: (args: LockoutData) => void
  user: LockoutDataUser
  currentSession: any // TODO: type lockout sessions
  toggleSpinnerAction: (isActive: boolean) => void
}

interface EditContainerState {
  isOtherUserInSession: boolean
  inactivityPeriodEntered: boolean
  shouldShowModal: boolean
  sentStopEditingEvent: boolean
}

export class EditContainer extends Component<
  EditContainerProps,
  EditContainerState
> {
  private inactivityTimer

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
    // @ts-ignore
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
    const { error, currentSession, channel } = this.props
    const {
      isOtherUserInSession,
      inactivityPeriodEntered,
      shouldShowModal,
    } = this.state

    const modalType = isOtherUserInSession
      ? "locked"
      : inactivityPeriodEntered
        ? "timeout"
        : ""

    return (
      <EditWrapper>
        <ErrorBoundary>
          <FixedHeader>
            <EditHeader beforeUnload={this.beforeUnload} />
            {channel.type !== "partner" && <Yoast />}
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
      </EditWrapper>
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
  z-index: 7;
`

export const EditWrapper = styled.div`
  div[class*="caption__CaptionContainer-"] {
    > div {
      min-width: 100%;
    }
    a {
      background-size: 1px 1px;
    }
  }
`
