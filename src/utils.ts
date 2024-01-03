/**
 * 比對兩物件內值是否都相等，值只能是簡單型別
 * @param ignoreKeys 忽略比對的鍵值
 */
export const isEqual = <T extends { [key: string]: string | number }>(
  o1: T,
  o2: T,
  ignoreKeys: string[] = []
) =>
  !Object.keys(o2)
    .filter((k) => !ignoreKeys.includes(k))
    .some((o2k) => o2[o2k] !== o1[o2k])

/**
 * @param idKey 兩物件的共通識別
 * @param aList 物件[] A
 * @param bList 物件[] B
 *
 * 從 B 中取出和 A 的差集 (物件內的值只能是簡單型別)
 * @returns {[Map<index of A&B, element of B>,element of B not in A]}
 */
export const getDiff = <T extends { [key: string]: string | number }>(
  aList: T[],
  bList: T[],
  idKey: string
) => {
  const spliceIdItemMap = new Map<number, T>()
  const appendItem = []
  for (let bIdx = 0; bIdx < bList.length; bIdx++) {
    const aIdx = aList.findIndex((x) => x[idKey] === bList[bIdx][idKey])
    if (aIdx === -1) {
      appendItem.push(bList[bIdx])
      continue
    }
    if (isEqual(bList[bIdx], aList[aIdx])) {
      continue
    }
    spliceIdItemMap.set(aIdx, bList[bIdx])
  }

  // console.log("updateDiff - spliceIdItemMap", spliceIdItemMap)
  // console.log("updateDiff - appendItem", appendItem)
  return [spliceIdItemMap, appendItem] as const
}

export const createColorScale = (domain: number[], rgbaRange: number[][]) => {
  const [domainMin, domainMax] = domain
  const [rangeMin, rangeMax] = rgbaRange
  return function (value: number) {
    const t = (value - domainMin) / (domainMax - domainMin)
    const r = Math.round(rangeMin[0] + t * (rangeMax[0] - rangeMin[0]))
    const g = Math.round(rangeMin[1] + t * (rangeMax[1] - rangeMin[1]))
    const b = Math.round(rangeMin[2] + t * (rangeMax[2] - rangeMin[2]))
    return `rgb(${r},${g},${b})`
  }
}
