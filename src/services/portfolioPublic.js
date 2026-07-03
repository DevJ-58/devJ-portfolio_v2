const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

function parseValue(value) {
  if (!value) return null
  if ('stringValue' in value) return value.stringValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return Number(value.doubleValue)
  if ('booleanValue' in value) return value.booleanValue
  if ('nullValue' in value) return null
  if ('mapValue' in value) {
    const fields = value.mapValue.fields || {}
    const obj = {}
    for (const k of Object.keys(fields)) obj[k] = parseValue(fields[k])
    return obj
  }
  if ('arrayValue' in value) {
    const vals = value.arrayValue.values || []
    return vals.map(v => parseValue(v))
  }
  return null
}

function parseFirestoreDoc(doc) {
  if (!doc) return null
  const fields = doc.fields || {}
  const parsed = {}
  for (const key of Object.keys(fields)) {
    parsed[key] = parseValue(fields[key])
  }
  if (doc.name) {
    const parts = doc.name.split('/')
    parsed.id = parts[parts.length - 1]
  }
  return parsed
}

async function listerProjetsPublic() {
  try {
    const res = await fetch(`${BASE_URL}/projets_portfolio`)
    if (!res.ok) {
      console.warn('[portfolioPublic] listerProjetsPublic fetch failed', res.status)
      return []
    }
    const json = await res.json()
    const docs = json.documents || []
    const parsed = docs.map(parseFirestoreDoc)
    parsed.sort((a, b) => (Number(a.ordre || 0) - Number(b.ordre || 0)))
    return parsed
  } catch (e) {
    console.warn('[portfolioPublic] listerProjetsPublic', e)
    return []
  }
}

async function listerCompetencesPublic() {
  try {
    const res = await fetch(`${BASE_URL}/competences_portfolio`)
    if (!res.ok) {
      console.warn('[portfolioPublic] listerCompetencesPublic fetch failed', res.status)
      return []
    }
    const json = await res.json()
    const docs = json.documents || []
    const parsed = docs.map(parseFirestoreDoc)
    parsed.sort((a, b) => (Number(a.ordre || 0) - Number(b.ordre || 0)))
    return parsed
  } catch (e) {
    console.warn('[portfolioPublic] listerCompetencesPublic', e)
    return []
  }
}

export { listerProjetsPublic, listerCompetencesPublic }
