'use client'
import React, { useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import styles from './index.module.less'

interface IProps {
  children: React.ReactNode
  curActive: string
  defaultOpen?: string[]
}

const CommonLayout: React.FC<IProps> = ({ children, curActive, defaultOpen = ['/'] }) => {
  return (
    <>
      <Header />
      {children}
      {/* <Footer /> */}
    </>
  )
}

export default CommonLayout
