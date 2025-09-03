// .storybook/preview.jsx
import React, { Suspense, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/i18n';

export const globalTypes = {
    locale: {
        name: 'Locale',
        description: 'Internationalization locale',
        toolbar: {
            icon: 'globe',
            items: [
                { value: 'en', title: 'English' },
                { value: 'zh_CN', title: '简体中文' },
            ],
            showName: true,
        },
    },
};

const withI18next = (Story, context) => {
    const { locale } = context.globals;
    // When the locale global changes
    // Set the new locale in i18n
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        i18n.changeLanguage(locale);
    }, [locale]);

    // When the locale global changes
    // Set the new locale in i18n
     return (
    <Suspense fallback={<div>loading translations...</div>}>
      <I18nextProvider i18n={i18n}>
        <Story />
      </I18nextProvider>
    </Suspense>
  );
};

export const decorators = [withI18next];

i18n.on('languageChanged', (locale) => {
    const direction = i18n.dir(locale);
    document.dir = direction;
});

import { initialize, mswLoader } from 'msw-storybook-addon'

// Initialize MSW
initialize()

const preview = {
    parameters: {
        // your other code...
    },
    // Provide the MSW addon loader globally
    loaders: [mswLoader],
}

export default preview;