'use client'
import React, { useState, useRef } from "react";
import "./page.css";
import axios from "@/app/lib/axios";
import ImageUploader from "./ImageUploader";
import ColorSet from "./Color-set";
import CustomModal from "./CustomModal";
import { message } from "antd";

const ImageUploadAndEdit = () => {
  const [printSize, setPrintSize] = useState("mid"); // 默认选中中间
  const [changeLevel, setChangeLevel] = useState(2); // 默认选中中间
  const paramsRef = useRef({ garment_color: "#3b5bba",checked:false });
  const [taskID, setTaskID] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stateLogo, setStateLogo,] = useState(false);
  const getImg = async () => {
    try {
      let workflow_id = 10 - changeLevel;
      if (stateLogo&&!paramsRef.current.checked) {
        workflow_id -= 3;
      }else if( stateLogo&& paramsRef.current.checked ){
        workflow_id -= 6;
        paramsRef.current.load_logo_image="https://mind-file.oss-cn-beijing.aliyuncs.com/Load%20Logo%20Image.jpg"
      }else if( !stateLogo&& !paramsRef.current.checked ){
        paramsRef.current.load_logo_image="https://mind-file.oss-cn-beijing.aliyuncs.com/Load%20Logo%20Image.jpg"
      }

      const response = await axios.post("/api/proxy", {
          path: "jeanswest_pattern_generation",
          positive_prompt: "a art printing",
          load_model_image: "https://mind-file.oss-cn-beijing.aliyuncs.com/Load%20Model%20Image.jpg",
          load_garment_image: "https://mind-file.oss-cn-beijing.aliyuncs.com/Load%20Garment%20Image.png",
          garment_color: "#7F179B",
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
            paramsRef.current[key] = value;
          }}
          
        />
        <ImageUploader
          modalTitle="请涂抹遮盖图中文字元素"
          text="参考风格"
          imgKey={["load_style_image", "load_style_mask"]}
          logo="/upload.svg"
          isRequire={true}
          onUploadSuccess={(key, value) => {
            paramsRef.current[key] = value;
          }}
        />
      </div>
      <div className="row1">
        <ImageUploader
          text="品牌logo"
          modalTitle="品牌logo"
          imgKey={["load_logo_image"]}
          onUploadSuccess={(key, value) => {
            paramsRef.current[key] = value;
            
            if (value) {
              setStateLogo(true)
            }else{
              setStateLogo(false)
            }
          }}
        />
        <ColorSet
        logo={stateLogo}
          cb={(e) => {
            paramsRef.current['garment_color'] =  e.color;
            paramsRef.current['checked'] =  e.checked;
          }}
        />
      </div>

      {/* <div className="select mag-top">
        <div className="left-text">印花大小</div>
        <div className="right-btn">
          <div
            className={`radio-left ${changeLevel === 1 ? "selected" : ""}`}
            onClick={() => setPrintSize(1)}
          >
            小
          </div>
          <div
            className={`radio-mid ${changeLevel === 2 ? "selected" : ""}`}
            onClick={() => setPrintSize(2)}
          >
            中
          </div>
          <div
            className={`radio-right ${changeLevel === 3 ? "selected" : ""}`}
            onClick={() => setPrintSize(3)}
          >
            大
          </div>
        </div>
      </div> */}
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
            onClick={() => {
              setChangeLevel(3)
              console.log(paramsRef.current);
            }}
          >
            X3
          </div>
        </div>
      </div>

      <div className="last-con">
        <div
          className="imme-gen"
          onClick={() => {
            const {load_original_image,load_style_image} = paramsRef.current
            if (!load_original_image) {
              message.error("请选择原始印花图片！")
              return
            }
            if (!load_style_image) {
              message.error("请选择参选风格图片！")
              return
            }
            setIsModalOpen(true);
            getImg(); 
          }}
        >
          立刻生成
        </div>
      </div>

      <CustomModal
      setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
        taskID={taskID} 
        handleRegenerate={getImg} 
      />
    </div>
  );
};

export default ImageUploadAndEdit;
