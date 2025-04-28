export interface MoodStateRequest {
  name: string,
  description: string,
  image: string,
  color: string
}

export interface MoodStateResponse {
  id: number,
  name: string,
  description: string,
  image: string,
  color: string,
  isActive: boolean
}
