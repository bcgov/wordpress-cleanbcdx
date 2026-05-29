const FORM_ID = 2;

if (document.getElementById(`gform_${FORM_ID}`) && window.bcgovBlockThemePluginDefnitions) {
    document.addEventListener(
        'submit',
        (event) => {
            const form = event.target;

            if (!form || form.id !== `gform_${FORM_ID}`) {
                return;
            }

            setTimeout(() => {
                window.bcgovBlockThemePluginDefnitions();
            }, 1000);
        },
        true
    );
}
