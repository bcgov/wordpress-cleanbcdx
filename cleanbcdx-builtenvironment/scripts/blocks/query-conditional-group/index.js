import { registerBlockType } from '@wordpress/blocks'
import { useBlockProps, InspectorControls, InnerBlocks } from '@wordpress/block-editor'
import { PanelBody, SelectControl, TextControl, Button, ToggleControl } from '@wordpress/components'
import { Fragment, useEffect } from '@wordpress/element'

const OPERATORS = [
  { label: 'Equals', value: 'equals' },
  { label: 'Not Equals', value: 'notEquals' },
  { label: 'Contains', value: 'contains' },
  { label: 'Starts With', value: 'startsWith' },
  { label: 'Ends With', value: 'endsWith' },
  { label: 'Regex Match', value: 'regex' },
  { label: 'Exists (any value)', value: 'exists' },
  { label: 'Not Exists', value: 'notExists' },
  { label: 'One of (equals any)', value: 'in' },
  { label: 'None of (not equals all)', value: 'notIn' },
  { label: 'Contains any', value: 'containsAny' },
  { label: 'Contains all', value: 'containsAll' },
]

const isMultiValueOp = (op) => ['in', 'notIn', 'containsAny', 'containsAll'].includes(op)

const OP_LABEL = {
  equals: '=',
  notEquals: '≠',
  contains: 'contains',
  startsWith: 'startsWith',
  endsWith: 'endsWith',
  regex: 'matches',
  exists: 'exists',
  notExists: 'notExists',
  in: 'in',
  notIn: 'notIn',
  containsAny: 'containsAny',
  containsAll: 'containsAll',
}

const fmtList = (arr) => arr.filter(Boolean).join(', ')

const summarizeRule = (r = {}) => {
  const key = (r.key || '').trim() || '(key?)'
  const op = r.operator || 'equals'

  if ('exists' === op) return `${key} exists`
  if ('notExists' === op) return `${key} notExists`

  if (isMultiValueOp(op)) {
    const values =
      (Array.isArray(r.values) && r.values.length)
        ? r.values
        : ('string' === typeof r.valueCSV ? r.valueCSV.split(',').map(s => s.trim()).filter(Boolean) : [])
    return `${key} ${OP_LABEL[op] || op} [${fmtList(values)}]`
  }

  const value = (r.value ?? '').toString().trim() || '(value?)'
  return `${key} ${OP_LABEL[op] || op} ${value}`
}

const summarizeGroup = (g = {}) => {
  const rules = Array.isArray(g.rules) ? g.rules : []
  const glue = ` ${g.logic || 'AND'} `
  const body = rules.length ? rules.map(summarizeRule).join(glue) : '(no rules)'
  const wrapped = `(${body})`
  return g.invert ? `NOT ${wrapped}` : wrapped
}

const buildSummary = (attrs = {}) => {
  const {
    // grouped
    groups = [],
    groupLogic = 'OR',
    invertGroups = false,
    // legacy
    rules = [],
    logic = 'AND',
    invert = false,
  } = attrs

  // Prefer grouped model if present
  const hasGroups = Array.isArray(groups) && groups.length > 0

  let expr = ''

  if (hasGroups) {
    const glue = ` ${groupLogic || 'OR'} `
    expr = groups.map(summarizeGroup).join(glue) || ''
    if (invertGroups && expr) expr = `NOT (${expr})`
    return expr || '(no groups)'
  }

  // Legacy fallback (single implicit group)
  const legacyGroup = {
    rules: Array.isArray(rules) ? rules : [],
    logic: logic || 'AND',
    invert: !!invert,
  }

  expr = summarizeGroup(legacyGroup)
  return expr || '(no rules)'
}

const makeEmptyRule = () => ({
  key: '',
  value: '',
  values: [],
  valueCSV: '',
  operator: 'equals',
  caseSensitive: false
})

const makeEmptyGroup = () => ({
  name: '',
  rules: [makeEmptyRule()],
  logic: 'AND',
  invert: false
})

