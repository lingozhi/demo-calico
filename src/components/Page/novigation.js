import { createSharedPathnamesNavigation } from 'next-intl/navigation'

export const locales = ['en', 'zh']
export const localePrefix = 'as-needed'
export const defaultLocale = 'zh'
export const localeItems = [
  { name: 'English', code: 'en', iso: 'en-US', dir: 'ltr' },
  { name: '中文', code: 'zh_cn', iso: 'zh-CN', dir: 'ltr' },
]

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({ locales, localePrefix })
