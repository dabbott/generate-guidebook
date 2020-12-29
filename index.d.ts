export type Author = {
  name: string
  url?: string
}

export type TreeNode = {
  id: number
  file: string
  title: string
  subtitle?: string
  slug: string
  parent?: string
  previous?: string
  next?: string
  author?: Author
  children: TreeNode[]
  headings: HeadingNode[]
}

export type HeadingNode = {
  level: number
  title: string
  url: string
}
