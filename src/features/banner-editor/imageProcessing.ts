// Pure image + storage helpers extracted from App.tsx so they can be reused
// by the editor hooks without pulling in React state.

export const downloadImage = (imageDataUrl: string, fileName: string) => {
  const link = document.createElement('a')
  link.href = imageDataUrl
  link.download = fileName
  link.click()
}

export const convertImageFileToDataUrl = async (file: File) => {
  const fileDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Não foi possível ler a imagem selecionada.'))
    }

    reader.onerror = () => reject(new Error('Não foi possível ler a imagem selecionada.'))
    reader.readAsDataURL(file)
  })

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const nextImage = new Image()

    nextImage.onload = () => resolve(nextImage)
    nextImage.onerror = () => reject(new Error('Não foi possível processar a imagem selecionada.'))
    nextImage.src = fileDataUrl
  })

  const maxDimension = 1600
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.width * scale))
  canvas.height = Math.max(1, Math.round(image.height * scale))

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Não foi possível preparar a imagem para salvamento.')
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/webp', 0.88)
}

export const optimizeSavedPreviewDataUrl = async (imageDataUrl: string) => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const nextImage = new Image()

    nextImage.onload = () => resolve(nextImage)
    nextImage.onerror = () => reject(new Error('Não foi possível preparar a prévia para salvamento.'))
    nextImage.src = imageDataUrl
  })

  const maxWidth = 720
  const scale = Math.min(1, maxWidth / Math.max(image.width, 1))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.width * scale))
  canvas.height = Math.max(1, Math.round(image.height * scale))

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Não foi possível preparar a prévia para salvamento.')
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/webp', 0.8)
}

export const isStorageQuotaExceeded = (error: unknown) =>
  error instanceof DOMException &&
  (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
