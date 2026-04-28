import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import ServerSideRender from '@wordpress/server-side-render';
import { SelectControl, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

registerBlockType( 'bcgovcleanbc/rebates-page-info', {
	title: __( 'CleanBC DX - Rebates Page Info Section' ),
	description: 'Used to display a section of a rebates page',
	category: 'plugin',
	icon: 'cart',
	edit: ( props ) => {
		const blockProps = useBlockProps(); // eslint-disable-line
		return (
			<div { ...blockProps }>
				<InspectorControls>
					<PanelBody title="Options">
						<SelectControl
							label="Select Section"
							value={ props.attributes.section }
							options={ props.attributes.section_options }
							onChange={ ( value ) => {
								props.setAttributes( { section: value } );
							} }
						/>
					</PanelBody>
				</InspectorControls>
				<ServerSideRender
					block="bcgovcleanbc/rebates-page-info"
					attributes={ props.attributes }
				/>
			</div>
		);
	},
} );
