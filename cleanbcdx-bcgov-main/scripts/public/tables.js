/**
 * Table DOM manipulation.
 * 
 * Enhances WordPress block table markup for accessibility, responsive layout, and semantic structure.
 *
 * Key features:
 * - Adds ARIA roles to all table elements (`table`, `thead`, `tbody`, `tr`, `th`, `td`) for screen reader support.
 * - Assigns `data-label` to each `<td>` using its associated `<th>` text to support stacked layouts on narrow screens.
 * - Dynamically applies `rowspan` and/or `colspan` attributes to `<td>` elements based on structural class names.
 * - Visually merged cells are marked with `.hidden` and `aria-hidden="true"`.
 * - Merged cells duplicate the `innerHTML` and `data-label` from the originating cell for visual and assistive consistency.
 *
 * Spanning process is **subtractive**—always start from the top-left origin. Once processed, attempting to span over already hidden cells may cause display issues.
 *
 * Supported class patterns (applied to `<figure class="wp-block-table ...">`):
 * - `col-{index}-span-{count}` — rowspan starting from the first row of a given column
 * - `row-{index}-span-{count}` — colspan starting from the first column of a given row
 * - `col-{col}-row-{row}-span-{count}` — rowspan starting from a specific cell
 * - `row-{row}-col-{col}-span-{count}` — colspan starting from a specific cell
 * - `cell-{col}-{row}-span-{rowCount}x{colCount}` — combined rowspan/colspan from a defined cell grid
 *
 * Example:
 * @example
 * <figure class="wp-block-table col-1-span-2 row-3-span-2 cell-2-1-span-2x2">
 *   <table>
 *     <thead><tr><th>...</th></tr></thead>
 *     <tbody><tr><td>...</td></tr></tbody>
 *   </table>
 * </figure>
 *
 * This function should be called once the DOM is fully loaded.
 */

