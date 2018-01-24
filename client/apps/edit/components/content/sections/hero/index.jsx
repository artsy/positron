import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Section from '../../../../../../models/section.coffee'
import SectionContainer from '../../section_container'
import { SectionTool } from '../../section_tool'

export class SectionHero extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    const hero = new Section(props.article.get('hero_section'))

    hero.on('change', (hero) => {
      props.onChange('hero_section', hero.attributes)
    })

    this.state = {
      editing: false,
      hero
    }
  }

  onRemoveHero = () => {
    this.state.hero.clear()
    this.props.onChange('hero_section', null)
  }

  onSetEditing = (isEditing) => {
    const hasHero = this.props.article.finishedHero()

    if (isEditing) {
      this.setState({ editing: true })
    } else {
      if (!hasHero) {
        this.onRemoveHero()
      }
      this.setState({ editing: false })
    }
  }

  render () {
    const { editing, hero } = this.state

    return (
      <div className='edit-section--hero'>
        {hero && hero.keys().length
          ? <SectionContainer
              section={hero}
              onSetEditing={this.onSetEditing}
              isHero
              index={-1}
              editing={editing}
              onRemoveHero={this.onRemoveHero}
            />

          : <SectionTool
              section={hero}
              onSetEditing={this.onSetEditing}
              isHero
              index={-1}
              editing={editing}
            />
        }
      </div>
    )
  }
}
