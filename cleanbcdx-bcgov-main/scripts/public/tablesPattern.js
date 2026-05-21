/**
 * bcgovBlockThemePluginTablesPattern
 * Makes the Block Theme “Table pattern” (built with groups/grids) behave like an accessible table.
 *
 * - Finds each `.table-pattern` root and treats it as a table.
 * - Reads header texts from `.table-pattern-header-row` to generate `data-label` for cells.
 * - Applies ARIA table roles:
 *     - role="table" (on `.table-pattern`)
 *     - role="row" on each grid wrapper inside a row
 *     - role="columnheader" on header cells
 *     - role="cell" on body cells
 * - Sets aria-colindex/aria-rowindex + aria-colcount/aria-rowcount.
 * - Works with any number of columns/rows, including rows inside `.conditional-container`.
 * - Re-runs automatically when conditional rows are added/removed (MutationObserver).
 *
 * Notes:
 * - If no `.table-pattern-header-row` is present, it will try to infer headers from the first row.
 * - Optional: add `data-table-label="Your title"` on `.table-pattern` to set an aria-label.
 */
const bcgovBlockThemePluginTablesPattern = () => {
  const TABLE_SELECTOR = '.wp-block-group.table-pattern';
  const HEADER_CONTAINER_SELECTOR = '.table-pattern-header-row';
  const BODY_ROW_SELECTOR = '.table-pattern-row';
  const CONDITIONAL_CONTAINER_SELECTOR = '.conditional-container';

  // Utility: get trimmed visible text for a header/cell
  const getCellText = (el) => {
    if (!el) return '';
    // Prefer bold/heading text if present, else fallback to textContent
    const strongish = el.querySelector('strong, b, h1, h2, h3, h4, h5, h6');
    const src = strongish || el;
    return (src.textContent || '').replace(/\s+/g, ' ').trim();
  };

  // Collect header texts from the header row container, or infer from first body row
  const collectHeaderTexts = (tableRoot) => {
    let headerTexts = [];

    // Expect header structure: .table-pattern-header-row > .wp-block-group (grid)
    const headerRowWrap = tableRoot.querySelector(`${HEADER_CONTAINER_SELECTOR} > .wp-block-group`);
    if (headerRowWrap) {
      // Cells are direct children of the grid wrapper
      const headCols = headerRowWrap.querySelectorAll(':scope > .wp-block-group');
      headCols.forEach((col) => {
        headerTexts.push(getCellText(col));
      });
      return headerTexts;
    }

    // Fallback: derive from first body row (grid wrapper)
    const firstBodyGrid = tableRoot.querySelector(`${BODY_ROW_SELECTOR} > .wp-block-group`);
    if (firstBodyGrid) {
      const firstCols = firstBodyGrid.querySelectorAll(':scope > .wp-block-group');
      firstCols.forEach((col, idx) => {
        headerTexts.push(getCellText(col) || `Column ${idx + 1}`);
      });
    }
    return headerTexts;
  };

  // Remove old roles/attributes before re-applying
  const clearRoles = (root) => {
    root.querySelectorAll('[role],[aria-colindex],[aria-rowindex],[data-col],[data-label]').forEach(el => {
      el.removeAttribute('role');
      el.removeAttribute('aria-colindex');
      el.removeAttribute('aria-rowindex');
      el.removeAttribute('data-col');
      el.removeAttribute('data-label');
    });
    root.removeAttribute('aria-colcount');
    root.removeAttribute('aria-rowcount');
  };

  // Apply ARIA roles/attributes to one table-pattern root
  const applyRoles = (tableRoot) => {
    if (!tableRoot) return;

    // Start clean for re-runs
    clearRoles(tableRoot);

    // Role on table root + counts (computed below)
    tableRoot.setAttribute('role', 'table');

    // Optional accessible name
    if (tableRoot.hasAttribute('data-table-label')) {
      const label = tableRoot.getAttribute('data-table-label') || '';
      if (label.trim()) tableRoot.setAttribute('aria-label', label.trim());
    }

    const headerTexts = collectHeaderTexts(tableRoot);

    // Wrappers:
    //   Header wrapper: .table-pattern-header-row > .wp-block-group (grid)
    //   Body row wrappers: .table-pattern-row > .wp-block-group (grid)
    //   Conditional rows: .conditional-container .table-pattern-row > .wp-block-group (grid)
    const headerRowWrap = tableRoot.querySelector(`${HEADER_CONTAINER_SELECTOR} > .wp-block-group`);

    const bodyRowsWraps = [
      ...tableRoot.querySelectorAll(`${BODY_ROW_SELECTOR} > .wp-block-group`)
    ];

    const conditionalRowsWraps = [
      ...tableRoot.querySelectorAll(
        `${CONDITIONAL_CONTAINER_SELECTOR} ${BODY_ROW_SELECTOR} > .wp-block-group`
      )
    ];

    const allBodyRowsWraps = [...new Set([...bodyRowsWraps, ...conditionalRowsWraps])];

    // Compute counts
    const colCount = (() => {
      // Prefer header col count; else first body row; else 0
      const headerColCount = headerRowWrap ? headerRowWrap.querySelectorAll(':scope > .wp-block-group').length : 0;
      if (headerColCount) return headerColCount;
      const firstBody = allBodyRowsWraps[0];
      return firstBody ? firstBody.querySelectorAll(':scope > .wp-block-group').length : 0;
    })();

    const rowCount = (headerRowWrap ? 1 : 0) + allBodyRowsWraps.length;

    if (colCount) tableRoot.setAttribute('aria-colcount', String(colCount));
    if (rowCount) tableRoot.setAttribute('aria-rowcount', String(rowCount));

    // Header row
    let currentRowIndex = 1;
    if (headerRowWrap) {
      headerRowWrap.setAttribute('role', 'row');
      headerRowWrap.setAttribute('aria-rowindex', String(currentRowIndex));

      const headerCols = headerRowWrap.querySelectorAll(':scope > .wp-block-group');
      headerCols.forEach((col, i) => {
        col.setAttribute('role', 'columnheader');
        col.setAttribute('aria-colindex', String(i + 1));
        col.setAttribute('data-col', String(i + 1));
      });

      currentRowIndex++;
    }

    // Body rows
    allBodyRowsWraps.forEach((rowWrap) => {
      rowWrap.setAttribute('role', 'row');
      rowWrap.setAttribute('aria-rowindex', String(currentRowIndex));

      // Cells are the direct children of the grid wrapper
      const cells = rowWrap.querySelectorAll(':scope > .wp-block-group');
      cells.forEach((cell, i) => {
        cell.setAttribute('role', 'cell');
        cell.setAttribute('aria-colindex', String(i + 1));
        cell.setAttribute('data-col', String(i + 1));

        // For responsive patterns (stacked), set data-label on the cell wrapper
        const labelText = headerTexts[i] || `Column ${i + 1}`;
        cell.setAttribute('data-label', `${labelText}: `);
      });

      currentRowIndex++;
    });

    // Mark as initialized
    tableRoot.setAttribute('data-table-pattern-init', 'true');
  };

  // Process a single table-pattern root (apply roles)
  const processTable = (tableRoot) => {
    // Use rAF to satisfy iOS Safari layout timing quirks
    window.requestAnimationFrame(() => {
      applyRoles(tableRoot);
    });
  };

  // Run on all tables currently in DOM
  const initAll = () => {
    document.querySelectorAll(TABLE_SELECTOR).forEach((root) => {
      processTable(root);
    });
  };

  // Observe changes inside each table-pattern (conditional rows being inserted/removed)
  const attachObservers = () => {
    const observerConfig = { childList: true, subtree: true };
    const debounceMap = new WeakMap();

    const debouncedProcess = (root) => {
      if (debounceMap.has(root)) clearTimeout(debounceMap.get(root));
      const t = setTimeout(() => processTable(root), 50);
      debounceMap.set(root, t);
    };

    document.querySelectorAll(TABLE_SELECTOR).forEach((root) => {
      const mo = new MutationObserver(() => debouncedProcess(root));
      mo.observe(root, observerConfig);
      root._tablePatternObserver = mo; // optional reference for later cleanup
    });
  };

  // Kick things off
  initAll();
  attachObservers();
};

// OPTIONAL: auto-run on DOM ready
if ('loading' === document.readyState) {
  document.addEventListener('DOMContentLoaded', bcgovBlockThemePluginTablesPattern, { once: true });
} else {
  bcgovBlockThemePluginTablesPattern();
}
