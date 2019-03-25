import React, { Component } from "react"
import { connect } from "react-redux"
import SectionList from "../section_list"
import SectionFooter from "../sections/footer"
// @ts-ignore - TODO: Remove index.styl
import SectionHeader from "../sections/header/index.tsx"
import SectionHero from "../sections/hero"

interface ChannelState {
  // TODO: replace with appState ChannelState when merged https://github.com/artsy/positron/pull/1945
  name?: string
  id: string
  type?: string
}

interface EditArticleProps {
  channel: ChannelState
}

export class EditArticle extends Component<EditArticleProps> {
  render() {
    const { channel } = this.props
    const hasHero = channel.type === "support" || channel.type === "team"

    return (
      <div>
        {hasHero && <SectionHero />}
        <SectionHeader />
        <SectionList />
        <SectionFooter />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  channel: state.app.channel,
})

export default connect(mapStateToProps)(EditArticle)
