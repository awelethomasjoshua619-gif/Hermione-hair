const productImageAliases = {
  'hair-growth-cream.png': 'herbal-growth-cream.png',
  'WhatsApp Image 2026-06-18 at 23.28.23.jpeg': 'herbal-growth-cream.png',
}

const localProductImages = new Set([
  'anti-dandruff-cream.png',
  'conditioner-velvet-curls.png',
  'deep-conditioner.png',
  'edge-elixir.svg',
  'edge-growth-cream.png',
  'growth-serum.svg',
  'hair-butter.png',
  'herbal-growth-cream.png',
  'IMG_3525.PNG',
  'leave-in-conditioner.png',
  'leave-in.svg',
  'moisture-mask.svg',
  'root-revival-oil.png',
  'scalp-tonic.svg',
  'shampoo-herbal-cleanse.png',
  'shampoo.svg',
  'tangle-tamer.png',
])
export const productImage = (fileName) => {
  const basePath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${basePath}/products/${fileName}`
}

export const fallbackProductImage = productImage('hair-butter.png')

export const normalizeProductImageName = (image) => {
  if (!image) return ''
  const cleanImage = decodeURIComponent(String(image)).trim().replace(/\\/g, '/')
  const fileName = cleanImage.split('/').filter(Boolean).pop() || cleanImage
  return productImageAliases[fileName] || fileName
}

export const resolveProductImage = (image) => {
  if (!image) return fallbackProductImage
  const imageValue = String(image).trim()

  if (/^https?:\/\//i.test(imageValue)) return imageValue

  const normalizedImage = normalizeProductImageName(imageValue)
  if (localProductImages.has(normalizedImage)) return productImage(normalizedImage)

  return fallbackProductImage
}

export const handleProductImageError = (event) => {
  if (event.currentTarget.src.endsWith('/hair-butter.png')) return
  event.currentTarget.src = fallbackProductImage
}
