import { useEffect, useState } from '@wordpress/element';
import {
	useBlockProps,
	InspectorControls,
	getTypographyClassesAndStyles,
	getColorClassName,
} from '@wordpress/block-editor';

import {
	PanelBody,
	Spinner,
	SelectControl,
	TextControl,
} from '@wordpress/components';

const API_URL = '/wp-json/custom/v1/meta-categories';

/**
 * Edit component for the Query Filter Block.
 *
 * Renders the block interface in the WordPress block editor, allowing users to:
 * - Select a taxonomy to filter by
 * - Set the label text for the dropdown
 * 
 * On the frontend, this component also redirects based on query string changes.
 *
 * @param {Object} props - Props.
 * @param {Object} props.attributes - Block attributes.
 * @param {Function} props.setAttributes - Function to update block attributes.
 * @returns {JSX.Element} Block edit interface.
 */
const Edit = ({ attributes, setAttributes }) => {
	const { selectedTaxonomy, label } = attributes;
	const [taxonomies, setTaxonomies] = useState({});
	const selected = window.queryFilterBlockData?.query ?? {};

	useEffect(() => {
		fetch(API_URL, {
			headers: {
				'X-WP-Nonce': window.queryFilterBlockData?.nonce ?? '',
			},
		})
			.then((res) => res.json())
			.then((data) => setTaxonomies(data));
	}, []);

	const handleValueChange = (value) => {
		const newSelected = { ...selected };

		if (value) {
			newSelected[selectedTaxonomy] = [value];
		} else {
			delete newSelected[selectedTaxonomy];
		}

		const newParams = new URLSearchParams();
		for (const key in newSelected) {
			newSelected[key].forEach((val) => newParams.append(key, val));
		}

		const container = document.querySelector('.query-filter-block');
		if (container) {
			container.classList.add('fade-out');
			setTimeout(() => {
				window.location.href = `${window.location.pathname}?${newParams.toString()}`;
			}, 200);
		} else {
			window.location.href = `${window.location.pathname}?${newParams.toString()}`;
		}
	};

	const options =
		selectedTaxonomy && taxonomies[selectedTaxonomy]
			? [
					{ label: '-- Select --', value: '' },
					...taxonomies[selectedTaxonomy].map(({ slug, name }) => ({
						label: name,
						value: slug,
					})),
			  ]
			: [];

	// Combine WordPress classes and styles
	const typography = getTypographyClassesAndStyles(attributes);
	const textColorClass = getColorClassName('color', attributes.textColor);
	const combinedLabelClasses = [typography.className, textColorClass].filter(Boolean).join(' ');

	return (
		<div {...useBlockProps({ className: 'query-filter-block', 'data-initialized': 'false' })}>
			<InspectorControls>
				<PanelBody title="Filter Settings" initialOpen>
					<SelectControl
						label="Select Taxonomy"
						value={selectedTaxonomy}
						onChange={(val) => setAttributes({ selectedTaxonomy: val })}
						options={Object.keys(taxonomies).map((key) => ({
							label: key.replace(/-/g, ' '),
							value: key,
						}))}
					/>
					<TextControl
						label="Label Text"
						value={label}
						onChange={(val) => setAttributes({ label: val })}
					/>
				</PanelBody>
			</InspectorControls>

			{selectedTaxonomy && options.length ? (
				<div className="query-filter-group">
					<label
						htmlFor={`select-${selectedTaxonomy}`}
						className={combinedLabelClasses}
						style={{
							...typography.style,
							color: textColorClass ? undefined : attributes.style?.color?.text,
						}}
					>
						{label}
					</label>
					<SelectControl
						id={`select-${selectedTaxonomy}`}
						name={selectedTaxonomy}
						value={selected[selectedTaxonomy]?.[0] || ''}
						onChange={(value) => handleValueChange(value)}
						options={options}
					/>
				</div>
			) : (
				<Spinner />
			)}
		</div>
	);
}

export default Edit;