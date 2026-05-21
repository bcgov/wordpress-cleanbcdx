document.addEventListener('DOMContentLoaded', () => {
  const params = Object.fromEntries(new URLSearchParams(location.search));

  /**
   * Evaluate a single rule.
   *
   * @param {string} operator - The comparison operator (equals, contains, etc.).
   * @param {string} required - The required value from the combination rule.
   * @param {string} actual - The actual query parameter value from the URL.
   * @returns {boolean} Whether the rule passes.
   */
  const evaluateRule = (operator, required, actual) => {
    switch (operator) {
      case 'equals':
        return actual === required;
      case 'notEquals':
        return actual !== required;
      case 'contains':
        return (actual ?? '').includes(required ?? '');
      case 'startsWith':
        return (actual ?? '').startsWith(required ?? '');
      case 'endsWith':
        return (actual ?? '').endsWith(required ?? '');
      case 'exists':
        return undefined !== actual && null !== actual && '' !== `${actual}`;
      case 'notExists':
        return undefined === actual || null === actual || '' === `${actual}` ;
      default:
        return false;
    }
  };

/**
   * Replace <span> placeholders when using direct passthrough mode.
   * This substitutes query param values (or select labels) into the rendered block.
   *
   * @returns {void}
   */
  const replaceSpansWithLabels = () => {
    document.querySelectorAll('.multi-query-content-block').forEach((block) => {
      const allowPassthrough = 'true' === block.dataset.useParamDirect;
      if (!allowPassthrough) return;

      let i = 1;
      let dataKey;

      while ((dataKey = block.dataset[`key-${i}`]) !== undefined) {
        const paramValue = params[dataKey];
        if (!paramValue) {
          i++;
          continue;
        }

        // Try to resolve label from matching <select> (for filter components)
        const select = document.querySelector(`select[name="${dataKey}"]`);
        let label = paramValue;
        if (select) {
          const opt = Array.from(select.options).find((o) => o.value === paramValue);
          if (opt) {
            label = opt.label || opt.textContent;
          }
        }

        const replaceKey = 1 === i ? 'value' : `value_${i}`;
        const span = block.querySelector(`span[data-replace="${replaceKey}"]`);
        if (span) span.textContent = label;

        i++;
      }
    });
  };

  /**
   * Evaluate operator-based combinations client-side.
   * Mirrors the server-side logic for dynamic updates or delayed rendering.
   *
   * @returns {void}
   */
  const evaluateCombinations = () => {
    document.querySelectorAll('.multi-query-content-block[data-combinations]').forEach((block) => {
      const useParamDirect = 'true' === block.dataset.useParamDirect;
      if (useParamDirect) return; // handled by replaceSpansWithLabels()

      let combinations;
      try {
        combinations = JSON.parse(block.dataset.combinations);
      } catch {
        combinations = [];
      }

      const keys = [];
      Object.keys(block.dataset).forEach((k) => {
        if (k.startsWith('key-')) {
          const idx = parseInt(k.split('-')[1], 10);
          keys[idx - 1] = block.dataset[k];
        }
      });

      const useOrLogic = 'true' === block.dataset.useOr;
      const fallback = block.dataset.fallback || 'No fallback text provided.';
      let matchValue = null;

      for (const combo of combinations) {
        const evaluations = [];

        for (const key of keys) {
          const rule = combo[key];
          if (!rule) {
            evaluations.push(false);
            continue;
          }

          const { value: required = '', operator = 'equals' } =
            'object' === typeof rule ? rule : { value: rule, operator: 'equals' };
          const actual = params[key];
          evaluations.push(evaluateRule(operator, required, actual));
        }

        const isMatch = useOrLogic
          ? evaluations.some(Boolean)
          : evaluations.every(Boolean);

        if (isMatch && combo.value) {
          matchValue = combo.value;
          break;
        }
      }

      const contentEl = block.querySelector('[data-replace="value"]');
      if (contentEl) {
        contentEl.textContent = matchValue || fallback;
      }
    });
  };

  // Run once
  replaceSpansWithLabels();
  evaluateCombinations();

  // Listen for dynamic filter events
  document.addEventListener('queryFilterReady', () => {
    replaceSpansWithLabels();
    evaluateCombinations();
  });
});
