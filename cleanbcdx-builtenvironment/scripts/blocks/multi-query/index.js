import { registerBlockType } from '@wordpress/blocks';
import {
  useBlockProps,
  InspectorControls,
  RichText,
  BlockControls,
  AlignmentToolbar,
} from '@wordpress/block-editor';
import {
  PanelBody,
  TextControl,
  Button,
  ToggleControl,
  SelectControl,
} from '@wordpress/components';
import { Fragment, useState, useEffect, useRef } from '@wordpress/element';

const OPERATORS = [
  { label: 'Equals', value: 'equals' },
  { label: 'Not Equals', value: 'notEquals' },
  { label: 'Contains', value: 'contains' },
  { label: 'Does NOT Contain', value: 'notContains' },
  { label: 'Starts With', value: 'startsWith' },
  { label: 'Ends With', value: 'endsWith' },
  { label: 'Exists (any value)', value: 'exists' },
  { label: 'Not Exists', value: 'notExists' },
];

const DEFAULT_RULE = () => ({ value: '', operator: 'equals' });

const evaluateRule = (operator, requiredValue, actualValue) => {
  switch (operator) {
    case 'equals': return actualValue === requiredValue;
    case 'notEquals': return actualValue !== requiredValue;
    case 'contains': return (actualValue ?? '').includes(requiredValue ?? '');
    case 'notContains': return !(actualValue ?? '').includes(requiredValue ?? '');
    case 'startsWith': return (actualValue ?? '').startsWith(requiredValue ?? '');
    case 'endsWith': return (actualValue ?? '').endsWith(requiredValue ?? '');
    case 'exists': return undefined !== actualValue && null !== actualValue && '' !== `${actualValue}`;
    case 'notExists': return undefined === actualValue || null === actualValue || '' === `${actualValue}`;
    default: return false;
  }
};

