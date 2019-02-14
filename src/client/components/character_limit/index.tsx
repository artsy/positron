import { BorderBox, color, Flex } from "@artsy/palette"
import { Input } from "@artsy/reaction/dist/Components/Input"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { PlainText } from "client/components/draft/plain_text/plain_text"
import { FormLabel } from "client/components/form_label"
import React from "react"
import styled from "styled-components"
import { stripTags } from "underscore.string"

interface CharacterLimitProps {
  defaultValue?: string
  html?: boolean
  isRequired?: boolean
  label?: string
  limit: number
  onChange: (text: string) => void
  placeholder?: string
  type?: string
}

interface CharacterLimitState {
  remainingChars: number
}

export class CharacterLimit extends React.Component<
  CharacterLimitProps,
  CharacterLimitState
> {
  constructor(props) {
    super(props)

    this.state = {
      remainingChars:
        props.limit - this.getTextLength(props.defaultValue || "", props.html),
    }
  }

  getTextLength = (text, isHtml) => {
    return isHtml ? stripTags(text).length : text.length
  }

  onChange = input => {
    const { html, limit, onChange } = this.props
    const remainingChars = limit - this.getTextLength(input, html)

    this.setState({ remainingChars })
    onChange(input)
  }

  renderTextArea = () => {
    const { defaultValue, html, label, placeholder } = this.props

    if (html) {
      return (
        <BorderBox p={1} mt={label && 1}>
          <Paragraph
            onChange={this.onChange}
            hasLinks
            html={defaultValue || ""}
            stripLinebreaks
            placeholder={placeholder}
          />
        </BorderBox>
      )
    } else {
      return (
        <BorderBox p={1} mt={label && 1}>
          <PlainText
            content={defaultValue}
            onChange={this.onChange}
            placeholder={placeholder}
          />
        </BorderBox>
      )
    }
  }

  render() {
    const {
      defaultValue,
      isRequired,
      label,
      limit,
      placeholder,
      type,
    } = this.props
    const { remainingChars } = this.state

    return (
      <CharacterLimitContainer type={type}>
        <Flex justifyContent="space-between">
          <FormLabel isRequired={isRequired}>{label}</FormLabel>
          <FormLabel>
            <RemainingChars isOverLimit={remainingChars < 0}>
              {remainingChars} Characters
            </RemainingChars>
          </FormLabel>
        </Flex>

        {type === "textarea" ? (
          this.renderTextArea()
        ) : (
          <Input
            block
            placeholder={placeholder}
            defaultValue={defaultValue || ""}
            onChange={e => this.onChange(e.currentTarget.value)}
            maxLength={limit}
          />
        )}
      </CharacterLimitContainer>
    )
  }
}

const CharacterLimitContainer = styled.div<{ type?: string }>`
  ${props =>
    props.type === "textarea" &&
    `
    .DraftEditor-root {
      min-height: 3em;
    }
  `};

  .plain-text {
    width: 100%;
  }
`

export const RemainingChars = styled.div<{ isOverLimit: boolean }>`
  color: ${props => (props.isOverLimit ? color("red100") : color("black30"))};
`
