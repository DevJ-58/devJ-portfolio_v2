/* global process */
// Fonction serveur Vercel : fait parler AXIS avec la voix ElevenLabs.
// La clé reste ici, côté serveur (variables d'environnement Vercel sans
// préfixe VITE_), le navigateur ne la voit jamais.
//
// Variables à définir dans Vercel :
//   ELEVENLABS_API_KEY   clé de l'API (obligatoire)
//   ELEVENLABS_VOICE_ID  identifiant de la voix (obligatoire)
//   ELEVENLABS_MODEL     facultatif, eleven_multilingual_v2 par défaut (le plus fidèle
//                        aux voix clonées ; eleven_flash_v2_5 = plus rapide, moins fidèle)
//   ELEVENLABS_MAX_CHARS facultatif, 1000 par défaut

const LIMITE_PAR_MINUTE = 12
const visites = new Map() // limite simple par adresse IP (par instance)

function tropDeDemandes(ip) {
  const maintenant = Date.now()
  const liste = (visites.get(ip) || []).filter((t) => maintenant - t < 60_000)
  liste.push(maintenant)
  visites.set(ip, liste)
  if (visites.size > 5000) visites.clear()
  return liste.length > LIMITE_PAR_MINUTE
}

// Seules les pages du site lui-même (ou le serveur local) peuvent appeler la voix
function origineAutorisee(req) {
  const origine = req.headers.origin || req.headers.referer || ''
  if (!origine) return false
  try {
    const hote = new URL(origine).host
    return hote === req.headers.host || /^localhost(:\d+)?$/.test(hote) || /^127\.0\.0\.1(:\d+)?$/.test(hote)
  } catch {
    return false
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const cle = process.env.ELEVENLABS_API_KEY
  const voix = process.env.ELEVENLABS_VOICE_ID

  // GET /api/voix : diagnostic sans révéler la clé (fin de l'identifiant de voix seulement)
  if (req.method === 'GET') return res.status(200).json({
    disponible: Boolean(cle && voix),
    voix: voix ? `…${voix.slice(-4)}` : null,
    modele: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2',
  })
  if (req.method !== 'POST') return res.status(405).json({ erreur: 'méthode' })
  if (!cle || !voix) return res.status(503).json({ erreur: 'voix non configurée' })
  if (!origineAutorisee(req)) return res.status(403).json({ erreur: 'origine' })

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'inconnu'
  if (tropDeDemandes(ip)) return res.status(429).json({ erreur: 'trop de demandes' })

  let corps = req.body
  if (typeof corps === 'string') { try { corps = JSON.parse(corps) } catch { corps = {} } }
  const texte = String(corps?.texte || '').trim()
  const max = Number(process.env.ELEVENLABS_MAX_CHARS) || 1000
  if (!texte) return res.status(400).json({ erreur: 'texte vide' })
  if (texte.length > max) return res.status(413).json({ erreur: 'texte trop long' })

  const modele = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2'
  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voix)}/with-timestamps?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': cle, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        text: texte,
        model_id: modele,
        ...(/v2_5|turbo/.test(modele) ? { language_code: 'fr' } : {}),
        voice_settings: {
          stability: Number(process.env.ELEVENLABS_STABILITY ?? 0.68),
          similarity_boost: Number(process.env.ELEVENLABS_SIMILARITY ?? 0.75),
          style: Number(process.env.ELEVENLABS_STYLE ?? 0),
          use_speaker_boost: process.env.ELEVENLABS_SPEAKER_BOOST !== 'false',
        },
      }),
    })
    if (!r.ok) {
      const detail = await r.text().catch(() => '')
      console.error('[voix] ElevenLabs', r.status, detail.slice(0, 300))
      return res.status(502).json({ erreur: 'ElevenLabs', statut: r.status })
    }
    const d = await r.json()
    const a = d.alignment || d.normalized_alignment || null
    return res.status(200).json({
      audio: d.audio_base64,
      alignement: a ? { caracteres: a.characters, debuts: a.character_start_times_seconds, fins: a.character_end_times_seconds } : null,
    })
  } catch (e) {
    console.error('[voix]', e)
    return res.status(500).json({ erreur: 'serveur' })
  }
}
