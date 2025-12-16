const DEFAULT_THEME_CODE = 'CLASSIC'

const THEME_CODE_ALIASES = {
  CLASSIC: 'CLASSIC',
  HANOK: 'HANOK',
  SANTORINI: 'SANTORINI',
  // Common misspellings / variants
  SANTORINO: 'SANTORINI',
  SANTORIN: 'SANTORINI',
  SANTONI: 'SANTORINI',
  SANTONIO: 'SANTORINI',
  SANTORINI_HOUSE: 'SANTORINI',
  // Legacy / placeholder theme codes
  MODERN: 'CLASSIC',
  CASTLE: 'SANTORINI'
}

const THEME_FOLDER = {
  CLASSIC: 'classic',
  HANOK: 'hanok',
  SANTORINI: 'santorini'
}

const INTERIOR_FOLDER = {
  CLASSIC: 'classic_interior',
  HANOK: 'hanok_interior',
  SANTORINI: 'santorini_interior'
}

const INTERIOR_LAYERS = {
  CLASSIC: ['background', 'sofa', 'table', 'lamp', 'reze'],
  HANOK: ['background', 'sofa', 'bed', 'table', 'lamp1', 'lamp2', 'reze'],
  SANTORINI: ['background', 'sofa', 'bed', 'tables', 'reze']
}

const HOUSE_TOTAL_STAGES = 6
const FURNITURE_TOTAL_STAGES = 5

const ASSET_BASE_PATH = '/webp'

export function resolveThemeCode(rawCode) {
  const raw = typeof rawCode === 'string' ? rawCode.trim() : ''
  const upper = raw.toUpperCase()

  if (raw.includes('산토')) return 'SANTORINI'
  if (raw.includes('한옥')) return 'HANOK'
  if (raw.includes('클래식')) return 'CLASSIC'

  const tokens = upper.split(/[^A-Z0-9_]+/).filter(Boolean)
  for (const token of tokens) {
    if (token.startsWith('SANTOR') || token.startsWith('SANTO')) return 'SANTORINI'
    const aliased = THEME_CODE_ALIASES[token]
    if (aliased) return aliased
  }

  return DEFAULT_THEME_CODE
}

export function getExteriorStageUrl(themeCode, stage) {
  const resolved = resolveThemeCode(themeCode)
  const folder = THEME_FOLDER[resolved] || THEME_FOLDER[DEFAULT_THEME_CODE]
  const safeStage = Math.min(HOUSE_TOTAL_STAGES, Math.max(1, Number(stage) || 1))
  return `${ASSET_BASE_PATH}/${folder}/stage${safeStage}.webp`
}

export function getInteriorLayerUrls(themeCode) {
  const resolved = resolveThemeCode(themeCode)
  const folder = INTERIOR_FOLDER[resolved] || INTERIOR_FOLDER[DEFAULT_THEME_CODE]
  const layers = INTERIOR_LAYERS[resolved] || INTERIOR_LAYERS[DEFAULT_THEME_CODE]
  return layers.map((name) => ({
    id: name,
    url: `${ASSET_BASE_PATH}/${folder}/${name}.webp`
  }))
}

export function getInteriorNightUrl(themeCode) {
  const resolved = resolveThemeCode(themeCode)
  const folder = INTERIOR_FOLDER[resolved] || INTERIOR_FOLDER[DEFAULT_THEME_CODE]
  return `${ASSET_BASE_PATH}/${folder}/night.webp`
}

export function getInteriorVisibleLayerIds(layerIds, stage) {
  const safeStage = Math.min(FURNITURE_TOTAL_STAGES, Math.max(1, Number(stage) || 1))

  const groups = [
    ['background'],
    ['sofa', 'bed'],
    ['table', 'tables'],
    ['lamp', 'lamp1', 'lamp2'],
    ['reze']
  ]

  const included = new Set()
  for (let i = 0; i < safeStage; i++) {
    for (const key of groups[i]) {
      included.add(key)
    }
  }

  return new Set(layerIds.filter((id) => included.has(id)))
}

export const SHOWROOM_TOTAL_STAGES = {
  house: HOUSE_TOTAL_STAGES,
  furniture: FURNITURE_TOTAL_STAGES
}
