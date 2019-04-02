export type EditActiveView = "content" | "display" | "admin"
export interface ErrorMessage {
  message: string
}

export interface Channel {
  id: string
  name: string
  type: string
}

export interface LockoutDataUser {
  id: string
  name: string
}

export interface LockoutData {
  channel: Channel
  user: LockoutDataUser
  article: string // _id
}
