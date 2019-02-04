import { Box, Collapse, color, Flex, Serif, space } from "@artsy/palette"
import Icon from "@artsy/reaction/dist/Components/Icon"
import {
  Input,
  StyledInput,
  Title,
} from "@artsy/reaction/dist/Components/Input"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import {
  App as YoastApp,
  SnippetPreview as YoastSnippetPreview,
} from "yoastseo"
import { setYoastKeyword } from "../../../../../client/actions/edit/editActions"

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

  state = {
    isOpen: false,
    issueCount: 0,
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
        <YoastContainer
          mt="-1px"
          height={40}
          px={30}
          alignItems="center"
          onClick={this.toggleDrawer}
        >
          <Serif size="3">Seo Analysis —</Serif>
          <ResolveMessage
            size="3"
            ml="5px"
            color={
              this.generateResolveMessage() !== " Resolved"
                ? "red100"
                : "green100"
            }
          >
            {this.generateResolveMessage()}
          </ResolveMessage>
          <CloseIcon
            right={18}
            fontSize="32px"
            rotation={isOpen ? 45 : 0}
            name="follow-circle"
            color={"black100"}
            title="plus-small"
          />
        </YoastContainer>
        <Collapse open={isOpen}>
          <Drawer p={30}>
            <YoastInput width={[1, 1 / 3]}>
              <Input
                onChange={this.onKeywordChange}
                id="focus-keyword"
                title="Target Keyword"
                placeholder="A searchable term for this content"
                value={yoastKeyword}
              />
            </YoastInput>
            <YoastOutput
              hidden={this.keywordIsBlank()}
              pl={30}
              width={[1, 2 / 3]}
            >
              <YoastSnippet hidden id="yoast-snippet" />
              <div id="yoast-output" />
            </YoastOutput>
          </Drawer>
        </Collapse>
      </Box>
    )
  }
}

export const YoastContainer = styled(Flex)`
  background-color: ${color("white100")};
  border-bottom: 1px solid ${color("black10")};
`

const Drawer = styled(Flex)`
  background-color: ${color("white100")};
  border-bottom: 1px solid ${color("black10")};
`

const CloseIcon = styled(Icon).attrs<{ rotation: number }>({})`
  transform: rotate(${props => props.rotation}deg);
  transition: all 0.25s;
  position: absolute;
`

const YoastInput = styled(Flex)`
  align-items: center;
  min-width: 360px;
  ${Title} {
    margin-bottom: 5px;
  }
  ${StyledInput} {
    min-width: 300px;
    margin-bottom: ${space(2)}px;
  }
`

export const YoastOutput = styled(Box)`
  border-left: 1px solid ${color("black10")};

  .screen-reader-text {
    display: none;
  }

  .wpseo-score-icon {
    &.bad,
    &.ok,
    &.good,
    &.na {
      display: inline-block;
      width: ${space(1)}px;
      height: ${space(1)}px;
      margin: 8px ${space(1)}px 0 0;
      border-radius: 50%;
      vertical-align: top;
    }
    &.na {
      background: ${color("black60")};
    }
    &.bad {
      background: ${color("red100")};
    }
    &.ok {
      background: ${color("yellow100")};
    }
    &.good {
      background: ${color("green100")};
    }
  }

  .wpseoanalysis li {
    display: inline-block;
    width: 49%;
    vertical-align: top;
    padding-bottom: ${space(1)}px;
  }

  .wpseo-score-text {
    display: block;
    margin: -22px ${space(1)}px 0 ${space(2)}px;
    line-height: 19px;
    font-size: 15px;
  }
`
// need to be exported styled components with names for testing purposes
export const YoastSnippet = styled(Box)``
export const ResolveMessage = styled(Serif)``

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
