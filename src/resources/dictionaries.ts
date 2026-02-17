export interface DictionaryResource {
  id: string
  name: string
  description: string
  url: string
  length: number
}

export const dictionaries: DictionaryResource[] = [
  {
    id: 'cet4',
    name: 'CET-4',
    description: '大学英语四级词汇',
    url: `${import.meta.env.BASE_URL}dicts/CET4_T.json`,
    length: 30
  },
  {
    id: 'cet6',
    name: 'CET-6',
    description: '大学英语六级词汇',
    url: `${import.meta.env.BASE_URL}dicts/CET6_T.json`,
    length: 100
  },
  {
    id: 'ielts',
    name: 'IELTS',
    description: '雅思核心词汇',
    url: `${import.meta.env.BASE_URL}dicts/IELTS_T.json`,
    length: 58
  },
  {
    id: 'long-words',
    name: 'Long Words',
    description: '常见长难词汇 (测试用)',
    url: `${import.meta.env.BASE_URL}dicts/long-words.json`,
    length: 20
  }
]
