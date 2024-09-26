'use client'
import { Modal, Button, Image, message, Spin } from 'antd'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import axios from '@/lib/axios'
import './CustomModal.css'
import { useTranslations } from 'next-intl'
const CustomModal = ({ isModalOpen, handleRegenerate, setIsModalOpen, taskID }) => {
  const t = useTranslations('page')
  const [loading, setLoading] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState('')
  const timeoutIdRef = useRef(null)

  const getImg2 = useCallback(async () => {
    let attemptCount = 0

    const checkProgress = async () => {
      attemptCount++
      try {
        const result = await axios.post('/api/proxy', {
          path: 'img2img/query',
          taskID: taskID,
        })
        const progress = result?.data?.data?.progress

        if (progress === 100) {
          setGeneratedImageUrl(result?.data?.data?.imageFiles[0]?.url)
          setLoading(false)
          return
        }

        if (attemptCount >= 200) {
          message.error(t('unable_to_generate_image_please_try_again'))
          setLoading(false)
          return
        }

        const delay = progress < 50 ? 3000 : 1500
        timeoutIdRef.current = setTimeout(checkProgress, delay)
      } catch (error) {
        message.error(t('unable_to_generate_image_please_try_again'))
        setLoading(false)
      }
    }

    checkProgress()
  }, [taskID])

  useEffect(() => {
    if (taskID) {
      setLoading(true)
      getImg2()
    }

    return () => {
      // 在组件卸载时清理定时器
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }
    }
  }, [taskID, getImg2])

  const downloadImage = () => {
    const link = document.createElement('a')
    link.href = generatedImageUrl
    const dynamicFilename = 'custom_image_name.png'
    link.download = dynamicFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Modal
      open={isModalOpen}
      onCancel={() => {
        setIsModalOpen(false)
      }}
      footer={[
        <div className="custom-footer" key="download2">
          <div key="download" onClick={downloadImage} disabled={!generatedImageUrl} className="download">
            {t('download_image')}
          </div>
          <div key="regenerate" onClick={handleRegenerate} className="afresh">
            {t('regenerate')}
          </div>
        </div>,
      ]}
    >
      <Spin spinning={loading} tip={t('image_is_being_generated_please_wait')}>
        <div className="custom-con">
          {generatedImageUrl && (
            <Image src={generatedImageUrl} alt={t('generation_result')} width={300} style={{ maxWidth: '100%' }} />
          )}
        </div>
      </Spin>
    </Modal>
  )
}

export default CustomModal
