import { landingContent } from "@/components/landing/content"

export function LandingOperate() {
  const { operate } = landingContent

  return (
    <section className="relative z-10 px-6 py-16 text-center sm:px-8 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="text-body-mini font-semibold tracking-widest text-primary uppercase">
          {operate.eyebrow}
        </p>
        <h2 className="mt-4 font-heading text-h2 font-medium tracking-tight text-balance">
          {operate.title}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-body-sm text-muted-foreground text-pretty sm:text-body">
          {operate.body}
        </p>

        <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
          {operate.bullets.map((column, columnIndex) => (
            <ul key={columnIndex} className="flex flex-col gap-3">
              {column.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span aria-hidden className="mt-0.5 text-primary">
                    —
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
