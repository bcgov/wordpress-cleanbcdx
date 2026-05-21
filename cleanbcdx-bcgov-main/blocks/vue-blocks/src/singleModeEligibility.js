const HPWH_REBATE_SLUG = 'heat-pump-water-heater-rebates'

const normalizeText = (value) => String(value || '').toLowerCase()

export const isInsulationOrWindowsPage = (pageRebateTypeText = '') => {
  const text = normalizeText(pageRebateTypeText)
  return text.includes('insulation') || text.includes('window') || text.includes('door')
}

export const isHeatPumpRebatePage = ({
  pageRebateClass = '',
  pageRebateTypeText = ''
}) => {
  const pageClass = normalizeText(pageRebateClass)
  const pageType = normalizeText(pageRebateTypeText)
  return (
    pageClass === 'heat-pump-rebates' ||
    (pageType.includes('heat pump') && !pageType.includes('water heater'))
  )
}

export const isHeatPumpWaterHeaterRebatePage = ({
  pageRebateClass = '',
  pageRebateTypeText = '',
  hpwhRebateSlug = HPWH_REBATE_SLUG
}) => {
  const pageClass = normalizeText(pageRebateClass)
  const pageType = normalizeText(pageRebateTypeText)
  return pageClass === hpwhRebateSlug || pageType.includes('heat pump water heater')
}

export const shouldValidateRoomHeatingField = ({
  isSingleMode = false,
  isHeatPumpWaterHeaterRebatePage: isHpwhPage = false
}) => !isSingleMode || !isHpwhPage

export const shouldValidateWaterHeatingField = ({
  isSingleMode = false,
  isHeatPumpWaterHeaterRebatePage: isHpwhPage = false
}) => !isSingleMode || isHpwhPage

export const shouldForceElectricHpError = ({
  isSingleMode = false,
  selectedHeatingSlug = '',
  pageRebateClass = '',
  pageRebateTypeText = ''
}) => {
  return (
    isSingleMode &&
    selectedHeatingSlug === 'electric-hp' &&
    !isInsulationOrWindowsPage(pageRebateTypeText) &&
    isHeatPumpRebatePage({ pageRebateClass, pageRebateTypeText })
  )
}

export const shouldForceElectricHpwhError = ({
  isSingleMode = false,
  selectedWaterHeatingSlug = '',
  pageRebateClass = '',
  pageRebateTypeText = ''
}) => {
  return (
    isSingleMode &&
    selectedWaterHeatingSlug === 'electric-hpwh' &&
    !isInsulationOrWindowsPage(pageRebateTypeText) &&
    isHeatPumpWaterHeaterRebatePage({ pageRebateClass, pageRebateTypeText })
  )
}

export const hasRelevantSingleModeIneligibleHeating = ({
  isHeatPumpWaterHeaterRebatePage: isHpwhPage = false,
  hasIneligibleHeating = false,
  hasIneligibleWaterHeating = false
}) => (isHpwhPage ? hasIneligibleWaterHeating : hasIneligibleHeating)

export const isGroundOrientedHeatPumpIneligible = ({
  isGodBuilding = false,
  isHighTier = false,
  isHP = false,
  isHPWH = false,
  roomIsWood = false,
  waterIsWood = false
}) =>
  isGodBuilding &&
  isHighTier &&
  ((isHP && roomIsWood) || (isHPWH && waterIsWood))

