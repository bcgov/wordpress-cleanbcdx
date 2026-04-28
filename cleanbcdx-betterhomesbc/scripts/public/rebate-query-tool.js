const rebateQueryTool = () => {
	window.requestAnimationFrame(() => {
		const tools = document.querySelectorAll(
			'.cleanbc-rebate-query-tool[data-cleanbc-tool="rebate-query"]'
		);

		if (!tools.length) {
			return;
		}

		const fieldDefinitions = [
			{
				fieldKey: 'location',
				label: 'What community do you live in or are closest to?',
				queryKeys: ['location', 'region'],
				valueFromQuery: (values) => {
					const location = values.location || '';
					const region = values.region || '';
					if (location && region) {
						return `${location}`; // could include (${region})
					}
					return location || region;
				}
			},
			{
				fieldKey: 'murbTenure',
				label: 'Do you rent or own your home?',
				queryKeys: ['tenure']
			},
			{
				fieldKey: 'building',
				label: 'What kind of home do you live in?',
				queryKeys: ['type', 'group'],
				valueFromQuery: (values) => {
					const type = values.type || '';
					const group = values.group || '';
					if (type && group) {
						return `${type} (group: ${group})`;
					}
					return type || group;
				}
			},
			{
				fieldKey: 'homeValue',
				label: 'What is the current assessed value of your property?',
				queryKeys: ['home_value']
			},
			{
				fieldKey: 'persons',
				label: 'How many people live in your home (including adults and children)?',
				queryKeys: ['persons']
			},
			{
				fieldKey: 'income',
				label:
					'What is the combined pre-tax income of all adults in your household (excluding dependants)?',
				queryKeys: ['income']
			},
			{
				fieldKey: 'heating',
				label: 'How do you heat the rooms in your home?',
				queryKeys: ['heating']
			},
			{
				fieldKey: 'water',
				label: 'How do you heat your water?',
				queryKeys: ['water_heating']
			},
			{
				fieldKey: 'utility',
				label: 'Who is your electricity provider?',
				queryKeys: ['utility']
			},
			{
				fieldKey: 'gas',
				label: 'Who is your gas or propane provider?',
				queryKeys: ['gas']
			}
		];

		const knownKeys = new Set(
			fieldDefinitions.flatMap((definition) => definition.queryKeys)
		);

		const parseParams = (input) => {
			if (!input) {
				return null;
			}

			const trimmed = input.trim();
			if (!trimmed) {
				return null;
			}

			let query = '';

			try {
				if (/^https?:\/\//i.test(trimmed)) {
					query = new URL(trimmed).search;
				} else if (trimmed.includes('?')) {
					query = trimmed.split('?')[1];
				} else {
					query = trimmed;
				}
			} catch (error) {
				if (trimmed.includes('?')) {
					query = trimmed.split('?')[1];
				} else {
					query = trimmed;
				}
			}

			const cleanQuery = query.startsWith('?') ? query.slice(1) : query;
			if (!cleanQuery) {
				return null;
			}

			return new URLSearchParams(cleanQuery);
		};

		const buildFieldEntries = (params) =>
			fieldDefinitions
				.map((definition) => {
					const queryValues = {};
					let hasValue = false;

					definition.queryKeys.forEach((key) => {
						const value = params.get(key);
						if (value != null && value !== '') {
							queryValues[key] = value;
							hasValue = true;
						}
					});

					if (!hasValue) {
						return null;
					}

					const value = definition.valueFromQuery
						? definition.valueFromQuery(queryValues)
						: Object.values(queryValues)[0] || '';

					return {
						fieldKey: definition.fieldKey,
						label: definition.label,
						queryKeys: definition.queryKeys,
						value,
						queryValues
					};
				})
				.filter(Boolean);

		const buildUnmappedParams = (params) => {
			const unmapped = {};
			for (const [key, value] of params.entries()) {
				if (!knownKeys.has(key)) {
					unmapped[key] = value;
				}
			}
			return unmapped;
		};

		const toCsv = (fields) => {
			const header = ['field_key', 'query_keys', 'label', 'value'];
			const rows = fields.map((field) => [
				field.fieldKey,
				field.queryKeys.join('|'),
				field.label,
				field.value
			]);

			return [header, ...rows]
				.map((row) =>
					row
						.map((cell) => {
							const text = String(cell ?? '');
							if (text.includes('"') || text.includes(',') || text.includes('\n')) {
								return `"${text.replace(/"/g, '""')}"`;
							}
							return text;
						})
						.join(',')
				)
				.join('\n');
		};

		const toJson = (data) => JSON.stringify(data, null, 2);

		const updateOutput = (tool, params, sourceUrl) => {
			const format = tool.dataset.outputFormat || 'json';
			const outputField = tool.querySelector('[data-output]');
			const unmappedField = tool.querySelector('[data-unmapped]');
			const unmappedContainer = tool.querySelector(
				'.cleanbc-rebate-query-tool__unmapped'
			);
			const copyButton = tool.querySelector('[data-action="copy"]');
			const downloadButton = tool.querySelector('[data-action="download"]');

			const fields = buildFieldEntries(params);
			const unmappedParams = buildUnmappedParams(params);

			let output = '';
			if ('csv' === format) {
				output = toCsv(fields);
			} else {
				output = toJson({
					sourceUrl,
					fields,
					unmappedParams
				});
			}

			outputField.value = output;
			copyButton.disabled = !output;
			if (downloadButton) {
				downloadButton.disabled = !output;
			}

			if (unmappedContainer && unmappedField) {
				const hasUnmapped = Object.keys(unmappedParams).length > 0;
				unmappedContainer.hidden = !hasUnmapped;
				unmappedField.textContent = hasUnmapped
					? JSON.stringify(unmappedParams, null, 2)
					: '';
			}
		};

		const handleParse = (tool) => {
			const input = tool.querySelector('[data-input]');
			const message = tool.querySelector('[data-message]');

			const params = parseParams(input.value);
			if (!params) {
				message.textContent = 'Enter a URL or query string with parameters to parse.';
				return;
			}

			message.textContent = '';
			updateOutput(tool, params, input.value.trim());
		};

		const handleCopy = async (tool) => {
			const outputField = tool.querySelector('[data-output]');
			if (!outputField.value) {
				return;
			}

			try {
				await navigator.clipboard.writeText(outputField.value);
				const message = tool.querySelector('[data-message]');
				message.textContent = 'Output copied to clipboard.';
			} catch (error) {
				outputField.focus();
				outputField.select();
				document.execCommand('copy');
			}
		};

		const handleDownload = (tool) => {
			const outputField = tool.querySelector('[data-output]');
			if (!outputField.value) {
				return;
			}

			const format = tool.dataset.outputFormat || 'json';
			const extension = 'csv' === format ? 'csv' : 'json';
			const now = new Date();
			const pad = (value) => String(value).padStart(2, '0');
			const timestamp = [
				now.getFullYear(),
				pad(now.getMonth() + 1),
				pad(now.getDate()),
				pad(now.getHours()),
				pad(now.getMinutes()),
				pad(now.getSeconds())
			].join('-');
			const filename = `cleanbc-rebate-query-${timestamp}.${extension}`;
			const blob = new Blob([outputField.value], {
				type: 'csv' === format ? 'text/csv;charset=utf-8;' : 'application/json'
			});

			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(link.href);
		};

		tools.forEach((tool) => {
			const input = tool.querySelector('[data-input]');
			const parseButton = tool.querySelector('[data-action="parse"]');
			const copyButton = tool.querySelector('[data-action="copy"]');
			const downloadButton = tool.querySelector('[data-action="download"]');
			const formatInputs = tool.querySelectorAll('[data-format]');

			parseButton.addEventListener('click', () => handleParse(tool));
			copyButton.addEventListener('click', () => handleCopy(tool));
			if (downloadButton) {
				downloadButton.addEventListener('click', () => handleDownload(tool));
			}

			formatInputs.forEach((formatInput) => {
				formatInput.addEventListener('change', () => {
					tool.dataset.outputFormat = formatInput.value;
					const params = parseParams(input.value);
					if (params) {
						updateOutput(tool, params, input.value.trim());
					}
				});
			});

			input.addEventListener('keydown', (event) => {
				if ('Enter' === event.key) {
					event.preventDefault();
					handleParse(tool);
				}
			});
		});
	});
};

if ('complete' === document.readyState) {
	rebateQueryTool();
} else {
	document.addEventListener('DOMContentLoaded', rebateQueryTool);
}
