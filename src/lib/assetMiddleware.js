import chalk from "chalk"
import fs from "fs"
import { isProduction } from "./environment"
import path from "path"

const { CDN_URL } = process.env

export const assetMiddleware = () => {
  if (isProduction) {
    const manifestPath = path.resolve(process.cwd(), "manifest.json")

    let manifest = {}
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, { encoding: "utf8" }))
    } catch (error) {
      console.error(chalk.red("\n[Positron] Error parsing manifest:"), error)
    }

    return (_req, res, next) => {
      res.locals.asset = filename => {
        let manifestFile = manifest[filename] || filename
        if (CDN_URL) {
          manifestFile = CDN_URL + manifestFile
        }
        return manifestFile
      }
      next()
    }

    // Development, return the file being requested and don't look for a manifest
  } else {
    return (_req, res, next) => {
      res.locals.asset = filename => filename
      next()
    }
  }
}
