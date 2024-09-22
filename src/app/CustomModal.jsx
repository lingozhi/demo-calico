import { Modal, Button, Image, message, Spin } from "antd";
import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "@/app/lib/axios";
import "./CustomModal.css";
const CustomModal = ({
  isModalOpen,
  handleRegenerate,
  setIsModalOpen,
  taskID,
}) => {
  const [loading, setLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const timeoutIdRef = useRef(null);

  const getImg2 = useCallback(async () => {
    let attemptCount = 0;

    const checkProgress = async () => {
      attemptCount++;
      try {
        const result = await axios.post("/api/proxy", {
          path: "img2img/query",
          taskID: taskID,
        });
        const progress = result?.data?.data?.progress;

        if (progress === 100) {
          setGeneratedImageUrl(result?.data?.data?.imageFiles[0]?.url);
          setLoading(false);
          return;
        }

        if (attemptCount >= 8) {
          message.error("生成图片错误，请重试！");
          setLoading(false);
          return;
        }

        const delay = progress < 50 ? 30000 : 15000;
        timeoutIdRef.current = setTimeout(checkProgress, delay);
      } catch (error) {
        console.error("Error fetching progress:", error);
        message.error("生成图片错误，请重试！");
        setLoading(false);
      }
    };

    checkProgress();
  }, [taskID]);

  useEffect(() => {
    if (taskID) {
      setLoading(true);
      getImg2();
    }

    return () => {
      // 在组件卸载时清理定时器
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [taskID, getImg2]);

  const downloadImage = () => {
    message.info('正在下载')
    const link = document.createElement("a");
    link.href = generatedImageUrl;
    link.download = "image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      open={isModalOpen}
      onCancel={() => {
        setIsModalOpen(false);
      }}
      footer={[
        <div className="custom-footer">
          <div
            key="download"
            onClick={downloadImage}
            disabled={!generatedImageUrl}
            className="download"
          >
            下载图片
          </div>
          <div key="regenerate" onClick={handleRegenerate} className="afresh">
            重新生成
          </div>
        </div>,
      ]}
    >
      <Spin spinning={loading} tip="正在生成图片，请稍等...">
        <div className="custom-con">
          {generatedImageUrl && (
            <Image
              src={generatedImageUrl}
              alt="生成结果"
              width={300}
              style={{ maxWidth: "100%" }}
            />
          )}
        </div>
      </Spin>
    </Modal>
  );
};

export default CustomModal;
