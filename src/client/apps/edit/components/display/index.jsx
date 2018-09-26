import { connect } from "react-redux"
import styled from "styled-components"
import PropTypes from "prop-types"
import React, { Component } from "react"
import { DropDownList } from "client/components/drop_down/drop_down_list"
import DisplayEmail from "./components/email"
import DisplayMagazine from "./components/magazine"
import DisplayPartner from "./components/partner"
import DisplaySearch from "./components/search"
import DisplaySocial from "./components/social"

export class EditDisplay extends Component {
  static propTypes = {
    channel: PropTypes.object,
  }

  render() {
    const { channel } = this.props
    const sections = [
      { title: "Magazine" },
      { title: "Social" },
      { title: "Search" },
      { title: "Email" },
    ]

    const isPartner = channel.type === "partner"

    return (
      <EditArticleContainer
        className="EditDisplay"
        margin={isPartner ? 55 : 95}
      >
        {isPartner ? (
          <DisplayPartner />
        ) : (
          <DropDownList
            className="admin-form-container max-width-container"
            activeSections={[0]}
            openMany
            sections={sections}
          >
            <DisplayMagazine />
            <DisplaySocial />
            <DisplaySearch />
            <DisplayEmail />
          </DropDownList>
        )}
      </EditArticleContainer>
    )
  }
}

// TODO: Move to parent and use on admin too
const EditArticleContainer = styled.div`
  margin-top: ${props => `${props.margin}px`};
`
const mapStateToProps = state => ({
  channel: state.app.channel,
})

export default connect(mapStateToProps)(EditDisplay)
