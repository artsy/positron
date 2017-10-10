import set from 'lodash.set'
import PropTypes from 'prop-types'
import React from 'react'

import CanvasContainer from './components/canvas_container.jsx'
import Campaign from './components/campaign.jsx'
import Panel from './components/panel.jsx'
import DropDownItem from 'client/components/drop_down/index.jsx'

export default class DisplayAdmin extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      curation: props.curation,
      saveStatus: 'Saved',
      activeSection: 0
    }
  }

  setActiveSection = (i) => {
    i = i === this.state.activeSection ? null : i
    this.setState({activeSection: i})
  }

  onChange = (key, value, index) => {
    const newCuration = this.state.curation.clone()
    const campaign = newCuration.get('campaigns')[index]
    set(campaign, key, value)
    this.setState({
      curation: newCuration,
      saveStatus: 'Save'
    })
  }

  save = () => {
    this.state.curation.save({}, {
      success: () => this.setState({ saveStatus: 'Saved' }),
      error: error => this.setState({ saveStatus: 'Error' })
    })
  }

  render () {
    const saveColor = this.state.saveStatus !== 'Saved' ? 'rgb(247, 98, 90)' : 'black'
    return (
      <div className='display-admin'>
        {this.state.curation.get('campaigns').map((campaign, index) =>
          <div className='admin-form-container' key={`display-admin-${index}`}>
            <DropDownItem
              active={index === this.state.activeSection}
              index={index}
              onClick={() => this.setActiveSection(index)}
              title={campaign.name}>
              {this.state.activeSection === index &&
                <div className='display-admin__section-inner'>
                  <Campaign campaign={campaign} index={index} onChange={this.onChange} />
                  <Panel campaign={campaign} index={index} onChange={this.onChange} />
                  <CanvasContainer campaign={campaign} index={index} onChange={this.onChange} />
                </div>
              }
            </DropDownItem>
          </div>
        )}
        <button
          className='save-campaign avant-garde-button'
          onClick={this.save}
          style={{color: saveColor}}>
          {this.state.saveStatus}
        </button>
      </div>
    )
  }
}

DisplayAdmin.propTypes = {
  curation: PropTypes.object.isRequired
}
