import { Box, Theme } from "@artsy/palette"
import { DropDownList } from "client/components/drop_down/drop_down_list"
import React from "react"
import styled from "styled-components"
import { SaveButton } from "../components/save_button"
import { SectionAdmin } from "./components/section"
import { SeriesAdmin } from "./components/series"

interface GucciAdminProps {
  curation: any
}

interface GucciAdminState {
  curation: any
  isSaved: boolean
}

export class GucciAdmin extends React.Component<
  GucciAdminProps,
  GucciAdminState
> {
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
        error: _error => this.setState({ isSaved: false }),
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
      <Theme>
        <Box pt={100}>
          <DropDownList sections={curation.get("sections")}>
            {curation.get("sections").map((section, index) => (
              <Box key={index} pb={3} pt={4}>
                <SectionAdmin
                  section={section}
                  onChange={(key, value) =>
                    this.onChangeSection(key, value, index)
                  }
                />
              </Box>
            ))}
          </DropDownList>

          <Box pb={3} pt={4}>
            <SeriesAdmin curation={curation} onChange={this.onChange} />
          </Box>

          <SaveButtonContainer position="fixed" top={1} zIndex={100}>
            <SaveButton onSave={this.save} isSaved={isSaved} />
          </SaveButtonContainer>
        </Box>
      </Theme>
    )
  }
}

const SaveButtonContainer = styled(Box)`
  right: calc(50vw + 55px - (1120px / 2));
`
