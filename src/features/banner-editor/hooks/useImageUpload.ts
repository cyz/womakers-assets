import { useCallback } from 'react'
import type { ChangeEvent } from 'react'
import { MAX_IMAGE_FILE_SIZE, type EditorState } from '../model'
import { convertImageFileToDataUrl } from '../imageProcessing'
import type { FeedbackKey } from './useFeedback'

type UploadableImageField =
  | 'speakerImageUrl'
  | 'sponsorLogoUrl'
  | 'sponsorCarouselImageUrl'
  | 'quoteBackgroundImageUrl'
  | 'meetupBackgroundImageUrl'
  | 'workshopPartnerLogoUrl'
  | 'workshopSecondSpeakerImageUrl'
  | 'workshopThirdSpeakerImageUrl'
  | 'workshopFourthSpeakerImageUrl'
  | 'meetupPartnerLogoPrimaryUrl'
  | 'meetupPartnerLogoSecondaryUrl'
  | 'liveSecondSpeakerImageUrl'
  | 'livePartnerLogoUrl1'
  | 'livePartnerLogoUrl2'

type UpdateField = <Key extends keyof EditorState>(key: Key, value: EditorState[Key]) => void
type SetFeedback = (key: FeedbackKey, message: string) => void

export function useImageUpload(updateField: UpdateField, setFeedback: SetFeedback) {
  const uploadEditorImage = useCallback(
    async (
      event: ChangeEvent<HTMLInputElement>,
      field: UploadableImageField,
      feedbackKey: FeedbackKey,
      successMessage: string,
    ) => {
      const file = event.target.files?.[0]

      if (!file) {
        return
      }

      if (!file.type.startsWith('image/')) {
        setFeedback(feedbackKey, 'Selecione apenas arquivos de imagem.')
        event.target.value = ''
        return
      }

      if (file.size > MAX_IMAGE_FILE_SIZE) {
        setFeedback(feedbackKey, 'A imagem deve ter no máximo 8 MB.')
        event.target.value = ''
        return
      }

      try {
        const dataUrl = await convertImageFileToDataUrl(file)
        updateField(field, dataUrl)
        setFeedback(feedbackKey, `${successMessage}: ${file.name}`)
      } catch (error) {
        setFeedback(
          feedbackKey,
          error instanceof Error ? error.message : 'Não foi possível carregar a foto selecionada.',
        )
      }

      event.target.value = ''
    },
    [updateField, setFeedback],
  )

  const handleSpeakerPhotoUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      await uploadEditorImage(event, 'speakerImageUrl', 'photo', 'Foto carregada')
    },
    [uploadEditorImage],
  )

  const handleSecondSpeakerPhotoUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      await uploadEditorImage(
        event,
        'workshopSecondSpeakerImageUrl',
        'secondPhoto',
        'Segunda foto carregada',
      )
    },
    [uploadEditorImage],
  )

  const handleThirdSpeakerPhotoUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      await uploadEditorImage(
        event,
        'workshopThirdSpeakerImageUrl',
        'thirdPhoto',
        'Terceira foto carregada',
      )
    },
    [uploadEditorImage],
  )

  const handleFourthSpeakerPhotoUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      await uploadEditorImage(
        event,
        'workshopFourthSpeakerImageUrl',
        'fourthPhoto',
        'Quarta foto carregada',
      )
    },
    [uploadEditorImage],
  )

  const handleSponsorLogoUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      await uploadEditorImage(event, 'sponsorLogoUrl', 'sponsor', 'Logo do patrocinador carregada')
    },
    [uploadEditorImage],
  )

  const handleSponsorCarouselImageUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      await uploadEditorImage(
        event,
        'sponsorCarouselImageUrl',
        'sponsorCarouselImage',
        'Imagem da segunda arte carregada',
      )
    },
    [uploadEditorImage],
  )

  const handleMeetupBackgroundUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      await uploadEditorImage(event, 'meetupBackgroundImageUrl', 'meetupBackground', 'Fundo carregado')
    },
    [uploadEditorImage],
  )

  const handleWorkshopPartnerLogoUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      await uploadEditorImage(
        event,
        'workshopPartnerLogoUrl',
        'workshopPartnerLogo',
        'Marca parceira carregada',
      )
    },
    [uploadEditorImage],
  )

  const handleQuoteBackgroundUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      await uploadEditorImage(event, 'quoteBackgroundImageUrl', 'quoteBackground', 'Fundo carregado')
    },
    [uploadEditorImage],
  )

  const handleMeetupPartnerLogoUpload = useCallback(
    (
      field: 'meetupPartnerLogoPrimaryUrl' | 'meetupPartnerLogoSecondaryUrl',
      feedbackKey: FeedbackKey,
      label: string,
    ) =>
      async (event: ChangeEvent<HTMLInputElement>) => {
        await uploadEditorImage(event, field, feedbackKey, label)
      },
    [uploadEditorImage],
  )

  const handleRemoveSpeakerPhoto = useCallback(() => {
    updateField('speakerImageUrl', '')
    setFeedback('photo', 'Foto removida.')
  }, [updateField, setFeedback])

  const handleRemoveSecondSpeakerPhoto = useCallback(() => {
    updateField('workshopSecondSpeakerImageUrl', '')
    setFeedback('secondPhoto', 'Segunda foto removida.')
  }, [updateField, setFeedback])

  const handleRemoveThirdSpeakerPhoto = useCallback(() => {
    updateField('workshopThirdSpeakerImageUrl', '')
    setFeedback('thirdPhoto', 'Terceira foto removida.')
  }, [updateField, setFeedback])

  const handleRemoveFourthSpeakerPhoto = useCallback(() => {
    updateField('workshopFourthSpeakerImageUrl', '')
    setFeedback('fourthPhoto', 'Quarta foto removida.')
  }, [updateField, setFeedback])

  const handleRemoveSponsorLogo = useCallback(() => {
    updateField('sponsorLogoUrl', '')
    setFeedback('sponsor', 'Logo do patrocinador removida.')
  }, [updateField, setFeedback])

  const handleRemoveSponsorCarouselImage = useCallback(() => {
    updateField('sponsorCarouselImageUrl', '')
    setFeedback('sponsorCarouselImage', 'Imagem da segunda arte removida.')
  }, [updateField, setFeedback])

  const handleRemoveMeetupBackground = useCallback(() => {
    updateField('meetupBackgroundImageUrl', '')
    setFeedback('meetupBackground', 'Fundo removido.')
  }, [updateField, setFeedback])

  const handleRemoveWorkshopPartnerLogo = useCallback(() => {
    updateField('workshopPartnerLogoUrl', '')
    setFeedback('workshopPartnerLogo', 'Marca parceira removida.')
  }, [updateField, setFeedback])

  const handleRemoveQuoteBackground = useCallback(() => {
    updateField('quoteBackgroundImageUrl', '')
    setFeedback('quoteBackground', 'Fundo removido.')
  }, [updateField, setFeedback])

  const handleRemoveMeetupPartnerLogo = useCallback(
    (field: 'meetupPartnerLogoPrimaryUrl' | 'meetupPartnerLogoSecondaryUrl', label: string) => {
      updateField(field, '')
      setFeedback('meetupLogo', `${label} removida.`)
    },
    [updateField, setFeedback],
  )

  const handleLiveSecondSpeakerPhotoUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      await uploadEditorImage(
        event,
        'liveSecondSpeakerImageUrl',
        'secondPhoto',
        'Segunda foto carregada',
      )
    },
    [uploadEditorImage],
  )

  const handleRemoveLiveSecondSpeakerPhoto = useCallback(() => {
    updateField('liveSecondSpeakerImageUrl', '')
    setFeedback('secondPhoto', 'Segunda foto removida.')
  }, [updateField, setFeedback])

  const handleLivePartnerLogoUpload = useCallback(
    (field: 'livePartnerLogoUrl1' | 'livePartnerLogoUrl2', label: string) =>
      async (event: ChangeEvent<HTMLInputElement>) => {
        await uploadEditorImage(event, field, 'livePartnerLogo', label)
      },
    [uploadEditorImage],
  )

  const handleRemoveLivePartnerLogo = useCallback(
    (field: 'livePartnerLogoUrl1' | 'livePartnerLogoUrl2', label: string) => {
      updateField(field, '')
      setFeedback('livePartnerLogo', `${label} removida.`)
    },
    [updateField, setFeedback],
  )

  return {
    handleSpeakerPhotoUpload,
    handleSecondSpeakerPhotoUpload,
    handleThirdSpeakerPhotoUpload,
    handleFourthSpeakerPhotoUpload,
    handleSponsorLogoUpload,
    handleSponsorCarouselImageUpload,
    handleMeetupBackgroundUpload,
    handleWorkshopPartnerLogoUpload,
    handleQuoteBackgroundUpload,
    handleMeetupPartnerLogoUpload,
    handleRemoveSpeakerPhoto,
    handleRemoveSecondSpeakerPhoto,
    handleRemoveThirdSpeakerPhoto,
    handleRemoveFourthSpeakerPhoto,
    handleRemoveSponsorLogo,
    handleRemoveSponsorCarouselImage,
    handleRemoveMeetupBackground,
    handleRemoveWorkshopPartnerLogo,
    handleRemoveQuoteBackground,
    handleRemoveMeetupPartnerLogo,
    handleLiveSecondSpeakerPhotoUpload,
    handleRemoveLiveSecondSpeakerPhoto,
    handleLivePartnerLogoUpload,
    handleRemoveLivePartnerLogo,
  }
}
