type QuoteCardProps = {
  bodyClassName: string
  cardClassName: string
  html: string
  quoteDisplayName: string
  quoteDisplayRole: string
  showBadge?: boolean
}

export function QuoteCard({
  bodyClassName,
  cardClassName,
  html,
  quoteDisplayName,
  quoteDisplayRole,
  showBadge = true,
}: QuoteCardProps) {
  return (
    <article className={cardClassName}>
      <span className="quote-mark quote-mark-start" aria-hidden="true">
        “
      </span>
      <span className="quote-mark quote-mark-end" aria-hidden="true">
        ”
      </span>

      {showBadge ? <div className="quote-card-badge" aria-hidden="true" /> : null}

      <p className={bodyClassName} dangerouslySetInnerHTML={{ __html: html }} />

      <footer className="quote-source">
        <strong>{quoteDisplayName}</strong>
        {quoteDisplayRole ? <span>{quoteDisplayRole}</span> : null}
      </footer>
    </article>
  )
}