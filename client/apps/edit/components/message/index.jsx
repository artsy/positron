import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import moment from 'moment'

import { ModalTypes } from './modalTypes'
import { Fonts } from '@artsy/reaction-force/dist/Components/Publishing/Fonts'
import colors from '@artsy/reaction-force/dist/Assets/Colors'

const SplashBackground = styled.div`
  background-color: rgba(0, 0, 0, 0.6);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 999;
`

const Container = styled.div`
  background-color: white;
  max-width: 600px;
  align-self: center;
  padding: 20px 30px;
`

const Header = styled.div`
  ${Fonts.avantgarde('s11')};
  margin-bottom: 10px;
  text-transform: uppercase;
  color: ${p => p.color};
`

//TODO: Finish icon
const HeaderIcon = styled.div`
`

const Title = styled.h1`
  ${Fonts.garamond('s30')};
  margin-bottom: 15px;
`

const Description = styled.div`
  ${Fonts.garamond('s19')};
  max-width: 470px;
  line-height: 1.1;
`

const Footer = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 50px;
  align-items: center;
`

const ActionsContainer = styled.div`
  margin-right: 20px;
`

const RedirectText = styled.span`
  ${Fonts.avantgarde('s11')};
  text-transform: uppercase;
  color: ${colors.grayMedium};
`

export class MessageModal extends Component {
  static propTypes = {
    type: PropTypes.oneOf(['locked', 'timeout']),
    session: PropTypes.object,
    onClose: PropTypes.func
  }

  state = {
    timeLeft: 10
  }

  componentDidMount () {
    this.timer = setInterval(this.updateTimer, 1000)
  }

  componentWillUnmount () {
    clearInterval(this.timer)
  }

  updateTimer = () => {
    const { timeLeft } = this.state
    if (timeLeft === 0) {
      return this.props.onClose && this.props.onClose()
    }

    this.setState({
      timeLeft: timeLeft - 1
    })
  }

  close = () => {
    const modal = ModalTypes[this.props.type]

    if (this.props.onClose && modal.canDismiss) {
      this.props.onClose(true)
    }
  }

  render () {
    const { type, session } = this.props
    const { header, title, description, actions } = ModalTypes[type]
    const { timestamp, user } = session
    const count = this.state.timeLeft
    const time = `00:${count < 10 ? '0' + count : count}`

    return (
      <SplashBackground onClick={this.close}>
        <Container>
          <Header color={colors[header.color]}>
            {header.icon && <HeaderIcon icon='lock' />}
            {header.text}
          </Header>
          <Title>{title}</Title>
          <Description>{description(moment(timestamp).fromNow(), user.name)}</Description>
          <Footer>
            <ActionsContainer>
              {actions.map((a, i) => <button
                key={i}
                className='avant-garde-button'
                onClick={a.action.bind(this)}>{a.title}</button>)}
            </ActionsContainer>
            <RedirectText>Redirecting in {time}</RedirectText>
          </Footer>
        </Container>
      </SplashBackground>
    )
  }
}
