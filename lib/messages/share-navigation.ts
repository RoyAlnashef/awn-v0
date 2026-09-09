export function messageThreadWithSharePath(options: {
  conversationId: string
  shareJob?: string
  shareMember?: string
}) {
  const params = new URLSearchParams()
  params.set("conversation", options.conversationId)
  if (options.shareJob) params.set("shareJob", options.shareJob)
  if (options.shareMember) params.set("shareMember", options.shareMember)
  return `/messages?${params.toString()}`
}
