export type TreeNode = {
  id: number
  file: string
  title: string
  subtitle?: string
  slug: string
  parent?: string
  previous?: string
  next?: string
  children: TreeNode[]
  headings: HeadingNode[]
}

export type HeadingNode = {
  level: number
  title: string
  url: string
}
