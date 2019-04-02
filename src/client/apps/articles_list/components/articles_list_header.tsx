import { Box, color, Flex, Sans, Tab, Tabs } from "@artsy/palette"
import { Channel } from "client/typings"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"

const Header = styled(Box)`
  position: fixed;
  top: 0;
  left: 110px;
  right: 0;
  background-color: white;
  z-index: 10;
  border-bottom: 1px solid ${color("black10")};
`

const HeaderInner = styled(Flex)`
  ${Flex} {
    width: fit-content;
    border-bottom: none;
  }
`

interface ArticlesListProps {
  channel: Channel
  isPublished: boolean
  onChangeTabs: (isPublished: boolean) => void
}

export class ArticlesListHeader extends Component<ArticlesListProps> {
  render() {
    const { channel, onChangeTabs, isPublished } = this.props

    return (
      <Header pt={2}>
        <HeaderInner
          justifyContent="space-between"
          maxWidth="100%"
          width={960}
          px={3}
          mx="auto"
        >
          <Tabs
            initialTabIndex={isPublished ? 0 : 1}
            onChange={activeTab => {
              const isPublishedView = Boolean(
                activeTab && activeTab.tabIndex === 0
              )
              onChangeTabs(isPublishedView)
            }}
          >
            <Tab name="Published" />
            <Tab name="Drafts" />
          </Tabs>

          {channel && (
            <Sans size="3" weight="medium" display="block">{`${
              channel.name
            }`}</Sans>
          )}
        </HeaderInner>
      </Header>
    )
  }
}

const mapStateToProps = state => ({
  channel: state.app.channel,
})

export default connect(
  mapStateToProps,
  {}
)(ArticlesListHeader)
