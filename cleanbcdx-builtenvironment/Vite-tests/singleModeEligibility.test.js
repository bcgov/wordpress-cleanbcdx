import { describe, it, expect } from 'vitest'
import {
  hasRelevantSingleModeIneligibleHeating,
  isGroundOrientedHeatPumpIneligible,
  shouldForceElectricHpError,
  shouldForceElectricHpwhError,
  shouldValidateRoomHeatingField,
  shouldValidateWaterHeatingField
} from '../blocks/vue-blocks/src/singleModeEligibility'

describe('single mode rebate-type scoped validation', () => {
  it('validates room heating on HP pages and ignores water-heating "other"', () => {
    const isHpwhPage = false
    expect(
      shouldValidateRoomHeatingField({
        isSingleMode: true,
        isHeatPumpWaterHeaterRebatePage: isHpwhPage
      })
    ).toBe(true)
    expect(
      shouldValidateWaterHeatingField({
        isSingleMode: true,
        isHeatPumpWaterHeaterRebatePage: isHpwhPage
      })
    ).toBe(false)
  })

  it('validates water heating on HPWH pages and ignores room-heating "other"', () => {
    const isHpwhPage = true
    expect(
      shouldValidateRoomHeatingField({
        isSingleMode: true,
        isHeatPumpWaterHeaterRebatePage: isHpwhPage
      })
    ).toBe(false)
    expect(
      shouldValidateWaterHeatingField({
        isSingleMode: true,
        isHeatPumpWaterHeaterRebatePage: isHpwhPage
      })
    ).toBe(true)
  })

  it('does not throw HP-specific forced error on insulation pages', () => {
    expect(
      shouldForceElectricHpError({
        isSingleMode: true,
        selectedHeatingSlug: 'electric-hp',
        pageRebateClass: 'insulation-rebates',
        pageRebateTypeText: 'Insulation rebates'
      })
    ).toBe(false)
  })

  it('does not throw HPWH-specific forced error on windows/doors pages', () => {
    expect(
      shouldForceElectricHpwhError({
        isSingleMode: true,
        selectedWaterHeatingSlug: 'electric-hpwh',
        pageRebateClass: 'window-and-door-rebates',
        pageRebateTypeText: 'Window and door rebates'
      })
    ).toBe(false)
  })

  it('MURB ineligible check only uses the relevant heating type for the page type', () => {
    expect(
      hasRelevantSingleModeIneligibleHeating({
        isHeatPumpWaterHeaterRebatePage: false,
        hasIneligibleHeating: true,
        hasIneligibleWaterHeating: false
      })
    ).toBe(true)
    expect(
      hasRelevantSingleModeIneligibleHeating({
        isHeatPumpWaterHeaterRebatePage: false,
        hasIneligibleHeating: false,
        hasIneligibleWaterHeating: true
      })
    ).toBe(false)
    expect(
      hasRelevantSingleModeIneligibleHeating({
        isHeatPumpWaterHeaterRebatePage: true,
        hasIneligibleHeating: true,
        hasIneligibleWaterHeating: false
      })
    ).toBe(false)
  })

  it('ground-oriented wood guard is scoped by rebate type (HP uses room, HPWH uses water)', () => {
    expect(
      isGroundOrientedHeatPumpIneligible({
        isGodBuilding: true,
        isHighTier: true,
        isHP: true,
        isHPWH: false,
        roomIsWood: true,
        waterIsWood: false
      })
    ).toBe(true)
    expect(
      isGroundOrientedHeatPumpIneligible({
        isGodBuilding: true,
        isHighTier: true,
        isHP: false,
        isHPWH: true,
        roomIsWood: true,
        waterIsWood: false
      })
    ).toBe(false)
    expect(
      isGroundOrientedHeatPumpIneligible({
        isGodBuilding: true,
        isHighTier: true,
        isHP: false,
        isHPWH: true,
        roomIsWood: false,
        waterIsWood: true
      })
    ).toBe(true)
  })
})
