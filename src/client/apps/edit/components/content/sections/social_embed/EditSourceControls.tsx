import React, { Component } from 'react'
import styled from 'styled-components'
import { borderedInput } from '@artsy/reaction/dist/Components/Mixins'
import Button from "@artsy/reaction/dist/Components/Buttons/Default"


export class EditSourceControls extends Component {
  render() {
    return (
      <EditSourceContainer>
        <InputContainer>
        <Input
          placeholder={"Enter source name"}
        />
        <ApplyInputContainer>
          <LinkInput
            placeholder={"Paste or type a link"}
          />
          <ApplyButton>Apply</ApplyButton>
        </ApplyInputContainer>
        </InputContainer>
      </EditSourceContainer>
    )
  }
}

const EditSourceContainer = styled.div`
  background-color: black;
  margin: 20px;
  width: 300px;
`

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-top: 10px;
  padding-left: 10px;
`

const Input = styled.input`
  ${borderedInput}
  height: 30px;
  margin-bottom: 10px;
`

const LinkInput = Input.extend`
  margin-right: 0px;
`

const ApplyButton = styled(Button)`
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
