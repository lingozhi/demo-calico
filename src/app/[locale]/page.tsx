'use client'

import { useTranslations } from 'next-intl'
import Layout from '@/components/Layout'
import Page from '@/components/Page/page'
export default function Home() {
  const t = useTranslations('index')
  return (
    <Layout curActive="/index">
      <Page></Page>
    </Layout>
  )
}
