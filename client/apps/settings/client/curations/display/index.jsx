import React from 'react'
import _ from 'underscore'
import set from 'lodash.set'
import Campaign from './campaign.jsx'
import Panel from './panel.jsx'
import DropdownHeader from 'client/apps/edit/components/admin/components/dropdown_header.coffee'

import DropDownItem from 'client/components/dropdown/index'

export default class DisplayAdmin extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      curation: props.curation,
      saveStatus: 'Save',
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
    return (
      <div className='display-admin'>
        {_.map(this.state.curation.get('campaigns'), (campaign, index) =>
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
                </div>
              }
            </DropDownItem>
          </div>
        )}
        <button className='save-campaign avant-garde-button' onClick={this.save}>
          {this.state.saveStatus}
        </button>
      </div>
    )
  }
}
