import React from "react"
import _ from "underscore"
import set from "lodash.set"
import { Grid, Col, Row } from "react-styled-flexboxgrid"
import DropdownHeader from "client/apps/edit/components/admin/components/dropdown_header.coffee"
import ImageUpload from "client/apps/edit/components/admin/components/image_upload.coffee"
import CharacterLimitInput from "client/components/character_limit/index.jsx"

export default class PromotedAdmin extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      curation: props.curation,
      saveStatus: "Save"
    }
  }

  onImageInputChange(name, url, i) {
    return this.onChange(name, url, i)
  }

  onInputChange(e, i) {
    return this.onChange(e.target.name, e.target.value, i)
  }

  onChange(key, value, index) {
    const newCuration = this.state.curation.clone()
    const campaign = newCuration.get("campaigns")[index]
    set(campaign, key, value)

    return this.setState({
      curation: newCuration,
      saveStatus: "Save"
    })
  }

  save() {
    return this.state.curation.save({}, {
      success: () => this.setState({ saveStatus: "Saved" }),
      error: error => this.setState({ saveStatus: "Error" })
    })
  }

  render() {
    return (
      <div>
        {_.map(this.state.curation.get("campaigns"), (campaign, index) =>
          <div className="promoted-admin__container admin-form-container" key={`promoted-admin-${index}`}>
            <DropdownHeader
              section={campaign.name}
              key={`dropdown-${index}`}
              className="promoted-admin__section-header" />
            <div className="promoted-admin__section">
              <Row key={index}>
                <Col lg>
                  <label>Title</label>
                  <input
                    className="bordered-input"
                    placeholder="Title"
                    defaultValue={campaign.name}
                    onChange={ ((e) => this.onInputChange(e, index)).bind(this) }
                    name="name" />
                </Col>
                <Col lg>
                  <label>Start Date</label>
                  <input
                    type="date"
                    className="bordered-input"
                    placeholder="Start Date"
                    defaultValue={campaign.start_date}
                    onChange={ ((e) => this.onInputChange(e, index)).bind(this) }
                    name="start_date" />
                </Col>
                <Col lg>
                  <label>End Date</label>
                  <input
                    type="date"
                    className="bordered-input"
                    placeholder="Title"
                    defaultValue={campaign.end_date}
                    onChange={ ((e) => this.onInputChange(e, index)).bind(this) }
                    name="end_date" />
                </Col>
                <Col lg>
                  <label>Traffic Quantity</label>
                  <select
                    className="bordered-input"
                    onChange={ ((e) => this.onInputChange(e, index)).bind(this) } >
                    <option value="0.25">25%</option>
                    <option value="0.50">50%</option>
                    <option value="0.75">75%</option>
                  </select>
                </Col>
              </Row>
            </div>

            <div className="promoted-admin__section_title">Panel</div>
            <div className="promoted-admin__section">
              <Row key={index}>
                <Col lg>
                  <div className="field-group">
                    <CharacterLimitInput
                      label="headline"
                      placeholder="Headline"
                      defaultValue={campaign.panel ? campaign.panel.headline : ''}
                      onChange={ ((e) => this.onInputChange(e, index)).bind(this) }
                      name="panel.headline"
                      limit={25} />
                  </div>
                  <div className="field-group">
                    <CharacterLimitInput
                      type="textarea"
                      label="Body"
                      placeholder="Body"
                      defaultValue={campaign.panel ? campaign.panel.body : ''}
                      onChange={ ((e) => this.onInputChange(e, index)).bind(this) }
                      name="panel.body"
                      limit={90} />
                  </div>
                </Col>
                <Col lg>
                  <Row key={index}>
                    <Col lg>
                      <label>Image</label>
                      <ImageUpload
                        name='panel.assets[0]'
                        src={campaign.panel.assets[0] ? campaign.panel.assets[0].url : ''}
                        onChange={ (name, url) => this.onImageInputChange(name, url, index).bind(this) }
                        disabled={false} />
                    </Col>
                    <Col lg>
                      <label>Logo</label>
                      <ImageUpload
                        name='panel.logo'
                        src={campaign.panel && campaign.panel.logo}
                          onChange={ (name, url) => this.onImageInputChange(name, url, index).bind(this) }
                        disabled={false} />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>

            <button className="avant-garde-button" onClick={this.save.bind(this)}>
              {this.state.saveStatus}
            </button>
          </div>
        )}
      </div>
    )
  }
}
