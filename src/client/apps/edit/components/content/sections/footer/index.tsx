import { getSectionWidth } from "@artsy/reaction/dist/Components/Publishing/Sections/SectionContainer"
import { Text } from "@artsy/reaction/dist/Components/Publishing/Sections/Text"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import { onChangeArticle } from "../../../../../../actions/edit/articleActions"
import { Paragraph } from "../../../../../../components/draft/paragraph/paragraph"

interface Props {
  article: any
  isEditorial: boolean
  onChangeArticleAction: (key: string, value: any) => void
}

export class SectionFooter extends Component<Props> {
  render() {
    const { article, isEditorial, onChangeArticleAction } = this.props
    const width = getSectionWidth(undefined, article.layout)

    return (
      <FooterContainer layout={article.layout}>
        {isEditorial && (
          <SectionFooterPostscript width={width}>
            <Text layout={article.layout} postscript>
              <Paragraph
                allowedStyles={["B"]}
                hasLinks
                html={article.postscript || ""}
                onChange={html => onChangeArticleAction("postscript", html)}
                placeholder="Postscript (optional)"
              />
            </Text>
          </SectionFooterPostscript>
        )}
      </FooterContainer>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
  isEditorial: state.app.channel.type === "editorial",
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionFooter)

const FooterContainer = styled.div.attrs<{ layout?: string }>({})`
  ${props =>
    props.layout === "standard" &&
    `
    max-width: 820px;
  `};
`

const SectionFooterPostscript = styled.div.attrs<{ width?: string }>({})`
  width: 100%;
  max-width: ${props => props.width || "100%"};
  margin: auto;
`
