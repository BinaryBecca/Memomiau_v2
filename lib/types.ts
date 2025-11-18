export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  username: string
  email: string
  avatar_url: string | null
  preset_avatar: string | null
  created_at: string
}

export interface Deck {
  id: string
  owner: string
  name: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
  profiles: {
    username: string
  } | null
}

export interface Card {
  id: string
  deck_id: string
  front: string
  back: string
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface CardLearningStatus {
  id: string
  card_id: string
  user_id: string
  status: "green" | "yellow" | "red"
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  user_metadata?: {
    first_name?: string
    last_name?: string
  }
}
