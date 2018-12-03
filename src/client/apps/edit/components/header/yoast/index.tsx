import { Box, color, Flex, Separator, space } from "@artsy/palette"
import { Input } from "@artsy/reaction/dist/Components/Input"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { StaticCollapse } from "@artsy/reaction/dist/Components/StaticCollapse"
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
    isOpen: false,
  }

  toggleDrawer = () => {
    this.setState({ isOpen: !this.state.isOpen })
  }
  render() {
    const { isOpen } = this.state
    return (
      <Box>
        <YoastContainer onClick={this.toggleDrawer}>
          Seo Analysis - <span>Set Target Keyword</span>
        </YoastContainer>
        <StaticCollapse open={isOpen}>
          <Drawer>
            <Box width={[1, 1 / 3]}>
              <Input
                title="Target Keyword"
                placeholder="A searchable term for this content"
              />
            </Box>
            <Flex width={[1, 2 / 3]}>
              <Separator width={2} />
              kjldsfkjsdfl;sfl;ef
            </Flex>
          </Drawer>
        </StaticCollapse>
      </Box>
    )
  }
}

export const YoastContainer = styled(Box)`
  background-color: ${color("black5")};
  padding: 0 20px;
  height: ${space(4)}px;
`

export const Drawer = styled(Flex)`
  background-color: ${color("white100")};
  padding: 0 20px;
`
