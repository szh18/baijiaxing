export interface Surname {
  id: string
  name: string
  pinyin: string
  rank: number
  origin: string
  ancestor: string
  junwang: string[]
  tanghao: string
  createdAt: string
  updatedAt: string
}

export interface Celebrity {
  id: string
  surnameId: string
  name: string
  dynasty: string
  birthYear: number | null
  deathYear: number | null
  birthplace: string | null
  imageUrl: string | null
  summary: string
  biography: string
  works: string
  anecdotes: string | null
  externalLinks: { label: string; url: string }[]
  createdAt: string
  updatedAt: string
}

export interface SurnameWithCelebrities extends Surname {
  celebrities: Celebrity[]
}

export interface SearchResult {
  type: 'surname' | 'celebrity'
  data: Surname | Celebrity
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
