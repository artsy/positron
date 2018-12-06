import { Box, color, Flex, Sans, Serif, space } from "@artsy/palette"
import { avantgarde } from "@artsy/reaction/dist/Assets/Fonts"
import Icon from "@artsy/reaction/dist/Components/Icon"
import { Input } from "@artsy/reaction/dist/Components/Input"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { StaticCollapse } from "@artsy/reaction/dist/Components/StaticCollapse"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import {
  App as YoastApp,
  SnippetPreview as YoastSnippetPreview,
} from "yoastseo"

interface Props {
  article: ArticleData
}

interface State {
  isOpen: boolean
  focusKeyword: string
  issueCount: number
}

export class Yoast extends Component<Props, State> {
  static snippetPreview: any

  constructor(props) {
    super(props)

    this.state = {
      isOpen: false,
      focusKeyword: props.article.seo_keyword || "",
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
            keyword: this.state.focusKeyword,
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
    // document.getElementById("content-field").value = this.getBodyText()
    const {
      article: {
        search_title,
        thumbnail_title,
        title,
        description,
        search_description,
      },
    } = this.props
    const seoTitle = search_title || thumbnail_title || title || ""
    const seoDescription = search_description || description || ""

    const formTitle = document.getElementById("snippet-editor-title")
    const formDescription = document.getElementById(
      "snippet-editor-meta-description"
    )

    if (formTitle) {
      formTitle.value = seoTitle
    }

    if (formDescription) {
      formDescription.value = seoDescription
    }
  }

  getBodyText = () => {
    const {
      article: { lead_paragraph, sections },
    } = this.props
    const fullText: string[] = []
    if (lead_paragraph.length) {
      fullText.push(lead_paragraph)
    }

    sections &&
      sections.map((section, i) => {
        if (section.type === "text" && section.body) {
          fullText.push(section.body)
        }
      })

    return fullText.join()
  }

  toggleDrawer = () => {
    this.setState({ isOpen: !this.state.isOpen })
    this.setState({ iconRotation: this.state.isOpen ? 0 : 45 })
  }

  getRotation = () => {
    return state.isOpen ? 45 : 0
  }

  onKeywordChange = e => {
    this.setState({ focusKeyword: e.target.value })
    this.resetSnippet()
  }

  resetSnippet = () => {
    this.setSnippetFields()
    this.snippetPreview.changedInput()
  }

  generateResolveMessage = () => {
    const { issueCount } = this.state
    // const issueCount = document.querySelectorAll("#output .bad").length

    if (!this.state.focusKeyword.trim().length) {
      return " Set Target Keyword"
    } else if (issueCount && issueCount > 0) {
      return `${issueCount} Unresolved Issue${issueCount > 1 ? "s" : ""}`
    } else {
      return " Resolved"
    }
  }

  render() {
    const { isOpen, focusKeyword } = this.state
    return (
      <Box>
        <YoastContainer onClick={this.toggleDrawer}>
          Seo Analysis —
          <ResolveMessage
            color={
              this.generateResolveMessage() === " Resolved"
                ? color("green100")
                : color("red100")
            }
          >
            {this.generateResolveMessage()}
          </ResolveMessage>
          <CloseIcon
            rotated={isOpen}
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
              />
            </YoastInput>
            <YoastOutput
              hidden={focusKeyword.trim().length < 1}
              width={[1, 2 / 3]}
            >
              <Box hidden id="yoast-snippet" />
              <div id="yoast-output" />
            </YoastOutput>
          </Drawer>
        </StaticCollapse>
      </Box>
    )
  }
}

const YoastContainer = styled(Flex)`
  background-color: ${color("black5")};
  padding: 0 20px;
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
const ResolveMessage = styled(Box)`
  display: inline;
  margin-left: 5px;
`
const CloseIcon = styled(Icon)<{
  rotated: boolean
}>`
  transform: rotate(${props => (props.rotated ? 45 : 0)}deg);
  transition: all 0.25s;
  position: absolute;
  right: 15px;
  font-size: 32px;
`
const YoastInput = styled(Box)`
  min-width: 360px;
`
const YoastOutput = styled(Box)`
  border-left: 1px solid ${color("black10")};
  padding-left: 30px;
`

const mapStateToProps = state => ({
  article: state.edit.article,
})

export default connect(mapStateToProps)(Yoast)
