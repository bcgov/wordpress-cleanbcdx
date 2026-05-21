document.addEventListener('DOMContentLoaded', () => {
  const qs = new URLSearchParams(window.location.search)

  // Map key -> array of values (handles ?k=a&k=b)
  const params = {}
  for (const [k, v] of qs.entries()) {
    (params[k] ||= []).push(v)
  }
  const hasParam = (key) => Object.prototype.hasOwnProperty.call(params, key)

  const toArray = (v) => Array.isArray(v) ? v : (undefined === v || null === v || '' === v ? [] : [v])
  const splitCsv = (s) => ('string' === typeof s ? s.split(',').map(t => t.trim()).filter(Boolean) : [])
  const normalizeArrayCase = (arr, caseSensitive) => caseSensitive ? arr : arr.map(v => ('string' === typeof v ? v.toLowerCase() : v))

  document.querySelectorAll('.query-conditional-group-block').forEach(block => {
    const caseSensitiveDefault = 'true' === block.getAttribute('data-case')

    const evaluateRule = (rule) => {
      const key = (rule.key || '').trim()
      let operator = (rule.operator || 'equals')
      if ('oneOf' === operator) operator = 'in'
      if ('noneOf' === operator) operator = 'notIn'

      const ruleCase = (rule.caseSensitive ?? caseSensitiveDefault)

      const paramVals = normalizeArrayCase(toArray(params[key]), ruleCase)

      const rawVal = rule.value ?? ''
      const compareVal = !ruleCase && 'string' === typeof rawVal ? rawVal.toLowerCase() : rawVal

      let multiVals = rule.values && Array.isArray(rule.values) ? rule.values : []
      if (!multiVals.length) {
        multiVals = splitCsv(rule.valueCSV ?? rule.value ?? '')
      }
      multiVals = normalizeArrayCase(multiVals, ruleCase)

      switch (operator) {
        case 'equals':
          return paramVals.some(p => p === compareVal)

        case 'notEquals':
          return 0 === paramVals.length || paramVals.every(p => p !== compareVal)

        case 'contains':
          return paramVals.some(p => 'string' === typeof p && 'string' === typeof compareVal && p.includes(compareVal))

        case 'startsWith':
          return paramVals.some(p => 'string' === typeof p && 'string' === typeof compareVal && p.startsWith(compareVal))

        case 'endsWith':
          return paramVals.some(p => 'string' === typeof p && 'string' === typeof compareVal && p.endsWith(compareVal))

        case 'regex':
          if (!paramVals.length || 'string' !== typeof compareVal) return false
          try {
            const re = new RegExp(compareVal)
            return paramVals.some(p => 'string' === typeof p && re.test(p))
          } catch { return false }

        case 'exists':
          return hasParam(key)

        case 'notExists':
          return !hasParam(key)

        case 'in':
          if (!multiVals.length) return false
          return paramVals.some(p => multiVals.includes(p))

        case 'notIn':
          if (!multiVals.length) return true
          return 0 === paramVals.length || paramVals.every(p => !multiVals.includes(p))

        case 'containsAny':
          if (!multiVals.length) return false
          return paramVals.some(p => multiVals.some(v => 'string' === typeof p && 'string' === typeof v && p.includes(v)))

        case 'containsAll':
          if (!multiVals.length) return false
          return multiVals.every(v => paramVals.some(p => 'string' === typeof p && 'string' === typeof v && p.includes(v)))

        default:
          return false
      }
    }

    const evaluateRuleSet = (rules, logic) => {
      if (!Array.isArray(rules) || 0 === rules.length) return false
      return ('OR' === logic) ? rules.some(evaluateRule) : rules.every(evaluateRule)
    }

    const evaluateGroup = (group) => {
      const rules = group?.rules || []
      const logic = group?.logic || 'AND'
      const invert = !!group?.invert

      let matches = evaluateRuleSet(rules, logic)
      if (invert) matches = !matches
      return matches
    }

    // Prefer new grouped payload if present.
    const groupsAttr = block.getAttribute('data-groups')
    const groupLogic = block.getAttribute('data-group-logic') || 'OR'
    const invertGroups = 'true' === block.getAttribute('data-invert-groups')

    let matches = false

    if (groupsAttr) {
      const groups = JSON.parse(groupsAttr || '[]')
      if (Array.isArray(groups) && groups.length > 0) {
        matches = ('AND' === groupLogic) ? groups.every(evaluateGroup) : groups.some(evaluateGroup)
      } else {
        matches = false
      }
      if (invertGroups) matches = !matches
    } else {
      // Legacy fallback
      const rules = JSON.parse(block.getAttribute('data-rules') || '[]')
      const logic = block.getAttribute('data-logic') || 'AND'
      const invert = 'true' === block.getAttribute('data-invert')

      matches = evaluateRuleSet(rules, logic)
      if (invert) matches = !matches
    }

    block.style.display = matches ? '' : 'none'
    block.setAttribute('aria-hidden', matches ? 'false' : 'true')
  })
})
