/*
 * @Author: chen 13714733197@163.com
 * @Date: 2024-09-21 09:40:39
 * @LastEditors: chen 13714733197@163.com
 * @LastEditTime: 2024-09-22 12:26:41
 * @FilePath: \demo-calico\src\app\Color-set.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
"use client";
import React, { useMemo, useState } from "react";
import { Button, ColorPicker } from "antd";
const Color = ({ cb }) => {
  const [color, setColor] = useState("#ebeff8");
  const bgColor = useMemo(
    () => (typeof color === "string" ? color : color.toHexString()),
    [color]
  );
  const btnStyle = {
    backgroundColor: bgColor,
  };
  return (
    <ColorPicker
      value={color}
      onChange={(e) => {
        setColor(e.toHexString());
        cb(e.toHexString());
      }}
    >
      <div className="upload-section upload-text" style={btnStyle}>
        衣服颜色
      </div>
    </ColorPicker>
  );
};
export default Color;
