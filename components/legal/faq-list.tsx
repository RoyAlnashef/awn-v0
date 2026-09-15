import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { FaqItem } from "@/components/legal/faq-content"

type FaqListProps = {
  items: FaqItem[]
}

export function FaqList({ items }: FaqListProps) {
  return (
    <Accordion className="border-border/50 bg-card/80 backdrop-blur-sm">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger className="font-heading text-base font-medium sm:text-lg">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>{item.answer}</p>
            {item.bullets?.length ? (
              <ul className="mt-3 list-disc space-y-1.5 ps-5">
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
            {item.outro ? <p className="mt-3">{item.outro}</p> : null}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
