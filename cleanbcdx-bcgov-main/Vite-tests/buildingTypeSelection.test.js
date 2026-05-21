import { describe, expect, it } from 'vitest'
import { getRestoredBuildingTypeSlug } from '../blocks/vue-blocks/src/buildingTypeSelection'

const buildingTypeGroups = [
  {
    slug: 'ground-oriented-dwellings',
    name: 'Ground oriented dwellings',
    children: [
      { slug: 'single-detached-home', name: 'Single detached home' }
    ]
  },
  {
    slug: 'murb',
    name: 'MURB',
    children: [
      { slug: 'apartment-condo', name: 'Apartment / condo' }
    ]
  },
  {
    slug: 'other',
    name: 'Other',
    children: []
  }
]

describe('getRestoredBuildingTypeSlug', () => {
  it('ignores parent group slugs for single-mode building selects', () => {
    expect(
      getRestoredBuildingTypeSlug({
        type: 'ground-oriented-dwellings',
        group: 'ground-oriented-dwellings',
        mode: 'single',
        buildingTypeGroups
      })
    ).toBe('')
  })

  it('restores selectable child building types in single mode', () => {
    expect(
      getRestoredBuildingTypeSlug({
        type: 'single-detached-home',
        group: 'ground-oriented-dwellings',
        mode: 'single',
        buildingTypeGroups
      })
    ).toBe('single-detached-home')
  })

  it('keeps the standalone other option available outside single mode', () => {
    expect(
      getRestoredBuildingTypeSlug({
        type: 'other',
        group: 'other',
        mode: 'archive',
        buildingTypeGroups
      })
    ).toBe('other')
  })
})
