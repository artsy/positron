import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import moment from 'moment'

import { ModalTypes } from './modalTypes'
import { Fonts } from '@artsy/reaction-force/dist/Components/Publishing/Fonts'
import colors from '@artsy/reaction-force/dist/Assets/Colors'
import { IconLock } from '@artsy/reaction-force/dist/Components/Publishing'

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
Header.displayName = 'Header'

export const Title = styled.h1`
  ${Fonts.garamond('s30')};
  margin-bottom: 15px;
`
Title.displayName = 'Title'

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

const ActionButton = styled.button`
  margin-right: 15px;
`
ActionButton.displayName = 'ActionButton'

const RedirectText = styled.span`
  ${Fonts.avantgarde('s11')};
  text-transform: uppercase;
  color: ${colors.grayMedium};
`

export class MessageModal extends Component {
  static propTypes = {
    type: PropTypes.oneOf(['locked', 'timeout']),
    session: PropTypes.object,
    onClose: PropTypes.func,
    onTimerEnded: PropTypes.func
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
      this.props.onTimerEnded && this.props.onTimerEnded()
      return
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

  getIconForType (type) {
    switch (type) {
      case 'lock': return <IconLock color={colors.grayMedium} width='10px' height='10px' />
      default: return null
    }
  }

  render () {
    const { type, session } = this.props
    const { header, title, description, actions } = ModalTypes[type]
    const { timestamp, user } = session || { timestamp: null, user: { name: null } }
    const count = this.state.timeLeft
    const time = `00:${count < 10 ? '0' + count : count}`

    return (
      <SplashBackground onClick={this.close}>
        <Container>
          <Header color={colors[header.color]}>
            {header.icon && this.getIconForType(header.icon)}
            {header.text}
          </Header>
          <Title>{title}</Title>
          <Description>{description(moment(timestamp).fromNow(), user.name)}</Description>
          <Footer>
            <ActionsContainer>
              {actions.map((a, i) => <ActionButton
                key={i}
                className='avant-garde-button'
                onClick={a.action.bind(this)}>{a.title}</ActionButton>)}
            </ActionsContainer>
            <RedirectText>Redirecting in {time}</RedirectText>
          </Footer>
        </Container>
      </SplashBackground>
    )
  }
}
