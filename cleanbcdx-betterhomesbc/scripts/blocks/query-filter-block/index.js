import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit.js';

registerBlockType('bcgovcleanbc/query-filter-block', {
    edit: Edit,
    save: () => null, // Dynamic, doesn't save static markup
});

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.query-filter-block');
  console.log(container);
  if (!container || !window.queryFilterBlockData) return;

  // TODO: hydrate from queryFilterBlockData.query
  // rebuild filter UI if needed, or add loading indicator cleanup
});
