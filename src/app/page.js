"use client";
import React, { useState, useRef, useEffect } from "react";
import "./page.css";
import axios from "@/app/lib/axios";
import { Button, message, Spin } from "antd";
const ImageUploadAndEdit = () => {
  const [params, setParams] = useState({});
  const [images, setImages] = useState({
    img1: null,
    img2: null,
    img3: null,
    img4: null,
    imageUrl1: null,
    imageUrl2: null,
    imageUrl3: null,
    imageUrl4: null,
  });
  const [loading, setLoading] = useState({
    img1: false,
    img2: false,
    img3: false,
    img4: false,
    loadingImg5: false,
  });
  const [taskID, setTaskID] = useState();
  const canvasRefs = {
    canvas1: useRef(null),
    canvas2: useRef(null),
    canvas3: useRef(null),
    canvas4: useRef(null),
    canvas5: useRef(null),
    canvas6: useRef(null),
  };

  const [painting, setPainting] = useState({
    painting1: false,
    painting2: false,
  });

  const handleUpload = async (event, imgKey, urlKey) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading((pre) => ({
      ...pre,
      [imgKey]: true,
    }));
    try {
      const response = await fetch(`/api/dashboard?filename=${file.name}`, {
        method: "POST",
        body: file,
      });

      const newBlob = await response.json();
      const imageUrl = newBlob.url;

      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrl;

      img.onload = () => {
        setImages((prevImages) => ({
          ...prevImages,
          [imgKey]: img,
          [urlKey]: imageUrl,
        }));

        if (imgKey === "img1") {
          setParams((prev) => ({ ...prev, load_original_image: imageUrl }));
        } else if (imgKey === "img2") {
          setParams((prev) => ({ ...prev, load_style_image: imageUrl }));
        } else if (imgKey === "img3") {
          setParams((prev) => ({ ...prev, load_logo_image: imageUrl }));
        }
      };
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

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

  useEffect(() => {
    if (images.imageUrl4) {
      const img = new Image();
      img.src = images.imageUrl4;
      console.log(img.src);
      img.crossOrigin = "Anonymous"; // Ensure cross-origin compatibility if needed
      img.onload = () => {
        const canvas = canvasRefs["canvas6"].current;
        const ctx = canvas.getContext("2d");

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
      };
    }
  }, [images.imageUrl4]);
  const drawImageToCanvas = (canvasKey, img) => {
    const canvas = canvasRefs[canvasKey].current;
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height);
    if (canvasKey === "canvas1") {
      setLoading((pre) => ({
        ...pre,
        img1: false,
      }));
    }
    if (canvasKey === "canvas3") {
      setLoading((pre) => ({
        ...pre,
        img2: false,
      }));
    }
    if (canvasKey === "canvas5") {
      setLoading((pre) => ({
        ...pre,
        img3: false,
      }));
    }
  };

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
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleSubmit = async (canvasKey, blackCanvasKey) => {
    const canvas = canvasRefs[canvasKey].current;
    const blackCanvas = canvasRefs[blackCanvasKey].current;

    const ctx = blackCanvas.getContext("2d");
    blackCanvas.width = canvas.width;
    blackCanvas.height = canvas.height;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, blackCanvas.width, blackCanvas.height);

    const imgData = canvas
      .getContext("2d")
      .getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < imgData.data.length; i += 4) {
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];
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

    blackCanvas.toBlob(async (blob) => {
      const file = new File([blob], `${canvasKey}-mask.png`, {
        type: "image/png",
      });

      try {
        const response = await fetch(`/api/dashboard?filename=${file.name}`, {
          method: "POST",
          body: file,
        });

        const newBlob = await response.json();
        const imageUrl = newBlob.url;

        if (canvasKey === "canvas1") {
          setParams((pre) => ({ ...pre, load_original_mask: imageUrl }));
        } else {
          setParams((pre) => ({ ...pre, load_style_mask: imageUrl }));
        }
      } catch (error) {
        console.error("Error uploading the mask:", error);
      }
    }, "image/png");
  };

  const getImg = async () => {
    const response = await fetch("/api/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ai-token": "534dc1cc256cd9c3f1b62f14900fa5978SnLbY",
        terminal: "4",
      },
      body: JSON.stringify({
        path: "jeanswest_pattern_generation_with_tryon",
        load_original_image:
          "https://mind-file.oss-cn-beijing.aliyuncs.com/Load%20Original%20Image.jpg",
        load_original_mask:
          "https://mind-file.oss-cn-beijing.aliyuncs.com/Load%20Original%20Mask.png",
        load_style_image:
          "https://mind-file.oss-cn-beijing.aliyuncs.com/Load%20Style%20Image.jpg",
        load_style_mask:
          "https://mind-file.oss-cn-beijing.aliyuncs.com/Load%20Style%20Mask.png",
        load_logo_image:
          "https://mind-file.oss-cn-beijing.aliyuncs.com/Load%20Logo%20Image.jpg",
        positive_prompt: "a art printing",
        load_model_image:
          "https://mind-file.oss-cn-beijing.aliyuncs.com/Load%20Model%20Image.jpg",
        load_garment_image:
          "https://mind-file.oss-cn-beijing.aliyuncs.com/Load%20Garment%20Image.png",
        garment_color: "#7F179B",
        remove_printing_background: true,
        printing_scale: 1.5,
        ...params,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      setTaskID(data.data.taskID);
    } else {
      const errorMessage = await response.text();
      console.error("Error:", errorMessage);
    }
  };

  const getImg2 = async () => {
    let attemptCount = 0; // 计数器，用于记录轮询次数

    const checkProgress = async () => {
      attemptCount++; // 每次轮询时增加计数

      try {
        const result = await axios.post("/api/proxy", {
          path: "img2img/query",
          taskID: taskID,
        });
        const progress = result?.data?.data?.progress;
        console.log("progress", progress);

        // 如果进度是 100，停止轮询
        if (progress === 100) {
          setImages((prevImages) => ({
            ...prevImages,
            imageUrl4: result.data.data.imageFiles[0].url,
          }));
          setLoading((pre) => ({
            ...pre,
            img4: false,
          }));
          return;
        }

        // 如果轮询次数达到5次，停止轮询
        if (attemptCount >= 6) {
          console.log("Reached max attempts, stopping polling");
          setLoading((pre) => ({
            ...pre,
            img4: false,
          }));
          message.info("生成图片错误，请重试！");
          return;
        }

        const delay = progress < 50 ? 30000 : 15000;
        setTimeout(checkProgress, delay);
      } catch (error) {
        console.error("Error fetching progress:", error);
        // 如果发生错误，也停止轮询
        setLoading((pre) => ({
          ...pre,
          img4: false,
        }));
        message.info("生成图片错误，请重试！");
      }
    };

    // 开始首次检查进度
    checkProgress();
  };

  const handleTouchStart = (paintingKey) => {
    setPainting((prevState) => ({
      ...prevState,
      [paintingKey]: true,
    }));
  };

  const handleTouchEnd = (paintingKey) => {
    setPainting((prevState) => ({
      ...prevState,
      [paintingKey]: false,
    }));
    const canvasKey = paintingKey === "painting1" ? "canvas1" : "canvas3";
    const ctx = canvasRefs[canvasKey].current.getContext("2d");
    ctx.beginPath();
  };

  const handleTouchMove = (e, paintingKey) => {
    if (!painting[paintingKey]) return;

    const canvasKey = paintingKey === "painting1" ? "canvas1" : "canvas3";
    const canvas = canvasRefs[canvasKey].current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // 处理触摸事件的位置
    const touch = e.touches[0]; // 获取第一根手指
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  useEffect(() => {
    if (Object.keys(params).length === 5) {
      getImg();
    }
  }, [params]);
  useEffect(() => {
    if (taskID) {
      getImg2();
    }
  }, [taskID]);
  return (
    <div className="container">
      <div className="upload-section">
        <h3>上传原型图</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleUpload(e, "img1", "imageUrl1")}
          className="upload-input"
        />
        <Spin spinning={loading.img1} delay={500}>
          <div className="max-h">
            {images.imageUrl1 && (
              <div className="canvas-container">
                <canvas
                  ref={canvasRefs.canvas1}
                  onMouseDown={() => handleMouseDown("painting1")}
                  onMouseUp={() => handleMouseUp("painting1")}
                  onMouseMove={(e) => handleMouseMove(e, "painting1")}
                  onTouchStart={() => handleTouchStart("painting1")}
                  onTouchEnd={() => handleTouchEnd("painting1")}
                  onTouchMove={(e) => handleTouchMove(e, "painting1")}
                  className="canvas"
                />
                <canvas ref={canvasRefs.canvas2} style={{ display: "none" }} />
              </div>
            )}
          </div>
        </Spin>
      </div>
      <div className="upload-section">
        <h3>上传风格图</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleUpload(e, "img2", "imageUrl2")}
          className="upload-input"
        />
        <Spin spinning={loading.img2} delay={500}>
          <div className="max-h">
            {images.imageUrl2 && (
              <div className="canvas-container">
                <canvas
                  ref={canvasRefs.canvas3}
                  onMouseDown={() => handleMouseDown("painting2")}
                  onMouseUp={() => handleMouseUp("painting2")}
                  onMouseMove={(e) => handleMouseMove(e, "painting2")}
                  onTouchStart={() => handleTouchStart("painting2")}
                  onTouchEnd={() => handleTouchEnd("painting2")}
                  onTouchMove={(e) => handleTouchMove(e, "painting2")}
                  className="canvas"
                />
                <canvas ref={canvasRefs.canvas4} style={{ display: "none" }} />
              </div>
            )}
          </div>
        </Spin>
      </div>
      <div className="upload-section">
        <h3>上传LOGO</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleUpload(e, "img3", "imageUrl3")}
          className="upload-input"
        />
        <Spin spinning={loading.img3} delay={500}>
          <div className="max-h">
            {images.imageUrl3 && (
              <div className="canvas-container">
                <canvas ref={canvasRefs.canvas5} className="canvas" />
              </div>
            )}
          </div>
        </Spin>
      </div>
      <Spin spinning={loading.img4} delay={500}>
        <div className="upload-section">
          {images.imageUrl4 && (
            <div className="canvas-container">
              <canvas ref={canvasRefs.canvas6} className="canvas" />
            </div>
          )}
        </div>
        <Button
          type="primary"
          className="submit-button"
          onClick={() => {
            setLoading((pre) => ({
              ...pre,
              img4: true,
            }));
            message.info("正在生成图片");
            handleSubmit("canvas1", "canvas2");
            handleSubmit("canvas3", "canvas4");
          }}
        >
          提交图片
        </Button>
      </Spin>
      {/* <Button
        type="primary"
        className="submit-button"
        onClick={() => {
          getImg2();
        }}
      >
        获取图片
      </Button> */}
    </div>
  );
};

export default ImageUploadAndEdit;
