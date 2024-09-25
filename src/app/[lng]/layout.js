import { dir } from 'i18next';
import { languages } from '../lib/i18n/settings';
import { I18nextProvider } from 'react-i18next';
import initI18next from '../lib/i18n';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export default async function RootLayout({ children, params }) {
  const { lng } = params;
  const i18nInstance = await initI18next(lng, 'common');

  return (
    <html lang={lng} dir={dir(lng)}>
      <head />
      <body>
        <I18nextProvider i18n={i18nInstance}>
          {children}
        </I18nextProvider>
      </body>
    </html>
  );
}
