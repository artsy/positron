import { connect } from "react-redux"
import PropTypes from "prop-types"
import React, { Component } from "react"
import SectionFooter from "../sections/footer"
import SectionHeader from "../sections/header"
import SectionHero from "../sections/hero"
import SectionList from "../section_list"

export class EditArticle extends Component {
  static propTypes = {
    channel: PropTypes.object.isRequired,
  }

  render() {
    const { channel } = this.props
    const hasHero = channel.type === "support" || channel.type === "team"

    return (
      <div className="EditArticle">
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
