// page.js
import Link from 'next/link';
import ImageUploadAndEdit from './components/ImageUploadAndEdit';
import './globals.css';
import { useTranslation } from 'react-i18next';

export default function Page({ params }) {
  const { lng } = params;
  const { t } = useTranslation('common');

  return (
    <>
      <ImageUploadAndEdit lng={lng} />
      <div>{t('welcome')}</div>
      <div>{t('main.text')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Link href="/en">en</Link>
        <Link href="/zh">zh</Link>
        <Link href="/">/</Link>
      </div>
    </>
  );
}
