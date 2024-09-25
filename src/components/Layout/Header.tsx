'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import LocaleSwitcher from './LocaleSwitcher'
import getNavList from './Menu'
import { useTranslations } from 'next-intl'
import styles from './index.module.less'
export default function Header() {
  const t = useTranslations('Header')
  const navList = getNavList(t)

  const selectedLayoutSegment = useSelectedLayoutSegment()
  const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : '/'
  return (
    <>
      {/* <nav className="flex justify-between"> */}
      {/* <div>
          {navList.map((nav: { key: string; label: string }) => (
            <Link
              className={clsx(
                'inline-block px-2 py-3 transition-colors',
                pathname === `${nav.key}` ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              )}
              key={nav.key}
              href={nav.key}
            >
              {nav.label}
            </Link>
          ))}
        </div> */}
      <LocaleSwitcher />
      {/* </nav> */}
    </>
  )
}
