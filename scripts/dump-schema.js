/* eslint-disable no-console */

import fs from "fs"
import { printSchema } from "graphql/utilities"
import path from "path"
import { schema } from "../src/api/apps/graphql"
import prettier from "prettier"
import { graphql, introspectionQuery } from "graphql"

const message =
  "Usage: dump-schema.js /path/to/output/directory or /path/to/filename.graphql or /path/to/schema.json"

const destination = process.argv[2]

if (!destination) {
  console.error(
    "\n[dump-schema] ERROR: Must supply output directory or file for schema.\n"
  )
  process.exit(1)
}

// Support both passing a folder or a filename
const schemaPath =
  fs.existsSync(destination) && fs.statSync(destination).isDirectory()
    ? path.join(destination, "schema.graphql")
    : destination

if (schemaPath.endsWith("json")) {
  console.log(`[dump-schema] Dumping JSON to ${schemaPath}`)
  graphql(schema, introspectionQuery).then(
    result => {
      const prettierResult = prettier.format(JSON.stringify(result), {
        parser: "json",
      })
      fs.writeFileSync(path.join(schemaPath), prettierResult)
    },
    error => {
      console.error(
        "[dump-schema] ERROR introspecting schema: ",
        JSON.stringify(error, null, 2)
      )
    }
  )
} else {
  console.log(`[dump-schema] Dumping SDL to ${schemaPath}`)
  // commentDescriptions means it uses # instead of the ugly """
  const schemaText = printSchema(schema, { commentDescriptions: true })
  const prettySchema = prettier.format(schemaText, { parser: "graphql" })

  // Save user readable type system shorthand of schema
  fs.writeFileSync(schemaPath, prettySchema, "utf8")
}

process.exit()