const bcgovBlockThemePluginTables = () => {
	/*
	 * SafarIE iOS requires window.requestAnimationFrame update.
	 */
	window.requestAnimationFrame(() => {
		const tables = document.querySelectorAll('table');
		tables.forEach((table) => {
			table.setAttribute('role', 'table');

			const thead = table.querySelector('thead');
			if (thead) {
				thead.setAttribute('role', 'rowgroup');
				const headRow = thead.querySelector('tr');
				if (headRow) {
					headRow.setAttribute('role', 'row');
					headRow.querySelectorAll('th').forEach(th => {
						th.setAttribute('role', 'columnheader');
					});
				}
			}

			const tbody = table.querySelector('tbody');
			if (tbody) {
				tbody.setAttribute('role', 'rowgroup');
				tbody.querySelectorAll('tr').forEach(row => {
					row.setAttribute('role', 'row');
					row.querySelectorAll('td').forEach(td => {
						td.setAttribute('role', 'cell');
					});
				});
			}

			const headerTexts = [];
			if (thead) {
				thead.querySelectorAll('th').forEach(th => {
					headerTexts.push(th.textContent.trim());
				});
			}

			if (tbody && headerTexts.length) {
				tbody.querySelectorAll('tr').forEach(row => {
					row.querySelectorAll('td').forEach((cell, index) => {
						const labelText = headerTexts[index] || '';
						cell.setAttribute('data-label', labelText + ': ');
					});
				});
			}
		});

		/**
		 * Handles complex spanning rules for table cells.
		 *
		 * Each `figure.wp-block-table` may include one or more span classes that indicate
		 * where and how cells should be merged. This logic interprets those classes and:
		 * - Sets the `rowspan` and/or `colspan` attributes on the correct cell.
		 * - Hides the visually merged cells with `.hidden` and `aria-hidden="true"`.
		 * - Duplicates `data-label` and `innerHTML` from the source cell into each hidden one.
		 */
		document.querySelectorAll('figure.wp-block-table[class*="-span-"]').forEach(figure => {
			const table = figure.querySelector('table');
			if (!table) return;

			const tbody = table.querySelector('tbody');
			if (!tbody) return;

			const classList = figure.className.split(' ');
			const spanClasses = classList.filter(cls =>
				/(col-\d+-span-\d+|row-\d+-span-\d+|col-\d+-row-\d+-span-\d+|row-\d+-col-\d+-span-\d+|cell-\d+-\d+-span-\d+x\d+)/.test(cls)
			);

			const rows = Array.from(tbody.querySelectorAll('tr'));

			spanClasses.forEach(spanClass => {
				let match;

				/**
				 * Combined rowspan and colspan:
				 * e.g. cell-2-1-span-3x2 — start at col 2, row 1, span 3 rows and 2 columns
				 */
				if ((match = spanClass.match(/cell-(\d+)-(\d+)-span-(\d+)x(\d+)/))) {
					const [, col, row, rowspan, colspan] = match.map(Number);
					const grid = rows.map(r => Array.from(r.children));
					const baseRow = grid[row - 1];
					if (!baseRow) return;
					const baseCell = baseRow[col - 1];
					if (!baseCell) return;

					const maxRowSpan = Math.min(rowspan, rows.length - row + 1);
					const maxColSpan = Math.min(colspan, baseRow.length - col + 1);

					baseCell.setAttribute('rowspan', maxRowSpan);
					baseCell.setAttribute('colspan', maxColSpan);

					for (let r = 0; r < maxRowSpan; r++) {
						const currentRow = grid[row - 1 + r];
						if (!currentRow) continue;

						for (let c = 0; c < maxColSpan; c++) {
							if (0 === r && 0 === c) continue;

							const targetCell = currentRow[col - 1 + c];
							if (targetCell) {
								targetCell.setAttribute('data-label', baseCell.getAttribute('data-label') || '');
								targetCell.innerHTML = baseCell.innerHTML;
								targetCell.setAttribute('aria-hidden', 'true');
								targetCell.classList.add('hidden');
							}
						}
					}
				}

				/**
				 * Specific cell rowspan:
				 * e.g. col-1-row-2-span-3 — rowspan from col 1, row 2, over 3 rows
				 */
				else if ((match = spanClass.match(/col-(\d+)-row-(\d+)-span-(\d+)/))) {
					const [, col, row, span] = match.map(Number);
					const baseRow = rows[row - 1];
					if (!baseRow) return;
					const baseCell = baseRow.children[col - 1];
					if (!baseCell) return;

					const maxSpan = Math.min(span, rows.length - row + 1);
					baseCell.setAttribute('rowspan', maxSpan);

					for (let i = 1; i < maxSpan; i++) {
						const targetRow = rows[row - 1 + i];
						if (targetRow) {
							const targetCell = targetRow.children[col - 1];
							if (targetCell) {
								targetCell.setAttribute('data-label', baseCell.getAttribute('data-label') || '');
								targetCell.innerHTML = baseCell.innerHTML;
								targetCell.setAttribute('aria-hidden', 'true');
								targetCell.classList.add('hidden');
							}
						}
					}
				}

				/**
				 * Specific cell colspan:
				 * e.g. row-2-col-2-span-2 — colspan from col 2, row 2, over 2 columns
				 */
				else if ((match = spanClass.match(/row-(\d+)-col-(\d+)-span-(\d+)/))) {
					const [, row, col, span] = match.map(Number);
					const baseRow = rows[row - 1];
					if (!baseRow) return;
					const baseCell = baseRow.children[col - 1];
					if (!baseCell) return;

					const maxSpan = Math.min(span, baseRow.children.length - col + 1);
					baseCell.setAttribute('colspan', maxSpan);

					for (let i = 1; i < maxSpan; i++) {
						const targetCell = baseRow.children[col - 1 + i];
						if (targetCell) {
							targetCell.setAttribute('data-label', baseCell.getAttribute('data-label') || '');
							targetCell.innerHTML = baseCell.innerHTML;
							targetCell.setAttribute('aria-hidden', 'true');
							targetCell.classList.add('hidden');
						}
					}
				}

				/**
				 * Top-aligned column span:
				 * e.g. col-1-span-3 — rowspan from col 1, row 1, over 3 rows
				 */
				else if ((match = spanClass.match(/col-(\d+)-span-(\d+)/))) {
					const [, col, span] = match.map(Number);
					if (!rows[0]) return;
					const baseCell = rows[0].children[col - 1];
					if (!baseCell) return;

					const maxSpan = Math.min(span, rows.length);
					baseCell.setAttribute('rowspan', maxSpan);

					for (let i = 1; i < maxSpan; i++) {
						const row = rows[i];
						if (row) {
							const targetCell = row.children[col - 1];
							if (targetCell) {
								targetCell.setAttribute('data-label', baseCell.getAttribute('data-label') || '');
								targetCell.innerHTML = baseCell.innerHTML;
								targetCell.setAttribute('aria-hidden', 'true');
								targetCell.classList.add('hidden');
							}
						}
					}
				}

				/**
				 * Left-aligned row span:
				 * e.g. row-2-span-3 — colspan from col 1, row 2, over 3 columns
				 */
				else if ((match = spanClass.match(/row-(\d+)-span-(\d+)/))) {
					const [, row, span] = match.map(Number);
					const baseRow = rows[row - 1];
					if (!baseRow) return;
					const cells = Array.from(baseRow.children);
					const baseCell = cells[0];
					if (!baseCell) return;

					const maxSpan = Math.min(span, cells.length);
					baseCell.setAttribute('colspan', maxSpan);

					cells.slice(1, maxSpan).forEach(cell => {
						cell.setAttribute('data-label', baseCell.getAttribute('data-label') || '');
						cell.innerHTML = baseCell.innerHTML;
						cell.setAttribute('aria-hidden', 'true');
						cell.classList.add('hidden');
					});
				}
			});
		});
	});
};

if ('complete' === document.readyState) {
	bcgovBlockThemePluginTables();
} else {
	document.addEventListener('DOMContentLoaded', bcgovBlockThemePluginTables);
}
