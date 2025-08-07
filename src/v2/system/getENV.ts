import { EnvVars } from "types/EnvVars"

export function getENV<T extends string>(key: keyof EnvVars) {
  let envVar
  if (typeof window === "undefined") {
    // @ts-ignore
    envVar = process.env[key]
  } else {
    envVar = window[key]
  }

  return envVar as T
}
