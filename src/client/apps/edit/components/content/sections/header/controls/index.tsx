import { Box } from "@artsy/palette"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { onChangeHero } from "client/actions/edit/sectionActions"
import { ModalBackground } from "client/components/ModalBackground"
import React, { Component } from "react"
import { connect } from "react-redux"
import { LayoutControls } from "./LayoutControls"
import { VideoControls } from "./VideoControls"

interface HeaderControlsProps {
  article: ArticleData
  onChangeHeroAction: (key: any, val?: any) => void
  onProgress: (progress: number) => void
}

interface HeaderControlsState {
  isLayoutOpen: boolean
  isVideoOpen: boolean
}

export class HeaderControls extends Component<
  HeaderControlsProps,
  HeaderControlsState
> {
  state = {
    isLayoutOpen: false,
    isVideoOpen: false,
  }

  componentWillMount() {
    const { article, onChangeHeroAction } = this.props

    if (!article.hero_section) {
      onChangeHeroAction("type", "text")
    }
  }

  toggleControls = (controlType: "layout" | "video" | "close") => {
    const { isLayoutOpen, isVideoOpen } = this.state

    switch (controlType) {
      case "layout": {
        return this.setState({
          isLayoutOpen: !isLayoutOpen,
          isVideoOpen: false,
        })
      }
      case "video": {
        return this.setState({
          isVideoOpen: !isVideoOpen,
          isLayoutOpen: false,
        })
      }
      case "close": {
        return this.setState({
          isVideoOpen: false,
          isLayoutOpen: false,
        })
      }
    }
  }

  render() {
    const { isLayoutOpen, isVideoOpen } = this.state
    const { article, onChangeHeroAction, onProgress } = this.props

    const hero = article.hero_section || {}
    const isModalOpen = isLayoutOpen || isVideoOpen
    const isBasicHero = hero.type === "basic"

    return (
      <Box mb={1}>
        {isModalOpen && (
          <ModalBackground onClick={() => this.toggleControls("close")} />
        )}
        {isBasicHero && (
          <VideoControls
            article={article}
            isOpen={isVideoOpen}
            onChange={onChangeHeroAction}
            onProgress={onProgress}
            onClick={() => this.toggleControls("video")}
          />
        )}
        <LayoutControls
          hero={hero}
          isOpen={isLayoutOpen}
          onChange={onChangeHeroAction}
          onClick={() => this.toggleControls("layout")}
        />
      </Box>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
})

const mapDispatchToProps = {
  onChangeHeroAction: onChangeHero,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderControls)
