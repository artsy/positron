import { Box, color, Flex, space } from "@artsy/palette"
import { avantgarde } from "@artsy/reaction/dist/Assets/Fonts"
import Icon from "@artsy/reaction/dist/Components/Icon"
import {
  Input,
  StyledInput,
  Title,
} from "@artsy/reaction/dist/Components/Input"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { StaticCollapse } from "@artsy/reaction/dist/Components/StaticCollapse"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import {
  App as YoastApp,
  SnippetPreview as YoastSnippetPreview,
} from "yoastseo"
import { setYoastKeyword } from "../../../../../actions/edit/editActions.js"

interface Props {
  article: ArticleData
  yoastKeyword: string
  setYoastKeywordAction: (e: any) => void
}

interface State {
  isOpen: boolean
  issueCount: number
}

export class Yoast extends Component<Props, State> {
  private snippetPreview: YoastSnippetPreview

  constructor(props) {
    super(props)

    this.state = {
      isOpen: false,
      issueCount: 0,
    }
  }

  componentDidMount() {
    this.snippetPreview = new YoastSnippetPreview({
      targetElement: document.getElementById("yoast-snippet"),
    })
    const app = new YoastApp({
      snippetPreview: this.snippetPreview,
      targets: {
        output: "yoast-output",
      },
      callbacks: {
        getData: () => {
          return {
            keyword: this.props.yoastKeyword,
            text: this.getBodyText(),
          }
        },

        saveScores: () => {
          this.setState({
            issueCount: document.querySelectorAll("#yoast-output .bad").length,
          })
        },
      },
    })
    app.refresh()
    this.resetSnippet()
  }

  setSnippetFields = () => {
    const formTitle = document.getElementById(
      "snippet-editor-title"
    ) as HTMLInputElement
    const formDescription = document.getElementById(
      "snippet-editor-meta-description"
    )

    if (formTitle) {
      formTitle.value = this.getSeoTitle()
    }

    if (formDescription) {
      formDescription.innerText = this.getSeoDescription()
    }
  }

  getSeoTitle = () => {
    const {
      article: { search_title, thumbnail_title, title },
    } = this.props
    return search_title || thumbnail_title || title || ""
  }

  getSeoDescription = () => {
    const {
      article: { description, search_description },
    } = this.props
    return search_description || description || ""
  }

  getBodyText = () => {
    const {
      article: { lead_paragraph, sections },
    } = this.props
    const fullText: string[] = []
    if (lead_paragraph && lead_paragraph.length) {
      fullText.push(lead_paragraph)
    }

    sections &&
      sections.map(section => {
        if (section.type === "text" && section.body) {
          fullText.push(section.body)
        }
      })

    return fullText.join()
  }

  toggleDrawer = () => {
    this.setState({ isOpen: !this.state.isOpen })
  }

  onKeywordChange = e => {
    this.props.setYoastKeywordAction(e.target.value)
    this.resetSnippet()
  }

  resetSnippet = () => {
    this.setSnippetFields()
    this.snippetPreview.changedInput()
  }

  keywordIsBlank = () => {
    const { yoastKeyword } = this.props
    if (!yoastKeyword || (yoastKeyword && yoastKeyword.trim().length < 1)) {
      return true
    } else {
      return false
    }
  }

  generateResolveMessage = () => {
    const issueCount: number = document.querySelectorAll("#yoast-output .bad")
      .length
    // const { issueCount } = this.state

    if (this.keywordIsBlank()) {
      return " Set Target Keyword"
    } else if (issueCount && issueCount > 0) {
      return `${issueCount} Unresolved Issue${issueCount > 1 ? "s" : ""}`
    } else {
      return " Resolved"
    }
  }

  render() {
    const { isOpen } = this.state
    const { yoastKeyword } = this.props
    return (
      <Box>
        <YoastContainer onClick={this.toggleDrawer}>
          Seo Analysis —
          <ResolveMessage
            color={
              this.generateResolveMessage() !== " Resolved"
                ? color("red100")
                : color("green100")
            }
          >
            {this.generateResolveMessage()}
          </ResolveMessage>
          <CloseIcon
            rotation={isOpen ? 45 : 0}
            name="follow-circle"
            width="10px"
            height="10px"
            color="black"
            title="plus-small"
          />
        </YoastContainer>
        <StaticCollapse open={isOpen}>
          <Drawer>
            <YoastInput width={[1, 1 / 3]}>
              <Input
                onChange={this.onKeywordChange}
                id="focus-keyword"
                title="Target Keyword"
                placeholder="A searchable term for this content"
                value={yoastKeyword}
              />
            </YoastInput>
            <YoastOutput hidden={this.keywordIsBlank()} width={[1, 2 / 3]}>
              <YoastSnippet hidden id="yoast-snippet" />
              <div id="yoast-output" />
            </YoastOutput>
          </Drawer>
        </StaticCollapse>
      </Box>
    )
  }
}

export const YoastSnippet = styled(Box)``

export const YoastContainer = styled(Flex)`
  background-color: ${color("black5")};
  padding: 0 ${space(2)}px;
  height: ${space(4)}px;
  border-bottom: 1px solid ${color("black10")};
  font-size: 15px;
  align-items: center;
`
const Drawer = styled(Flex)`
  background-color: ${color("white100")};
  padding: 30px;
  border-bottom: 1px solid ${color("black10")};
`
export const ResolveMessage = styled(Box)`
  display: inline;
  margin-left: 5px;
`
const CloseIcon = styled(Icon).attrs<{ rotation: number }>({})`
  transform: rotate(${props => props.rotation}deg);
  transition: all 0.25s;
  position: absolute;
  right: 15px;
  font-size: 32px;
`

const YoastInput = styled(Box)`
  max-width: 360px;
  ${Title} {
    margin-bottom: 2px;
    ${avantgarde("s11")};
  }

  ${StyledInput} {
    min-width: 300px;
  }
`
export const YoastOutput = styled(Box)`
  border-left: 1px solid ${color("black10")};
  padding-left: 30px;
`

const mapStateToProps = state => ({
  article: state.edit.article,
  yoastKeyword: state.edit.yoastKeyword,
})

const mapDispatchToProps = {
  setYoastKeywordAction: setYoastKeyword,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Yoast)
