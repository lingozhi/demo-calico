'use client'
import { useLocale, useTranslations } from 'next-intl'
import { locales } from '@/config'
import LocaleSwitcherSelect from './LocaleSwitcherSelect'
import { Dropdown } from 'antd'
export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher')
  const locale = useLocale()
  console.log(locales)
  const items = [
    {
      key: '1',
      label: (
        <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
          1st menu item
        </a>
      ),
    },
    {
      key: '2',
      label: (
        <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
          2nd menu item (disabled)
        </a>
      ),
      disabled: true,
    },
  ]
  return (
    <LocaleSwitcherSelect defaultValue={locale} label={t('label')}>
      {/* <Dropdown
        menu={{
          items,
        }}
      >
        <a onClick={(e) => e.preventDefault()}>1</a>
      </Dropdown> */}
      <div className="locale">1</div>
      {locales.map((cur) => (
        <option key={cur} value={cur}>
          {t('locale', { locale: cur })}
        </option>
      ))}
    </LocaleSwitcherSelect>
  )
}