registerBlockType('bcgovcleanbc/multi-query-content', {
  edit: ({ attributes, setAttributes }) => {
    const {
      placeholderText,
      fallbackText,
      paramKeys,
      combinations,
      previewMode,
      previewValues,
      useOrLogic,
      useParamValueDirect,
      alignment = 'left',
    } = attributes;

    const blockProps = useBlockProps({ style: { textAlign: alignment } });

    // --- Helpers ------------------------------------------------------------
    const normalizeCombinations = (keys, combos) => {
      return (combos || []).map((combo) => {
        const next = {};
        keys.forEach((k) => {
          const current = combo?.[k];
          if (current && 'object' === typeof current && 'value' in current) {
            next[k] = { value: current.value ?? '', operator: current.operator || 'equals' };
          } else if ('string' === typeof current) {
            next[k] = { value: current, operator: 'equals' };
          } else {
            next[k] = DEFAULT_RULE();
          }
        });
        next.value = combo?.value ?? '';
        return next;
      });
    };

    const normalizedCombinations = normalizeCombinations(paramKeys, combinations);

    // --- Focus-safe PARAM KEY editing ---------------------------------------
    const [localParamKeys, setLocalParamKeys] = useState(paramKeys);
    const debounceRef = useRef(null);

    useEffect(() => {
      setLocalParamKeys(paramKeys);
    }, [paramKeys]);

    const commitParamKeys = (nextKeys) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setAttributes({ paramKeys: nextKeys });
      }, 300);
    };

    const updateKey = (index, newKey) => {
      const oldKeys = [...localParamKeys];
      const updatedKeys = [...localParamKeys];
      updatedKeys[index] = newKey;

      const newCombinations = normalizedCombinations.map((combo) => {
        const next = {};
        updatedKeys.forEach((k, i) => {
          const sourceKey = oldKeys[i];
          const existing = combo[sourceKey];
          next[k] = existing ? { ...existing } : DEFAULT_RULE();
        });
        next.value = combo.value ?? '';
        return next;
      });

      const newPreview = {};
      updatedKeys.forEach((k, i) => {
        const sourceKey = oldKeys[i];
        if (sourceKey && Object.prototype.hasOwnProperty.call(previewValues, sourceKey)) {
          newPreview[k] = previewValues[sourceKey];
        } else {
          newPreview[k] = '';
        }
      });

      setLocalParamKeys(updatedKeys);
      commitParamKeys(updatedKeys);
      setAttributes({
        combinations: newCombinations,
        previewValues: newPreview,
      });
    };

    const addKey = () => {
      const updatedKeys = [...localParamKeys, ''];
      setLocalParamKeys(updatedKeys);
      commitParamKeys(updatedKeys);

      const newCombinations = normalizedCombinations.map((combo) => {
        const next = { ...combo };
        next[''] = DEFAULT_RULE();
        return next;
      });

      setAttributes({ combinations: newCombinations });
    };

    const removeKey = (index) => {
      const updatedKeys = [...localParamKeys];
      const removedKey = updatedKeys.splice(index, 1)[0];

      const updatedCombinations = normalizedCombinations.map((combo) => {
        const next = { ...combo };
        delete next[removedKey];
        return next;
      });

      const updatedPreview = { ...previewValues };
      delete updatedPreview[removedKey];

      setLocalParamKeys(updatedKeys);
      commitParamKeys(updatedKeys);
      setAttributes({
        combinations: updatedCombinations,
        previewValues: updatedPreview,
      });
    };

    // --- Other updaters -----------------------------------------------------
    const updatePreviewValue = (key, value) => {
      setAttributes({ previewValues: { ...previewValues, [key]: value } });
    };

    const updateComboRule = (comboIndex, key, field, value) => {
      const updated = normalizedCombinations.map((combo, i) => {
        if (i !== comboIndex) return combo;
        const currentRule = combo[key] ?? DEFAULT_RULE();
        return {
          ...combo,
          [key]: { ...currentRule, [field]: value },
        };
      });
      setAttributes({ combinations: updated });
    };

    const updateComboValue = (comboIndex, value) => {
      const updated = normalizedCombinations.map((combo, i) => {
        if (i !== comboIndex) return combo;
        return { ...combo, value };
      });
      setAttributes({ combinations: updated });
    };

    const addCombo = () => {
      const newCombo = Object.fromEntries(localParamKeys.map((k) => [k, DEFAULT_RULE()]));
      newCombo.value = '';
      setAttributes({ combinations: [...normalizedCombinations, newCombo] });
    };

    const removeCombo = (index) => {
      const updated = normalizedCombinations.slice();
      updated.splice(index, 1);
      setAttributes({ combinations: updated });
    };

    // --- Matching logic (preview) -------------------------------------------
    const doesComboMatchPreview = (combo) => {
      if (0 === localParamKeys.length) return false;
      const evals = localParamKeys.map((key) => {
        const rule = combo[key] ?? DEFAULT_RULE();
        const actual = previewValues[key];
        return evaluateRule(rule.operator, rule.value, actual);
      });
      return useOrLogic ? evals.some(Boolean) : evals.every(Boolean);
    };

    const matchIndex = normalizedCombinations.findIndex(doesComboMatchPreview);
    let simulatedOutput = placeholderText;

    if (previewMode) {
      if (useParamValueDirect) {
        const placeholderMatches = placeholderText.match(/{{\s*value(?:_\d+)?\s*}}/g) || [];
        const requiredIndexes = [
          ...new Set(
            placeholderMatches.map((match) => {
              const numberMatch = match.match(/\d+/);
              return numberMatch ? parseInt(numberMatch[0], 10) - 1 : 0;
            })
          ),
        ];
        const allPresent = requiredIndexes.every((i) => {
          const key = localParamKeys[i];
          return key && (previewValues[key] ?? '') !== '';
        });

        if (allPresent) {
          simulatedOutput = placeholderText;
          requiredIndexes.forEach((i) => {
            const key = localParamKeys[i];
            const value = previewValues[key] || '';
            simulatedOutput = simulatedOutput.replace(
              new RegExp(`{{\\s*value_${i + 1}\\s*}}`, 'g'),
              value
            );
            if (0 === i) {
              simulatedOutput = simulatedOutput.replace(/{{\s*value\s*}}/g, value);
            }
          });
        } else {
          simulatedOutput = fallbackText || 'No fallback text provided.';
        }
      } else {
        const match = normalizedCombinations[matchIndex];
        simulatedOutput =
          match && match.value
            ? placeholderText.replace(/{{\s*value\s*}}/g, match.value)
            : (fallbackText || 'No fallback text provided.');
      }
    }

    // --- Render -------------------------------------------------------------
    return (
      <Fragment>
        <BlockControls>
          <AlignmentToolbar
            value={alignment}
            onChange={(newAlign) => setAttributes({ alignment: newAlign })}
          />
        </BlockControls>

        <InspectorControls>
          <PanelBody title="Query Parameters">
            {localParamKeys.map((key, i) => (
              <div key={i} style={{ marginBottom: '0' }}>
                <TextControl
                  label={`Param Key #${i + 1}`}
                  value={key}
                  onChange={(val) => updateKey(i, val)}
                />
                <div style={{ textAlign: 'right' }}>
                  <Button isLink isDestructive onClick={() => removeKey(i)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button isPrimary onClick={addKey}>Add Parameter</Button>
          </PanelBody>

          <PanelBody title="Value Combinations" initialOpen={false}>
            <p>If more than one combination is true, the first one found in the following list will be used:</p>
            <ToggleControl
              label="Use parameter query string value(s) as output"
              checked={useParamValueDirect}
              onChange={(val) => {
                setAttributes({ useParamValueDirect: val });
              }}
            />
            {useParamValueDirect && (
              <div style={{ padding: '0 0.5rem 1rem', fontSize: '13px', color: '#555' }}>
                <strong>Instructions:</strong><br />
                You can reference each parameter’s value in your placeholder using their value replacement pattern:
                <ul>
                  {localParamKeys.map((key, i) => (
                    <li key={i} style={{ padding: '0 0 0.5rem' }}>
                      For <code>{key}</code> placeholder use:<br />
                      {0 === i ? `{{value}} or {{value_1}}` : `{{value_${i + 1}}}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {normalizedCombinations.map((combo, i) => (
              <div
                key={`combo-${i}`}
                style={{
                  marginBottom: '1rem',
                  padding: '0.5rem',
                  opacity: useParamValueDirect ? 0.5 : 1,
                  pointerEvents: useParamValueDirect ? 'none' : 'auto',
                  border: i === matchIndex ? '2px solid green' : '1px solid #ccc',
                  background: i === matchIndex ? '#eaffea' : 'transparent'
                }}
              >
                {localParamKeys.map((key) => {
                  const rule = combo[key] ?? DEFAULT_RULE();
                  const hideValue = 'exists' === rule.operator || 'notExists' === rule.operator;
                  return (
                    <div key={`${i}-${key}`} style={{ display: 'grid', gap: '6px', gridTemplateColumns: '1fr', marginBottom: '8px' }}>
                      <div style={{ fontSize: 12, color: '#666', marginBlock: '12px' }}>
                        <strong>PARAM KEY: <span style={{ outline: '1px solid #666', padding: '0.25rem', borderRadius: '3px', backgroundColor: '#fff' }}>{key || '(unnamed param)'}</span></strong>
                      </div>
                      {!hideValue && (
                        <TextControl
                          label="Required value"
                          value={rule.value}
                          onChange={(val) => updateComboRule(i, key, 'value', val)}
                        />
                      )}
                      <div style={{ position: 'relative', top: '-12px', marginBottom: '-12px' }}>
                        <SelectControl
                          label="Operator"
                          value={rule.operator}
                          options={OPERATORS}
                          onChange={(val) => updateComboRule(i, key, 'operator', val)}
                        />
                      </div>
                    </div>
                  );
                })}
                <div style={{ borderTop: '1px solid #333', paddingTop: '12px' }}>
                  <TextControl
                    label="Output Value"
                    value={combo.value}
                    onChange={(val) => updateComboValue(i, val)}
                  />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Button isLink isDestructive onClick={() => removeCombo(i)}>
                    Remove Combination
                  </Button>
                </div>
              </div>
            ))}
            <Button isPrimary onClick={addCombo} disabled={useParamValueDirect}>
              Add Combination
            </Button>
          </PanelBody>

          <PanelBody title="Editor Preview" initialOpen={false}>
            <ToggleControl
              label="Enable Preview Mode"
              checked={previewMode}
              onChange={(val) => setAttributes({ previewMode: val })}
            />
            <ToggleControl
              label="Use OR Logic (match any)"
              checked={useOrLogic}
              onChange={(val) => setAttributes({ useOrLogic: val })}
            />
            {previewMode && localParamKeys.map((key, i) => (
              <TextControl
                key={key || `pv-${i}`}
                label={`Preview value for "${key || '(unnamed)'}"`}
                value={previewValues[key] || ''}
                onChange={(val) => updatePreviewValue(key, val)}
              />
            ))}
            <TextControl
              label="Fallback Text (when nothing matches)"
              value={fallbackText}
              onChange={(val) => setAttributes({ fallbackText: val })}
            />
          </PanelBody>
        </InspectorControls>

        <div {...blockProps}>
          <RichText
            tagName="div"
            value={previewMode ? simulatedOutput : placeholderText}
            onChange={(val) => setAttributes({ placeholderText: val })}
            placeholder={
              previewMode && '' === fallbackText
                ? `No fallback text provided. Content with replacement pattern: ${placeholderText}`
                : undefined
            }
          />
        </div>
      </Fragment>
    );
  },
  save: () => null,
});
