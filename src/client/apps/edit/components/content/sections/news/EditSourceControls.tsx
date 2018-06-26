import React, { Component } from 'react'
import styled from 'styled-components'
// import { borderedInput } from '@artsy/reaction/dist/Components/Mixins'
import Button from "@artsy/reaction/dist/Components/Buttons/Default"

interface Props {
  onApply: (news_source: { title?: string, url?: string } | null) => void
  source?: {
    title: string
    url: string
  }
}

interface State {
  title?: string
  url?: string
}

export class EditSourceControls extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    const source = props.source

    this.state = { 
      title: source ? source.title : "",
      url: source ? source.url : ""
    }
  }

  render() {
    return (
      <EditSourceContainer>
        <InputContainer>
          <Input
            className='bordered-input'
            name={"title"}
            value={this.state.title}
            placeholder={"Enter source name"}
            onChange={(event) => this.setState({title: event.target.value})}
          />
          <ApplyInputContainer>
            <LinkInput
              className='bordered-input'
              name={"url"}
              value={this.state.url}
              placeholder={"Paste or type a link"}
              onChange={(event) => this.setState({url: event.target.value})}
            />
            <ApplyButton onClick={() => this.props.onApply(this.state)}>
              {"Apply"}
            </ApplyButton>
          </ApplyInputContainer>
        </InputContainer>
      </EditSourceContainer>
    )
  }
}

const EditSourceContainer = styled.div`
  background-color: black;
  margin: 20px;
  padding: 10px 10px 0 10px;
  width: 300px;
`

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`

// TODO: Use Reaction borderedInput mixin
const Input = styled.input`
  height: 30px;
  margin-bottom: 10px;
  background: white;
`

const LinkInput = Input.extend`
  margin-right: 0px;
`

const ApplyButton = Button.extend.attrs<{onClick: any}>({})`
  height: 30px;
  margin: 0px;
  padding-right: 35px;
`

const ApplyInputContainer = styled.div`
  flex-direction: row;
  flex: 1;
  display: flex;
  align-items: space-around;
`
