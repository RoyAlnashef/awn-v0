export function roomThreadWithSharePath(options: {
  roomId: string
  shareJob?: string
  shareMember?: string
}) {
  const params = new URLSearchParams()
  params.set("group", options.roomId)
  if (options.shareJob) params.set("shareJob", options.shareJob)
  if (options.shareMember) params.set("shareMember", options.shareMember)
  return `/groups?${params.toString()}`
}
