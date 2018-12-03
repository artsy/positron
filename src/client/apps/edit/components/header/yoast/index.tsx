import { color, Flex, space } from "@artsy/palette"
import { StaticCollapse } from "@artsy/reaction/dist/Components"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import React, { Component } from "react"
import styled from "styled-components"

// yoastSnippetPreview = require( "yoastseo" ).SnippetPreview
// yoastApp = require( "yoastseo" ).App

interface Props {
  article: ArticleData
}

interface State {
  isOpen: boolean
}

export class Yoast extends Component<Props, State> {
  state = {
    isOpen: true,
  }

  toggleDrawer = () => {
    this.setState({ isOpen: !this.state.isOpen })
  }
  render() {
    const { isOpen } = this.state
    return (
      <YoastContainer>
        <Flex onClick={this.toggleDrawer}>
          Seo Analysis - <span>Set Target Keyword</span>
        </Flex>
        <StaticCollapse open={isOpen}>
          <Drawer>HELLO</Drawer>
        </StaticCollapse>
      </YoastContainer>
    )
  }
}

export const YoastContainer = styled(Flex)`
  background-color: ${color("black5")};
  padding: 0 20px;
  height: 40px;
`

export const Drawer = styled(Flex)`
  background-color: ${color("white100")};
  padding: 0 20px;
  height: ${space(4)}px;
`
