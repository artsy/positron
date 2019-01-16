import { Box, Flex } from "@artsy/palette"
import AutocompleteListMetaphysics from "client/components/autocomplete2/list_metaphysics"
import React from "react"
import { FeaturingMentioned } from "./featuring_mentioned"

export const AdminFeaturing = () => {
  return (
    <div>
      <Flex flexDirection={["column", "row"]}>
        <Box width={["100%", "50%"]} pr={[0, 2]}>
          <AutocompleteListMetaphysics
            field="partner_ids"
            label="Partners"
            model="partners"
            placeholder="Search by partner name..."
          />
        </Box>

        <Box width={["100%", "50%"]} pl={[0, 2]}>
          <AutocompleteListMetaphysics
            field="fair_ids"
            label="Fairs"
            model="fairs"
            placeholder="Search by fair name..."
          />
        </Box>
      </Flex>

      <Flex flexDirection={["column", "row"]}>
        <Box width={["100%", "50%"]} pr={[0, 2]}>
          <AutocompleteListMetaphysics
            field="show_ids"
            label="Shows"
            model="partner_shows"
            placeholder="Search by show name..."
          />
        </Box>

        <Box width={["100%", "50%"]} pl={[0, 2]}>
          <AutocompleteListMetaphysics
            field="auction_ids"
            label="Auctions"
            model="sales"
            placeholder="Search by auction name..."
          />
        </Box>
      </Flex>

      <Flex flexDirection={["column", "row"]}>
        <Box width={["100%", "50%"]} pr={[0, 2]}>
          <FeaturingMentioned model="artist" />
        </Box>

        <Box width={["100%", "50%"]} pl={[0, 2]}>
          <FeaturingMentioned model="artwork" />
        </Box>
      </Flex>
    </div>
  )
}
