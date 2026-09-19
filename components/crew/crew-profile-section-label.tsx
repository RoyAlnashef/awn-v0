export function CrewProfileSectionLabel({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
      {children}
    </h2>
  )
}
