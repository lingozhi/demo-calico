'use client'
import React, { useState, useRef } from "react";
import "./page.css";
import axios from "@/app/lib/axios";
import ImageUploader from "./ImageUploader";
import ColorSet from "./Color-set";
import CustomModal from "./CustomModal";

const ImageUploadAndEdit = () => {
  // const [printSize, setPrintSize] = useState("mid"); // 默认选中中间
  const [changeLevel, setChangeLevel] = useState(2); // 默认选中中间
  const paramsRef = useRef({ garment_color: "#ebeff8" });
  const [taskID, setTaskID] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const getImg = async () => {
    try {
      let workflow_id = 10 - changeLevel;
      if (paramsRef.current.load_logo_image) {
        workflow_id -= 3;
      }
      if (paramsRef.current.load_style_image) {
        workflow_id -= 3;
      }

      const response = await axios.post("/api/proxy", {
        path: "jeanswest_pattern_generation",
        positive_prompt: "a art printing",
        load_garment_image:
          "https://mind-file.oss-cn-beijing.aliyuncs.com/Load%20Garment%20Image.png",
          load_model_image: "https://mind-file.oss-cn-beijing.aliyuncs.com/Load%20Model%20Image.jpg",
        remove_printing_background: true,
        printing_scale: 1.5,
        workflow_id: workflow_id, 
        ...paramsRef.current,
      });

      if (response.status === 200) {
        const data = response.data;
        setTaskID(data.data.taskID); // 设置 taskID
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error.message || error);
    }
  };

  return (
    <div className="container">
      <div className="row1">
        <ImageUploader
          text="原始印花图片"
          modalTitle="请涂抹出放置LOGO的区域"
          isRequire={true}
          logo="/upload.svg"
          imgKey={["load_original_image", "load_original_mask"]}
          onUploadSuccess={(key, value) => {
            paramsRef.current = { ...paramsRef.current, [key]: value };
          }}
        />
        <ImageUploader
          modalTitle="请涂抹遮盖图中文字元素"
          text="参考风格"
          imgKey={["load_style_image", "load_style_mask"]}
          logo="/upload.svg"
          onUploadSuccess={(key, value) => {
            paramsRef.current = { ...paramsRef.current, [key]: value };
          }}
        />
      </div>
      <div className="row1">
        <ImageUploader
          text="品牌logo"
          modalTitle="品牌logo"
          imgKey={["load_logo_image"]}
          onUploadSuccess={(key, value) => {
            paramsRef.current = { ...paramsRef.current, [key]: value };
          }}
        />
        <ColorSet
          cb={(e) => {
            paramsRef.current = { ...paramsRef.current, garment_color: e };
          }}
        />
      </div>

      <div className="select mag-top">
        <div className="left-text">变化程度</div>
        <div className="right-btn">
          <div
            className={`radio-left ${changeLevel === 1 ? "selected" : ""}`}
            onClick={() => setChangeLevel(1)}
          >
            X1
          </div>
          <div
            className={`radio-mid ${changeLevel === 2 ? "selected" : ""}`}
            onClick={() => setChangeLevel(2)}
          >
            X2
          </div>
          <div
            className={`radio-right ${changeLevel === 3 ? "selected" : ""}`}
            onClick={() => setChangeLevel(3)}
          >
            X3
          </div>
        </div>
      </div>

      <div className="last-con">
        <div
          className="imme-gen"
          onClick={() => {
            setIsModalOpen(true);
            getImg(); // 点击生成时触发图片生成
          }}
        >
          立刻生成
        </div>
      </div>

      <CustomModal
      setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
        taskID={taskID} // 传递 taskID 给子组件
        handleRegenerate={getImg} // 重新生成图片
      />
    </div>
  );
};

export default ImageUploadAndEdit;
