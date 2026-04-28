import { cleanbcdxBhDefinitions } from '../definitions';

const FORM_ID = 2;

if (document.getElementById(`gform_${FORM_ID}`)) {
    document.addEventListener(
        'submit',
        (event) => {
            const form = event.target;

            if (!form || form.id !== `gform_${FORM_ID}`) {
                return;
            }

            setTimeout(() => {
                cleanbcdxBhDefinitions();
            }, 1000);
        },
        true
    );
}
