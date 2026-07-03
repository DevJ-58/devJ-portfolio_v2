import { getIdToken } from 'firebase/auth'
import { auth } from '@/services/firebase'

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
  // derive id from name
  if (doc.name) {
    const parts = doc.name.split('/')
    parsed.id = parts[parts.length - 1]
  }
  return parsed
}

function toFsValue(val) {
  if (val === null || typeof val === 'undefined') return { nullValue: null }
  if (Array.isArray(val)) return { arrayValue: { values: val.map(v => toFsValue(v)) } }
  if (typeof val === 'string') return { stringValue: val }
  if (typeof val === 'boolean') return { booleanValue: val }
  if (typeof val === 'number') {
    // choose integer vs double
    if (Number.isInteger(val)) return { integerValue: String(val) }
    return { doubleValue: String(val) }
  }
  if (typeof val === 'object') {
    const fields = toFirestoreFields(val)
    return { mapValue: { fields } }
  }
  return { stringValue: String(val) }
}

function toFirestoreFields(obj) {
  const out = {}
  for (const k of Object.keys(obj)) {
    out[k] = toFsValue(obj[k])
  }
  return out
}

async function getToken() {
  try {
    const user = auth.currentUser
    if (!user) return null
    return await getIdToken(user)
  } catch (e) {
    console.warn('[portfolioAdmin] getToken failed', e)
    return null
  }
}

async function listerProjets() {
  try {
    const token = await getToken()
    if (!token) {
      console.warn('[portfolioAdmin] listerProjets: no auth token')
      return []
    }
    const res = await fetch(`${BASE_URL}/projets_portfolio`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      console.warn('[portfolioAdmin] listerProjets fetch failed', res.status)
      return []
    }
    const data = await res.json()
    const docs = data.documents || []
    const parsed = docs.map(parseFirestoreDoc)
    parsed.sort((a, b) => (Number(a.ordre || 0) - Number(b.ordre || 0)))
    return parsed
  } catch (e) {
    console.warn('[portfolioAdmin] listerProjets', e)
    return []
  }
}

async function creerProjet(donnees) {
  try {
    const token = await getToken()
    if (!token) {
      console.warn('[portfolioAdmin] creerProjet: no auth token')
      return null
    }
    const now = new Date().toISOString()
    const payload = {
      fields: toFirestoreFields({ ...donnees, created_at: now, updated_at: now }),
    }
    const res = await fetch(`${BASE_URL}/projets_portfolio`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.warn('[portfolioAdmin] creerProjet failed', res.status)
      return null
    }
    const data = await res.json()
    return parseFirestoreDoc(data)
  } catch (e) {
    console.warn('[portfolioAdmin] creerProjet', e)
    return null
  }
}

async function modifierProjet(id, donnees) {
  try {
    const token = await getToken()
    if (!token) {
      console.warn('[portfolioAdmin] modifierProjet: no auth token')
      return null
    }
    const now = new Date().toISOString()
    const payload = { fields: toFirestoreFields({ ...donnees, updated_at: now }) }
    const res = await fetch(`${BASE_URL}/projets_portfolio/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.warn('[portfolioAdmin] modifierProjet failed', res.status)
      return null
    }
    const data = await res.json()
    return parseFirestoreDoc(data)
  } catch (e) {
    console.warn('[portfolioAdmin] modifierProjet', e)
    return null
  }
}

async function supprimerProjet(id) {
  try {
    const token = await getToken()
    if (!token) {
      console.warn('[portfolioAdmin] supprimerProjet: no auth token')
      return false
    }
    const res = await fetch(`${BASE_URL}/projets_portfolio/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      console.warn('[portfolioAdmin] supprimerProjet failed', res.status)
      return false
    }
    return true
  } catch (e) {
    console.warn('[portfolioAdmin] supprimerProjet', e)
    return false
  }
}

/* Competences */
async function listerCompetences() {
  try {
    const token = await getToken()
    if (!token) {
      console.warn('[portfolioAdmin] listerCompetences: no auth token')
      return []
    }
    const res = await fetch(`${BASE_URL}/competences_portfolio`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      console.warn('[portfolioAdmin] listerCompetences fetch failed', res.status)
      return []
    }
    const data = await res.json()
    const docs = data.documents || []
    const parsed = docs.map(parseFirestoreDoc)
    parsed.sort((a, b) => (Number(a.ordre || 0) - Number(b.ordre || 0)))
    return parsed
  } catch (e) {
    console.warn('[portfolioAdmin] listerCompetences', e)
    return []
  }
}

async function creerCompetence(donnees) {
  try {
    const token = await getToken()
    if (!token) {
      console.warn('[portfolioAdmin] creerCompetence: no auth token')
      return null
    }
    const now = new Date().toISOString()
    const payload = { fields: toFirestoreFields({ ...donnees, created_at: now, updated_at: now }) }
    const res = await fetch(`${BASE_URL}/competences_portfolio`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.warn('[portfolioAdmin] creerCompetence failed', res.status)
      return null
    }
    const data = await res.json()
    return parseFirestoreDoc(data)
  } catch (e) {
    console.warn('[portfolioAdmin] creerCompetence', e)
    return null
  }
}

async function modifierCompetence(id, donnees) {
  try {
    const token = await getToken()
    if (!token) {
      console.warn('[portfolioAdmin] modifierCompetence: no auth token')
      return null
    }
    const now = new Date().toISOString()
    const payload = { fields: toFirestoreFields({ ...donnees, updated_at: now }) }
    const res = await fetch(`${BASE_URL}/competences_portfolio/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.warn('[portfolioAdmin] modifierCompetence failed', res.status)
      return null
    }
    const data = await res.json()
    return parseFirestoreDoc(data)
  } catch (e) {
    console.warn('[portfolioAdmin] modifierCompetence', e)
    return null
  }
}

async function supprimerCompetence(id) {
  try {
    const token = await getToken()
    if (!token) {
      console.warn('[portfolioAdmin] supprimerCompetence: no auth token')
      return false
    }
    const res = await fetch(`${BASE_URL}/competences_portfolio/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      console.warn('[portfolioAdmin] supprimerCompetence failed', res.status)
      return false
    }
    return true
  } catch (e) {
    console.warn('[portfolioAdmin] supprimerCompetence', e)
    return false
  }
}

export {
  listerProjets,
  creerProjet,
  modifierProjet,
  supprimerProjet,
  listerCompetences,
  creerCompetence,
  modifierCompetence,
  supprimerCompetence,
}
