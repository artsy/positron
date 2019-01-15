import { Box, Flex } from "@artsy/palette"
import AutocompleteListMetaphysics from "client/components/autocomplete2/list_metaphysics"
import React from "react"

export const AdminAppearances = () => {
  return (
    <>
      <Flex flexDirection={["column", "row"]}>
        <Box width={["100%", "50%"]} pr={[0, 2]}>
          <AutocompleteListMetaphysics
            field="fair_programming_ids"
            label="Fair Programming"
            model="fairs"
            placeholder="Search by fair name..."
          />
        </Box>

        <Box width={["100%", "50%"]} pl={[0, 2]}>
          <AutocompleteListMetaphysics
            field="fair_artsy_ids"
            label="Artsy at the Fair"
            model="fairs"
            placeholder="Search by fair name..."
          />
        </Box>
      </Flex>

      <Flex flexDirection={["column", "row"]}>
        <Box width={["100%", "50%"]} pr={[0, 2]}>
          <AutocompleteListMetaphysics
            field="fair_about_ids"
            label="About the Fair"
            model="fairs"
            placeholder="Search by fair name..."
          />
        </Box>

        <Box width={["100%", "50%"]} pl={[0, 2]}>
          <AutocompleteListMetaphysics
            field="biography_for_artist_id"
            label="Extended Artist Biography"
            model="artists"
            placeholder="Search by artist name..."
            type="single"
          />
        </Box>
      </Flex>
    </>
  )
}
