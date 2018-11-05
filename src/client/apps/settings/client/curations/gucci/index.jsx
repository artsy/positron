import PropTypes from "prop-types"
import React from "react"
import { DropDownList } from "client/components/drop_down/drop_down_list"
import { SaveButton } from "../components/save_button"
import { SectionAdmin } from "./components/section"
import { SeriesAdmin } from "./components/series"

export class GucciAdmin extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      curation: props.curation,
      isSaved: true,
    }
  }

  save = () => {
    this.state.curation.save(
      {},
      {
        success: () => this.setState({ isSaved: true }),
        error: error => this.setState({ isSaved: false }),
      }
    )
  }

  onChange = (key, value) => {
    const newCuration = this.state.curation.clone()
    newCuration.set(key, value)

    this.setState({
      curation: newCuration,
      isSaved: false,
    })
  }

  onChangeSection = (key, value, index) => {
    const sections = this.state.curation.get("sections")
    sections[index][key] = value
    this.onChange("sections", sections)
  }

  render() {
    const { curation, isSaved } = this.state

    return (
      <div className="gucci-admin curation--admin-container">
        <DropDownList sections={curation.get("sections")}>
          {curation.get("sections").map((section, index) => (
            <div key={index} className="gucci-admin__section-inner">
              <SectionAdmin
                section={section}
                onChange={(key, value) =>
                  this.onChangeSection(key, value, index)
                }
              />
            </div>
          ))}
        </DropDownList>

        <div className="gucci-admin__series">
          <SeriesAdmin curation={curation} onChange={this.onChange} />
        </div>
        <SaveButton onSave={this.save} isSaved={isSaved} />
      </div>
    )
  }
}

GucciAdmin.propTypes = {
  curation: PropTypes.object.isRequired,
}
