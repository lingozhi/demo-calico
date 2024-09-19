"use client";
import React, { useState, useRef, useEffect } from "react";
import "./page.css";
const ImageUploadAndEdit = () => {
  const [params, setParams] = useState({});
  const [images, setImages] = useState({
    img1: null,
    img2: null,
    img3: null,
    imageUrl1: null,
    imageUrl2: null,
    imageUrl3: null,
  });

  const canvasRefs = {
    canvas1: useRef(null), // 用于第一张图片涂鸦的画布
    canvas2: useRef(null), // 用于第一张图片生成黑底白涂鸦的画布
    canvas3: useRef(null), // 用于第二张图片涂鸦的画布
    canvas4: useRef(null), // 用于第二张图片生成黑底白涂鸦的画布
    canvas5: useRef(null), // 用于LOGO图片生成黑底白涂鸦的画布
  };

  const [painting, setPainting] = useState({
    painting1: false,
    painting2: false,
  });

  // 通用上传图片方法
  const handleUpload = (event, imgKey, urlKey) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      setImages((prevImages) => ({
        ...prevImages,
        [imgKey]: img,
        [urlKey]: e.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // 确保图片被正确绘制到 canvas 上
  useEffect(() => {
    if (images.img1 && canvasRefs.canvas1.current) {
      drawImageToCanvas("canvas1", images.img1);
    }
  }, [images.img1]);

  useEffect(() => {
    if (images.img2 && canvasRefs.canvas3.current) {
      drawImageToCanvas("canvas3", images.img2);
    }
  }, [images.img2]);

  useEffect(() => {
    if (images.img3 && canvasRefs.canvas5.current) {
      drawImageToCanvas("canvas5", images.img3);
    }
  }, [images.img3]);

  // 通用绘制图片到 canvas 的方法
  const drawImageToCanvas = (canvasKey, img) => {
    const canvas = canvasRefs[canvasKey].current;
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height); // 绘制图片

    // 保存原始图片的 base64 数据
    const originalImageBase64 = canvas.toDataURL("image/png");
    if (canvasKey === "canvas1") {
      setParams((prev) => ({
        ...prev,
        load_original_image: originalImageBase64,
      }));
    } else if (canvasKey === "canvas3") {
      setParams((prev) => ({ ...prev, load_style_image: originalImageBase64 }));
    } else if (canvasKey === "canvas5") {
      setParams((prev) => ({ ...prev, load_logo_image: originalImageBase64 }));
    }
  };

  // 涂鸦操作
  const handleMouseDown = (paintingKey) => {
    setPainting((prevState) => ({
      ...prevState,
      [paintingKey]: true,
    }));
  };

  const handleMouseUp = (paintingKey) => {
    setPainting((prevState) => ({
      ...prevState,
      [paintingKey]: false,
    }));
    const canvasKey = paintingKey === "painting1" ? "canvas1" : "canvas3";
    const ctx = canvasRefs[canvasKey].current.getContext("2d");
    ctx.beginPath();
  };

  const handleMouseMove = (e, paintingKey) => {
    if (!painting[paintingKey]) return;

    const canvasKey = paintingKey === "painting1" ? "canvas1" : "canvas3";
    const canvas = canvasRefs[canvasKey].current;
    if (!canvas) return; // 确保 canvas 存在

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect(); // 获取 canvas 显示的矩形区域
    const scaleX = canvas.width / rect.width; // 计算 X 轴缩放比例
    const scaleY = canvas.height / rect.height; // 计算 Y 轴缩放比例

    // 根据缩放比例调整鼠标位置
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255, 0, 0, 0.7)"; // 红色涂鸦

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // 通用生成黑底白涂鸦图片方法
  const handleSubmit = (canvasKey, blackCanvasKey) => {
    const canvas = canvasRefs[canvasKey].current;
    const blackCanvas = canvasRefs[blackCanvasKey].current;

    const ctx = blackCanvas.getContext("2d");
    blackCanvas.width = canvas.width;
    blackCanvas.height = canvas.height;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, blackCanvas.width, blackCanvas.height); // 填充黑色背景

    const imgData = canvas
      .getContext("2d")
      .getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < imgData.data.length; i += 4) {
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];
      // 如果是红色（涂鸦部分），将其转换为白色
      if (r > 200 && g < 50 && b < 50) {
        imgData.data[i] = 255;
        imgData.data[i + 1] = 255;
        imgData.data[i + 2] = 255;
        imgData.data[i + 3] = 255;
      } else {
        imgData.data[i + 3] = 0;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const doodlesOnBlack = blackCanvas.toDataURL("image/png");
    if (canvasKey === "canvas1") {
      setParams((pre) => ({ ...pre, load_original_mask: doodlesOnBlack }));
    } else {
      setParams((pre) => ({ ...pre, load_style_mask: doodlesOnBlack }));
    }
  };

  useEffect(() => {
    if (Object.keys(params).length > 0) {
      for (const key in params) {
        if (Object.hasOwnProperty.call(params, key)) {
          const element = params[key];
          // console.log(element);
        }
      }
    }
    console.log(params);
  }, [params]);

  // fetch('YOUR_SERVER_ENDPOINT', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ image1: imageData1, image2: imageData2 }),
  // })
  // .then(response => response.json())
  // .then(data => console.log('Success:', data))
  // .catch(error => console.error('Error:', error));

  return (
    <div className="container">
      <div className="upload-section mg4">
        <h3>上传原型图片</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleUpload(e, "img1", "imageUrl1")}
          className="upload-input"
        />
        {images.imageUrl1 && (
          <div className="canvas-container">
            <canvas
              ref={canvasRefs.canvas1}
              onMouseDown={() => handleMouseDown("painting1")}
              onMouseUp={() => handleMouseUp("painting1")}
              onMouseMove={(e) => handleMouseMove(e, "painting1")}
              className="canvas"
            />
            <canvas ref={canvasRefs.canvas2} style={{ display: "none" }} />
          </div>
        )}
      </div>

      <div className="upload-section">
        <h3>上传第二张图片</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleUpload(e, "img2", "imageUrl2")}
          className="upload-input"
        />
        {images.imageUrl2 && (
          <div className="canvas-container">
            <canvas
              ref={canvasRefs.canvas3}
              onMouseDown={() => handleMouseDown("painting2")}
              onMouseUp={() => handleMouseUp("painting2")}
              onMouseMove={(e) => handleMouseMove(e, "painting2")}
              className="canvas"
            />
            <canvas ref={canvasRefs.canvas4} style={{ display: "none" }} />
          </div>
        )}
      </div>
      <div className="upload-section">
        <h3>上传LOGO</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleUpload(e, "img3", "imageUrl3")}
          className="upload-input"
        />
        {images.imageUrl3 && (
          <div className="canvas-container">
            <canvas ref={canvasRefs.canvas5} className="canvas" />
          </div>
        )}
      </div>
      <button
        className="submit-button"
        onClick={() => {
          handleSubmit("canvas1", "canvas2");
          handleSubmit("canvas3", "canvas4");
        }}
      >
        提交图片涂鸦
      </button>
    </div>
  );
};

export default ImageUploadAndEdit;
