import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/services/firebase'

// Ne pas laisser le SDK réessayer pendant des minutes si le stockage
// n'est pas disponible : on bascule vite sur l'image intégrée.
storage.maxUploadRetryTime = 15000
storage.maxOperationRetryTime = 15000

const TYPES_ACCEPTES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
export const TAILLE_MAX_FICHIER = 15 * 1024 * 1024 // 15 Mo avant compression

function chargerImage(fichier) {
  return new Promise((resoudre, rejeter) => {
    const url = URL.createObjectURL(fichier)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resoudre(img) }
    img.onerror = () => { URL.revokeObjectURL(url); rejeter(new Error('Image illisible')) }
    img.src = url
  })
}

// Redimensionne et compresse l'image dans le navigateur (WebP)
export async function compresserImage(fichier, { max = 1600, qualite = 0.82 } = {}) {
  const img = await chargerImage(fichier)
  const echelle = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
  const l = Math.round(img.naturalWidth * echelle)
  const h = Math.round(img.naturalHeight * echelle)
  const canvas = document.createElement('canvas')
  canvas.width = l
  canvas.height = h
  canvas.getContext('2d').drawImage(img, 0, 0, l, h)
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', qualite))
  if (!blob) throw new Error('Compression impossible')
  return blob
}

const versDataUrl = (blob) => new Promise((resoudre, rejeter) => {
  const lecteur = new FileReader()
  lecteur.onload = () => resoudre(lecteur.result)
  lecteur.onerror = () => rejeter(lecteur.error)
  lecteur.readAsDataURL(blob)
})

export function verifierFichier(fichier) {
  if (!fichier) return 'Aucun fichier choisi.'
  if (!TYPES_ACCEPTES.includes(fichier.type)) return 'Format non pris en charge (JPG, PNG, WebP, GIF ou AVIF).'
  if (fichier.size > TAILLE_MAX_FICHIER) return 'Fichier trop lourd (15 Mo maximum).'
  return null
}

// Téléverse une image et renvoie son adresse.
// 1. Firebase Storage (adresse publique légère)
// 2. Sinon, image compressée intégrée au document (data URL < 700 Ko)
export async function televerserImage(fichier, dossier = 'projets') {
  const erreur = verifierFichier(fichier)
  if (erreur) throw new Error(erreur)

  const blob = await compresserImage(fichier)
  try {
    const nom = `${dossier}/${Date.now()}-${fichier.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase()}.webp`
    const cible = ref(storage, nom)
    await uploadBytes(cible, blob, { contentType: 'image/webp', cacheControl: 'public,max-age=31536000' })
    return { url: await getDownloadURL(cible), mode: 'stockage' }
  } catch (e) {
    console.warn('[televersement] Storage indisponible, image intégrée au projet', e?.code || e)
    for (const [max, qualite] of [[1200, 0.78], [1000, 0.7], [800, 0.62]]) {
      const petit = await compresserImage(fichier, { max, qualite })
      const dataUrl = await versDataUrl(petit)
      if (dataUrl.length < 700_000) return { url: dataUrl, mode: 'integre' }
    }
    throw new Error("Image trop lourde pour être intégrée. Active Firebase Storage ou choisis une image plus légère.", { cause: e })
  }
}
