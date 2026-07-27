import { useFitText } from '../hooks/useFitText'

type EventTitleProps = {
  isAnnual: boolean
  eventTitle: string
  eventCity: string
  /** Changes whenever the layout (type/variation/platform) changes, to re-fit. */
  fitKey: string
}

/**
 * Renders the Pocket/Annual event title, auto-scaling the font size so the full
 * title fits within two lines and the frame padding, instead of being clipped.
 */
export function EventTitle({ isAnnual, eventTitle, eventCity, fitKey }: EventTitleProps) {
  const titleRef = useFitText<HTMLHeadingElement>({
    maxLines: 2,
    deps: [eventTitle, eventCity, isAnnual, fitKey],
  })

  return (
    <h2 ref={titleRef} className={`event-title ${isAnnual ? 'is-annual-layout' : ''}`}>
      {isAnnual ? (
        <span className="event-title-icon-block" aria-hidden="true">
          <img
            src={`${import.meta.env.BASE_URL}src/assets/icons/arrow.png`}
            alt=""
            className="event-title-icon"
          />
        </span>
      ) : null}
      <span className="event-title-copy">
        <span className="event-title-segment">{eventTitle}</span>
        {eventCity.trim() ? <span className="event-city event-title-segment"> {eventCity}</span> : null}
      </span>
    </h2>
  )
}
