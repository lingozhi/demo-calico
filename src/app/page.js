"use client";
import React, { useState, useRef, useEffect } from "react";
import "./page.css";
import axios from "@/app/lib/axios";
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
      console.log(img.naturalWidth, "img.naturalWidth");
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
    const response = await fetch(
      "http://dev.chimerai.cn:11118/v1/jeanswest_pattern_generation_with_tryon",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ai-token": "534dc1cc256cd9c3f1b62f14900fa5978SnLbY",
          terminal: "4",
        },
        body: JSON.stringify({
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
      }
    );
    if (response.ok) {
      const data = await response.json();
      setTaskID(data.data.taskID);
    } else {
      const errorMessage = await response.text();
      console.error("Error:", errorMessage);
    }
  };

  const getImg2 = async () => {
    const result = await axios.post(
      "http://dev.chimerai.cn:11118/v1/img2img/query",
      {
        taskID: taskID,
      }
    );
    if (result?.data?.data?.progress === 100) {
      setImages((prevImages) => ({
        ...prevImages,
        imageUrl4: result.data.data.imageFiles[0].url,
      }));
    }
    console.log("progress", result?.data?.data?.progress);
  };
  useEffect(() => {
    if (Object.keys(params).length === 5) {
      getImg();
    }
  }, [params]);

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
        <h3>上传模型图</h3>
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
      <div className="upload-section">
        {images.imageUrl4 && (
          <div className="canvas-container">
            <canvas ref={canvasRefs.canvas6} className="canvas" />
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
        提交图片
      </button>
      <button
        className="submit-button"
        onClick={() => {
          getImg2();
        }}
      >
        获取图片
      </button>
    </div>
  );
};

export default ImageUploadAndEdit;
