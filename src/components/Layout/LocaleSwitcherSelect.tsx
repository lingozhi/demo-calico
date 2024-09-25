'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ReactNode, useTransition } from 'react'
import { useRouter, usePathname } from '@/navigation'
import { Dropdown } from 'antd'
import styles from './LocaleSwitcherSelect.module.less'

type Props = {
  children?: ReactNode
  defaultValue: string
  label: string
}

export default function LocaleSwitcherSelect({ children, defaultValue, label }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()
  const params = useParams()

  const handleLocaleChange = (nextLocale: string) => {
    startTransition(() => {
      router.replace({ pathname, query: { ...params } }, { locale: nextLocale })
    })
  }

  // 设置默认语言时立即触发默认语言切换
  useEffect(() => {
    if (defaultValue) {
      handleLocaleChange(defaultValue)
    }
  }, [defaultValue])

  const items = [
    {
      key: 'cn',
      label: (
        <div
          className={`${styles.select} ${defaultValue === 'zh' ? styles.selected : styles.select}`}
          onClick={() => handleLocaleChange('zh')}
        >
          CN
        </div>
      ),
    },
    {
      key: 'en',
      label: (
        <div
          className={`${styles.select} ${defaultValue === 'en' ? styles.selected : styles.select}`}
          onClick={() => handleLocaleChange('en')}
        >
          EN
        </div>
      ),
    },
  ]

  return (
    <div className={styles.page}>
      <Dropdown
        menu={{
          items,
        }}
      >
        <div className={styles.dropdown_icon}></div>
      </Dropdown>
    </div>
  )
}
