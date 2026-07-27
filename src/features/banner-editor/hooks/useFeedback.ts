import { useCallback, useState } from 'react'

export type FeedbackKey =
  | 'save'
  | 'photo'
  | 'sponsor'
  | 'quoteBackground'
  | 'meetupBackground'
  | 'meetupLogo'
  | 'workshopPartnerLogo'
  | 'sponsorCarouselImage'
  | 'secondPhoto'
  | 'thirdPhoto'
  | 'fourthPhoto'
  | 'livePartnerLogo'

export type FeedbackState = Record<FeedbackKey, string>

const emptyFeedback: FeedbackState = {
  save: '',
  photo: '',
  sponsor: '',
  quoteBackground: '',
  meetupBackground: '',
  meetupLogo: '',
  workshopPartnerLogo: '',
  sponsorCarouselImage: '',
  secondPhoto: '',
  thirdPhoto: '',
  fourthPhoto: '',
  livePartnerLogo: '',
}

export function useFeedback() {
  const [feedback, setFeedbackState] = useState<FeedbackState>(() => ({ ...emptyFeedback }))

  const setFeedback = useCallback((key: FeedbackKey, message: string) => {
    setFeedbackState((current) => (current[key] === message ? current : { ...current, [key]: message }))
  }, [])

  const clearFeedback = useCallback((keys: FeedbackKey[]) => {
    setFeedbackState((current) => {
      let changed = false
      const next = { ...current }

      for (const key of keys) {
        if (next[key] !== '') {
          next[key] = ''
          changed = true
        }
      }

      return changed ? next : current
    })
  }, [])

  return { feedback, setFeedback, clearFeedback }
}
