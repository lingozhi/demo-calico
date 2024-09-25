import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Upload, message, Modal, Slider } from 'antd'
import axios from '@/lib/axios'
import './ImageUploader.css'

const ImageUploader = ({
  imgKey = [],
  text = '上传图片',
  isRequire = false,
  logo = '/upload.svg',
  modalTitle = '',
  onUploadSuccess,
}) => {
  const [fileList, setFileList] = useState([])

  const isGraffitiEnabled = imgKey.length > 1

  const [brushSize, setBrushSize] = useState(10)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [canvasContent, setCanvasContent] = useState(null)

  const paintingRef = useRef(false)
  const canvasContextRef = useRef(null)
  const canvasRefs = {
    canvas1: useRef(null),
    canvas2: useRef(null),
  }

  const fileListRef = useRef(fileList)

  const handleChange = ({ file, fileList: newFileList }) => {
    const prevFileList = fileListRef.current

    setFileList(newFileList)
    fileListRef.current = newFileList

    if (file.status === 'removed') {
      onUploadSuccess(imgKey[0], undefined)
      if (isGraffitiEnabled) {
        onUploadSuccess(imgKey[1], undefined)
      }
      return
    }

    const addedFiles = newFileList.filter((newFile) => !prevFileList.some((prevFile) => prevFile.uid === newFile.uid))

    if (addedFiles.length > 0) {
      const selectedFile = addedFiles[0].originFileObj
      if (selectedFile) {
        handleUpload(selectedFile, imgKey[0])

        if (isGraffitiEnabled) {
          generatePureBlackImage(selectedFile).then((blackImage) => {
            if (blackImage) {
              handleUpload(blackImage, imgKey[1])
            }
          })
        }
      }
    }
  }

  const handleUpload = async (fileData, key) => {
    if (!fileData) return

    const formData = new FormData()
    let fileName
    let fileToUpload

    if (fileData.blob && fileData.filename) {
      const { blob, filename } = fileData
      fileName = key ? `${key}_${filename}` : filename
      fileToUpload = new File([blob], fileName, { type: blob.type })
    } else if (fileData instanceof File) {
      fileName = key ? `${key}_${fileData.name}` : fileData.name
      fileToUpload = new File([fileData], fileName, { type: fileData.type })
    } else {
      fileName = key ? `${key}_uploaded_file.png` : 'uploaded_file.png'
      fileToUpload = new File([fileData], fileName, { type: fileData.type })
    }

    formData.append('file', fileToUpload)

    try {
      const response = await axios.post(`/api/dashboard?filename=${encodeURIComponent(fileName)}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const imageUrl = response.data.url
      onUploadSuccess(key, imageUrl)
    } catch (error) {
      console.error('Error uploading file:', error)
      message.error('上传文件失败，请重试')
    }
  }

  const handlePreview = async (file) => {
    let src = file.url
    if (!src && file.originFileObj) {
      src = await getBase64(file.originFileObj)
    }
    if (src) {
      setPreviewImage(src)
      setPreviewVisible(true)
      setCanvasContent(null)
    }
  }

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

  useEffect(() => {
    if (!previewVisible) return

    if (canvasRefs.canvas1.current) {
      const canvas = canvasRefs.canvas1.current
      const ctx = canvas.getContext ? canvas.getContext('2d') : null
      if (ctx) {
        canvasContextRef.current = ctx

        const img = new Image()
        img.src = canvasContent || previewImage

        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          if (!isGraffitiEnabled) {
            // 如果涂鸦功能被禁用，禁用画布的事件
            canvas.style.pointerEvents = 'none'
          } else {
            canvas.style.pointerEvents = 'auto'
          }
        }

        img.onerror = () => {
          message.error('无法加载图片，请重试')
          setPreviewVisible(false)
        }
      }
    }
  }, [previewVisible, previewImage, canvasContent, isGraffitiEnabled, canvasRefs.canvas1])

  const startDrawing = useCallback(
    (x, y) => {
      if (!isGraffitiEnabled) return
      const canvas = canvasRefs.canvas1.current
      if (!canvasContextRef.current || !canvas) return

      const { left, top, width, height } = canvas.getBoundingClientRect()
      const adjustedX = ((x - left) * canvas.width) / width
      const adjustedY = ((y - top) * canvas.height) / height

      const ctx = canvasContextRef.current
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.strokeStyle = 'red'
      ctx.beginPath()
      ctx.moveTo(adjustedX, adjustedY)

      paintingRef.current = true
    },
    [brushSize, isGraffitiEnabled, canvasRefs.canvas1]
  )

  // 绘画
  const draw = useCallback(
    (x, y) => {
      if (!isGraffitiEnabled) return
      if (!paintingRef.current || !canvasContextRef.current) return

      const canvas = canvasRefs.canvas1.current
      if (!canvas) return

      const { left, top, width, height } = canvas.getBoundingClientRect()
      const adjustedX = ((x - left) * canvas.width) / width
      const adjustedY = ((y - top) * canvas.height) / height

      const ctx = canvasContextRef.current
      ctx.lineTo(adjustedX, adjustedY)
      ctx.stroke()
    },
    [isGraffitiEnabled, canvasRefs.canvas1]
  )

  const stopDrawing = useCallback(() => {
    if (!isGraffitiEnabled) return
    if (paintingRef.current) {
      canvasContextRef.current.closePath()
    }
    paintingRef.current = false
  }, [isGraffitiEnabled])

  const dataURLToBlob = useCallback((dataURL) => {
    const [mime, bstr] = [dataURL.split(',')[0].match(/:(.*?);/)[1], atob(dataURL.split(',')[1])]
    const n = bstr.length
    const u8arr = new Uint8Array(n)
    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i)
    }
    return new Blob([u8arr], { type: mime })
  }, [])

  const generateBlackMask = useCallback(() => {
    if (!isGraffitiEnabled) return null
    const canvas = canvasRefs.canvas1.current
    const blackCanvas = canvasRefs.canvas2.current
    if (!canvas || !blackCanvas || !canvasContextRef.current) return null

    const ctx = blackCanvas.getContext('2d')
    blackCanvas.width = canvas.width
    blackCanvas.height = canvas.height
    const imgData = canvasContextRef.current.getImageData(0, 0, canvas.width, canvas.height)
    const data = imgData.data

    let isCanvasEmpty = true
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] !== 0) {
        isCanvasEmpty = false
        break
      }
    }

    if (isCanvasEmpty) {
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, blackCanvas.width, blackCanvas.height)
    } else {
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, blackCanvas.width, blackCanvas.height)

      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 200 && data[i + 1] < 50 && data[i + 2] < 50) {
          data[i] = data[i + 1] = data[i + 2] = 255
        } else {
          data[i + 3] = 0
        }
      }
      ctx.putImageData(imgData, 0, 0)
    }

    const dataURL = blackCanvas.toDataURL('image/png')
    const blob = dataURLToBlob(dataURL)

    const filename = 'black_mask.png'

    return { blob, filename }
  }, [isGraffitiEnabled, canvasRefs.canvas1, canvasRefs.canvas2, dataURLToBlob])

  const generatePureBlackImage = (referenceFile) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = URL.createObjectURL(referenceFile)

      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext('2d')
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
          const blackImageFile = new File([blob], 'black_mask.png', {
            type: 'image/png',
          })
          resolve({ blob: blackImageFile, filename: 'black_mask.png' })
        }, 'image/png')
      }

      img.onerror = () => {
        message.error('无法生成纯黑色图片')
        reject(null)
      }
    })
  }

  const handleModalOk = () => {
    if (isGraffitiEnabled) {
      const blackMaskResult = generateBlackMask()

      if (!blackMaskResult) {
        message.error('无法生成图片，请重试')
        return
      }
      handleUpload(blackMaskResult, imgKey[1])
      setPreviewVisible(false)
      setCanvasContent(null)
    } else {
      setPreviewVisible(false)
    }
  }

  const beforeUpload = (file) => {
    if (!file.type.startsWith('image/')) {
      message.error('只能上传图片文件')
      return Upload.LIST_IGNORE
    }
    return true
  }

  return (
    <>
      <Upload
        listType="picture-card"
        fileList={fileList}
        onChange={handleChange}
        onPreview={handlePreview}
        className="upload-section"
        beforeUpload={beforeUpload}
        showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
      >
        {fileList.length < 1 && (
          <div className="upload-con">
            <div
              className="upload-logo"
              style={{
                backgroundImage: `url(${logo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            ></div>
            <div className="upload-text">
              {text}
              {isRequire && <span className="upload-isRequire">*</span>}
            </div>
          </div>
        )}
      </Upload>

      <Modal
        open={previewVisible}
        title={modalTitle}
        onOk={handleModalOk}
        onCancel={() => setPreviewVisible(false)}
        footer={
          isGraffitiEnabled
            ? [
                <div className="up-footer" key="footer">
                  <div className="footer-left">
                    <span className="change_icon"></span>
                    <Slider
                      min={5}
                      max={25}
                      value={brushSize}
                      onChange={(value) => setBrushSize(value)}
                      style={{ width: 200 }}
                    />
                  </div>
                  <div className="up-btn" onClick={handleModalOk}>
                    上传
                  </div>
                </div>,
              ]
            : null
        }
      >
        <canvas
          ref={canvasRefs.canvas1}
          onMouseDown={(e) => {
            e.preventDefault()
            startDrawing(e.clientX, e.clientY)
          }}
          onMouseUp={stopDrawing}
          onMouseMove={(e) => {
            e.preventDefault()
            if (paintingRef.current) {
              draw(e.clientX, e.clientY)
            }
          }}
          onMouseLeave={stopDrawing}
          onTouchStart={(e) => {
            const touch = e.touches[0]
            startDrawing(touch.clientX, touch.clientY)
          }}
          onTouchEnd={stopDrawing}
          onTouchMove={(e) => {
            const touch = e.touches[0]
            if (paintingRef.current) {
              draw(touch.clientX, touch.clientY)
            }
          }}
          className="canvas"
          style={{
            cursor: isGraffitiEnabled ? 'crosshair' : 'default',
          }}
        />
        {isGraffitiEnabled && <canvas ref={canvasRefs.canvas2} style={{ display: 'none' }} />}
      </Modal>
    </>
  )
}

export default ImageUploader
