import { set } from "lodash"
import PropTypes from "prop-types"
import React from "react"
import { DropDownList } from "client/components/drop_down/drop_down_list"
import { Campaign } from "./components/campaign"
import { Canvas } from "./components/canvas"
import { Panel } from "./components/panel"

export default class DisplayAdmin extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      curation: props.curation,
      saveStatus: "Saved",
    }
  }

  onChange = (key, value, index) => {
    const newCuration = this.state.curation.clone()
    const campaign = newCuration.get("campaigns")[index]
    set(campaign, key, value)
    this.setState({
      curation: newCuration,
      saveStatus: "Save",
    })
  }

  save = () => {
    this.state.curation.save(
      {},
      {
        success: () => this.setState({ saveStatus: "Saved" }),
        error: error => {
          console.error(error)
          this.setState({ saveStatus: "Error" })
        },
      }
    )
  }

  newCampaign = () => {
    const newCuration = this.state.curation.clone()
    const newCampaign = {
      sov: 0.2,
      panel: { assets: [] },
      canvas: { assets: [] },
    }
    newCuration.get("campaigns").push(newCampaign)
    this.setState({
      curation: newCuration,
      saveStatus: "Save",
      activeSection: newCuration.get("campaigns").length - 1,
    })
  }

  deleteCampaign = index => {
    const confirmDelete = confirm("Are you sure?")
    if (confirmDelete) {
      const newCuration = this.state.curation.clone()
      newCuration.get("campaigns").splice(index, 1)
      this.setState({
        curation: newCuration,
        saveStatus: "Save",
      })
    }
  }

  render() {
    const { curation, saveStatus } = this.state
    const saveColor = saveStatus !== "Saved" ? "rgb(247, 98, 90)" : "black"

    return (
      <div className="display-admin">
        <DropDownList sections={curation.get("campaigns")}>
          {curation.get("campaigns").map((campaign, index) => (
            <div
              className="admin-form-container"
              key={`display-admin-${index}`}
            >
              <div className="display-admin__section--actions">
                <button
                  className="avant-garde-button"
                  onClick={() => this.deleteCampaign(index)}
                >
                  Delete
                </button>
              </div>

              <div className="display-admin__section-inner">
                <Campaign
                  campaign={campaign}
                  index={index}
                  onChange={this.onChange}
                />
                <Panel
                  campaign={campaign}
                  index={index}
                  onChange={this.onChange}
                />
                <Canvas
                  campaign={campaign}
                  index={index}
                  onChange={this.onChange}
                />
              </div>
            </div>
          ))}
        </DropDownList>

        <button
          className="save-campaign avant-garde-button"
          onClick={this.save}
          style={{ color: saveColor }}
        >
          {this.state.saveStatus}
        </button>
        <button
          className="new-campaign avant-garde-button avant-garde-button-dark"
          onClick={this.newCampaign}
        >
          Add New Campaign
        </button>
      </div>
    )
  }
}

DisplayAdmin.propTypes = {
  curation: PropTypes.object.isRequired,
}
