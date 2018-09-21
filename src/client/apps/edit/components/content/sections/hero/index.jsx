import PropTypes from "prop-types"
import React, { Component } from "react"
import { connect } from "react-redux"
import SectionContainer from "../../section_container"
import SectionTool from "../../section_tool"
import { onChangeArticle } from "client/actions/edit/articleActions"

export class SectionHero extends Component {
  static propTypes = {
    article: PropTypes.object,
    onChangeArticleAction: PropTypes.func,
  }

  state = {
    editing: false,
  }

  onRemoveHero = () => {
    const { onChangeArticleAction } = this.props

    onChangeArticleAction("hero_section", null)
  }

  onSetEditing = editing => {
    const hasHero = this.finishedHero()

    if (!editing && !hasHero) {
      this.onRemoveHero()
    }
    this.setState({ editing })
  }

  finishedHero = () => {
    const { hero_section } = this.props.article
    const hasImages = hero_section.images && hero_section.images.length
    const hasVideo = hero_section.url

    return hasImages || hasVideo
  }

  render() {
    const { hero_section } = this.props.article
    const { editing } = this.state

    return (
      <div className="edit-section--hero">
        {hero_section ? (
          <SectionContainer
            onSetEditing={this.onSetEditing}
            isHero
            index={-1}
            editing={editing}
            onRemoveHero={this.onRemoveHero}
            section={hero_section}
          />
        ) : (
          <SectionTool
            section={hero_section}
            onSetEditing={editing => this.setState({ editing })}
            isHero
            index={-1}
            editing={editing}
          />
        )}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionHero)