registerBlockType('bcgovcleanbc/query-conditional-group', {
  edit: ({ attributes, setAttributes }) => {
    const summaryLine = buildSummary(attributes)
    const {
      // New grouped model
      groups = [],
      groupLogic = 'OR',
      invertGroups = false,

      // Legacy model (kept for existing content)
      rules = [],
      logic = 'AND',
      invert = false,

      // Shared settings
      caseSensitive,
      clientSideCheck,
      hideUntilJs
    } = attributes

    // Back-compat migration in editor:
    // If no groups exist but legacy rules exist, wrap them into a single group.
    useEffect(() => {
      if ((!groups || 0 === groups.length) && Array.isArray(rules) && rules.length > 0) {
        setAttributes({
          groups: [
            {
              rules: rules,
              logic: logic || 'AND',
              invert: !!invert
            }
          ],
          // Keep legacy attrs as-is; frontend/PHP will prefer groups when present.
        })
      }
      // If nothing exists at all, start with one empty group
      if ((!groups || 0 === groups.length) && (!rules || 0 === rules.length)) {
        setAttributes({ groups: [makeEmptyGroup()] })
      }
    }, [])

    const blockProps = useBlockProps({
      className: 'query-conditional-group-block',
      style: hideUntilJs ? { outline: '1px dashed lightgray', outlineOffset: '0.5rem', marginBlock: '1rem' } : undefined
    })

    const setGroup = (groupIndex, patch) => {
      const next = [...(groups || [])]
      next[groupIndex] = { ...(next[groupIndex] || makeEmptyGroup()), ...patch }
      setAttributes({ groups: next })
    }

    const addGroup = () => {
      setAttributes({ groups: [...(groups || []), makeEmptyGroup()] })
    }

    const removeGroup = (groupIndex) => {
      const next = [...(groups || [])]
      next.splice(groupIndex, 1)
      setAttributes({ groups: next.length ? next : [makeEmptyGroup()] })
    }

    const addRuleToGroup = (groupIndex) => {
      const g = groups[groupIndex] || makeEmptyGroup()
      const nextRules = [...(g.rules || []), makeEmptyRule()]
      setGroup(groupIndex, { rules: nextRules })
    }

    const removeRuleFromGroup = (groupIndex, ruleIndex) => {
      const g = groups[groupIndex] || makeEmptyGroup()
      const nextRules = [...(g.rules || [])]
      nextRules.splice(ruleIndex, 1)
      setGroup(groupIndex, { rules: nextRules.length ? nextRules : [makeEmptyRule()] })
    }

    const updateRule = (groupIndex, ruleIndex, field, value) => {
      const g = groups[groupIndex] || makeEmptyGroup()
      const nextRules = [...(g.rules || [])]
      nextRules[ruleIndex] = { ...(nextRules[ruleIndex] || makeEmptyRule()), [field]: value }
      setGroup(groupIndex, { rules: nextRules })
    }

    const updateRuleCSV = (groupIndex, ruleIndex, csv) => {
      const values = csv
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      updateRule(groupIndex, ruleIndex, 'values', values)
      updateRule(groupIndex, ruleIndex, 'valueCSV', csv)
    }

    return (
      <Fragment>
        <InspectorControls>
          <PanelBody title="Query Rules">
            {/* Global group logic + invert */}
            <div style={{ border: '1px solid #eee', padding: '8px', marginBottom: '12px', background: '#fafafa' }}>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: '4px' }}>
                Condition Summary
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                {summaryLine}
              </div>
            </div>
            <div style={{ border: '1px solid #ddd', padding: '8px', marginBottom: '12px' }}>
              <SelectControl
                label="Logic between groups"
                value={groupLogic || 'OR'}
                options={[
                  { label: 'OR (any group matches)', value: 'OR' },
                  { label: 'AND (all groups must match)', value: 'AND' }
                ]}
                onChange={(val) => setAttributes({ groupLogic: val })}
              />
              <ToggleControl
                label="Invert (apply to whole block)"
                checked={!!invertGroups}
                onChange={(val) => setAttributes({ invertGroups: val })}
              />
            </div>

            {/* Groups */}
            {(groups || []).map((g, gi) => (
              <div key={gi} style={{ border: '1px solid #bbb', padding: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong>Group {gi + 1}</strong>
                  <Button isLink isDestructive onClick={() => removeGroup(gi)}>Remove group</Button>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <SelectControl
                    label="Logic between rules (this group)"
                    value={g.logic || 'AND'}
                    options={[
                      { label: 'AND (all rules must match)', value: 'AND' },
                      { label: 'OR (any rule matches)', value: 'OR' }
                    ]}
                    onChange={(val) => setGroup(gi, { logic: val })}
                  />
                  <ToggleControl
                    label="Invert (this group)"
                    checked={!!g.invert}
                    onChange={(val) => setGroup(gi, { invert: val })}
                  />
                </div>

                <div style={{ marginTop: '10px' }}>
                  {(g.rules || []).map((r, ri) => (
                    <div key={ri} style={{ border: '1px solid #ddd', padding: '8px', marginBottom: '8px' }}>
                      <TextControl
                        label="Query key"
                        value={r.key || ''}
                        onChange={(val) => updateRule(gi, ri, 'key', val)}
                      />

                      <SelectControl
                        label="Operator"
                        value={r.operator || 'equals'}
                        options={OPERATORS}
                        onChange={(val) => updateRule(gi, ri, 'operator', val)}
                      />

                      {(() => {
                        const op = r.operator || 'equals'
                        if ('exists' === op || 'notExists' === op) return null

                        if (isMultiValueOp(op)) {
                          return (
                            <TextControl
                              label="Values (comma-separated)"
                              help="Example: HRR, ESP-3, ESP-4"
                              value={r.valueCSV ?? (r.values?.join(', ') || '')}
                              onChange={(csv) => updateRuleCSV(gi, ri, csv)}
                            />
                          )
                        }

                        return (
                          <TextControl
                            label="Required value"
                            value={r.value || ''}
                            onChange={(val) => updateRule(gi, ri, 'value', val)}
                          />
                        )
                      })()}

                      <ToggleControl
                        label="Case Sensitive (rule override)"
                        checked={!!r.caseSensitive}
                        onChange={(val) => updateRule(gi, ri, 'caseSensitive', val)}
                      />

                      <div style={{ textAlign: 'right' }}>
                        <Button isLink isDestructive onClick={() => removeRuleFromGroup(gi, ri)}>Remove rule</Button>
                      </div>
                    </div>
                  ))}

                  <Button variant="secondary" onClick={() => addRuleToGroup(gi)}>Add rule</Button>
                </div>
              </div>
            ))}

            <Button variant="primary" onClick={addGroup}>Add group</Button>
          </PanelBody>

          <PanelBody title="Settings" initialOpen={false}>
            <ToggleControl
              label="Case Sensitive (Global Default)"
              checked={!!caseSensitive}
              onChange={(val) => setAttributes({ caseSensitive: val })}
            />
            <ToggleControl
              label="Enable Client-Side Check"
              checked={!!clientSideCheck}
              onChange={(val) => setAttributes({ clientSideCheck: val })}
            />
            <ToggleControl
              label="Show Editor Outline/Hint"
              checked={!!hideUntilJs}
              onChange={(val) => setAttributes({ hideUntilJs: val })}
            />
          </PanelBody>
        </InspectorControls>

        <div {...blockProps}>
          <div style={ hideUntilJs ? { fontSize: '12px', color: '#aaa', marginBlock: '8px' } : { display: 'none' } }>
            CleanBC DX Conditional content: will only render if query rules match.
          </div>
          <InnerBlocks templateLock={false} />
        </div>
      </Fragment>
    )
  },
  save: () => <InnerBlocks.Content />
})
