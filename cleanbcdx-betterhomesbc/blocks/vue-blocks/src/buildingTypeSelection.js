const normalizeSlug = (value) => String(value || '').trim()

export const getRestoredBuildingTypeSlug = ({
  type = '',
  group = '',
  mode = 'archive',
  buildingTypeGroups = []
}) => {
  const normalizedType = normalizeSlug(type)
  const normalizedGroup = normalizeSlug(group)
  const childSlugs = new Set()
  let allowOtherGroupOption = false

  for (const buildingGroup of buildingTypeGroups) {
    const groupSlug = normalizeSlug(buildingGroup?.slug)

    if (mode !== 'single' && groupSlug === 'other') {
      allowOtherGroupOption = true
    }

    for (const child of Array.isArray(buildingGroup?.children) ? buildingGroup.children : []) {
      const childSlug = normalizeSlug(child?.slug)
      if (childSlug) childSlugs.add(childSlug)
    }
  }

  if (normalizedType && childSlugs.has(normalizedType)) {
    return normalizedType
  }

  if (allowOtherGroupOption && (normalizedType === 'other' || normalizedGroup === 'other')) {
    return 'other'
  }

  return ''
}
