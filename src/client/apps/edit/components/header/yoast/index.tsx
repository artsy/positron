import { Box, color, Flex, Separator, space } from "@artsy/palette"
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
  unresolvedIssues: number
}

export class Yoast extends Component<Props, State> {
  static snippetPreview: any

  constructor(props) {
    super(props)

    this.state = {
      isOpen: false,
      focusKeyword: props.article.seo_keyword || "",
      unresolvedIssues: 0,
    }
  }

  componentDidMount() {
    this.snippetPreview = new YoastSnippetPreview({
      targetElement: document.getElementById("snippet"),
    })

    const message = document.getElementById("unresolved-message")

    const app = new YoastApp({
      snippetPreview: this.snippetPreview,
      targets: {
        output: "output",
      },
      callbacks: {
        getData: () => {
          return {
            keyword: this.state.focusKeyword,
            text: this.getBodyText(),
          }
        },
        saveScores: unresolvedIssues => {
          this.setState({ unresolvedIssues })
        },
      },
    })

    this.setSnippetFields()
    app.refresh()
    this.snippetPreview.changedInput()
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

    const formTitle = document.getElementById("snippet-editor_title")
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
  }

  onKeywordChange = e => {
    this.setState({ focusKeyword: e.target.value })
    this.setSnippetFields()
    this.snippetPreview.changedInput()
  }

  generateResolveMessage = () => {
    const { unresolvedIssues } = this.state
    const issueCount = document.querySelectorAll("#output .bad").length

    if (!this.state.focusKeyword) {
      return " Set Target Keyword"
    } else if (issueCount && issueCount > 0) {
      return `${issueCount} Unresolved Issue${issueCount > 1 ? "s" : ""}`
    } else {
      return "WOOOOO"
    }
  }

  render() {
    const { isOpen } = this.state
    return (
      <Box>
        <YoastContainer onClick={this.toggleDrawer}>
          <div>
            Seo Analysis —{" "}
            <span id="unresolved-message">{this.generateResolveMessage()}</span>
          </div>
        </YoastContainer>
        <StaticCollapse open={isOpen}>
          <Drawer>
            <Box width={[1, 1 / 3]}>
              <Input
                onChange={this.onKeywordChange}
                id="focus-keyword"
                title="Target Keyword"
                placeholder="A searchable term for this content"
              />
            </Box>
            <Flex width={[1, 2 / 3]}>
              <Separator width={2} />
              <Snippet id="snippet" />
              <div id="output" />
            </Flex>
          </Drawer>
        </StaticCollapse>
      </Box>
    )
  }
}

export const YoastContainer = styled(Flex)`
  background-color: ${color("black5")};
  padding: 0 20px;
  height: ${space(4)}px;
  border-bottom: 1px solid ${color("black10")};
  font-size: 15px;
  align-items: center;
  div > span {
    color: ${color("red100")};
  }
`

export const Snippet = styled.div`
  display: none;
`

export const Drawer = styled(Flex)`
  background-color: ${color("white100")};
  padding: 0 20px;
`

const mapStateToProps = state => ({
  article: state.edit.article,
})

export default connect(mapStateToProps)(Yoast)
