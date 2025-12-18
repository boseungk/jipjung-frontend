export const KRW_PER_MANWON = 10000

function toFiniteInteger(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return Math.trunc(numeric)
}

/**
 * 입력값이 "만원 단위"로 들어온 것으로 보이면 원 단위로 변환합니다.
 * - value가 maxManwon 이하이면 (만원)으로 간주: value * 10,000
 * - 그 외에는 이미 (원)으로 간주: value 그대로 반환
 */
export function toWonMaybe(value, maxManwon) {
  const intValue = Math.max(0, toFiniteInteger(value, 0))
  if (intValue <= maxManwon) {
    return intValue * KRW_PER_MANWON
  }
  return intValue
}

/**
 * 입력값이 "원 단위"로 들어온 것으로 보이면 만원 단위로 변환합니다.
 * - value가 maxManwon 초과이면 (원)으로 간주: round(value / 10,000)
 * - 그 외에는 이미 (만원)으로 간주: value 그대로 반환
 */
export function toManwonMaybe(value, maxManwon) {
  const intValue = Math.max(0, toFiniteInteger(value, 0))
  if (intValue > maxManwon) {
    return Math.round(intValue / KRW_PER_MANWON)
  }
  return intValue
}

