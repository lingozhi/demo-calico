"use client";
import React, { useState, useRef, useEffect } from "react";

const ImageUploadAndEdit = () => {
  const [images, setImages] = useState({
    img1: null,
    img2: null,
    imageUrl1: null,
    imageUrl2: null,
  });

  const canvasRefs = {
    canvas1: useRef(null), // 用于第一张图片涂鸦的画布
    canvas2: useRef(null), // 用于第一张图片生成黑底白涂鸦的画布
    canvas3: useRef(null), // 用于第二张图片涂鸦的画布
    canvas4: useRef(null), // 用于第二张图片生成黑底白涂鸦的画布
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
      drawImageToCanvas(images.img1, canvasRefs.canvas1.current);
    }
  }, [images.img1]);

  useEffect(() => {
    if (images.img2 && canvasRefs.canvas3.current) {
      drawImageToCanvas(images.img2, canvasRefs.canvas3.current);
    }
  }, [images.img2]);

  // 通用绘制图片到 canvas 的方法
  const drawImageToCanvas = (img, canvas) => {
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height); // 绘制图片
  };

  // 涂鸦操作
  const handleMouseDown = (canvasKey) => {
    setPainting((prevState) => ({
      ...prevState,
      [canvasKey]: true,
    }));
  };

  const handleMouseUp = (canvasKey) => {
    setPainting((prevState) => ({
      ...prevState,
      [canvasKey]: false,
    }));
    const ctx = canvasRefs[canvasKey].current.getContext("2d");
    ctx.beginPath();
  };

  const handleMouseMove = (e, canvasKey) => {
    if (!painting[canvasKey]) return;

    const canvas = canvasRefs[canvasKey].current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
    console.log(`${canvasKey} 黑底白涂鸦图片:`, doodlesOnBlack);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div>
        <h3>上传第一张图片</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleUpload(e, "img1", "imageUrl1")}
        />
        {images.imageUrl1 && (
          <>
            <canvas
              ref={canvasRefs.canvas1}
              onMouseDown={() => handleMouseDown("painting1")}
              onMouseUp={() => handleMouseUp("painting1")}
              onMouseMove={(e) => handleMouseMove(e, "painting1")}
              style={{
                border: "1px solid black",
                marginTop: "20px",
                display: "block",
              }}
            />
            <canvas ref={canvasRefs.canvas2} style={{ display: "none" }} />
          </>
        )}
        <button onClick={() => handleSubmit("canvas1", "canvas2")}>
          提交第一张图片涂鸦
        </button>
      </div>

      <div>
        <h3>上传第二张图片</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleUpload(e, "img2", "imageUrl2")}
        />
        {images.imageUrl2 && (
          <>
            <canvas
              ref={canvasRefs.canvas3}
              onMouseDown={() => handleMouseDown("painting2")}
              onMouseUp={() => handleMouseUp("painting2")}
              onMouseMove={(e) => handleMouseMove(e, "painting2")}
              style={{
                border: "1px solid black",
                marginTop: "20px",
                display: "block",
              }}
            />
            <canvas ref={canvasRefs.canvas4} style={{ display: "none" }} />
          </>
        )}
        <button onClick={() => handleSubmit("canvas3", "canvas4")}>
          提交第二张图片涂鸦
        </button>
      </div>
    </div>
  );
};

export default ImageUploadAndEdit;
