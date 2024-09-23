import React, { useMemo, useState, useRef } from "react";
import { ColorPicker, Switch, message } from "antd";
import Image from 'next/image';
import './Color-set.css'

const Color = ({ logo, cb }) => {
  const [color, setColor] = useState("#3b5bba");
  const [switchValue, setSwitchValue] = useState(false);
  const pickerRef = useRef(null);
  const bgColor = useMemo(() => (typeof color === 'string' ? color : color.toHexString()), [color]);
  const btnStyle = {
    backgroundColor: bgColor,
    height:'1.3rem',
    width:'1.3rem'
  };
  const switchChange = (checked) => {
    console.log(logo);
    if (!logo) {
      message.error('请先选择品牌logo！');
      return;
    }
    setSwitchValue(checked);
    cb({ color: color, checked: checked });
  };

  const handlePickerClick = () => {
    if (pickerRef.current) {
      pickerRef.current.click();
    }
  };

  return (
    <div className='set-page upload-section'>
      <div className='color-switch'>
        <Switch value={switchValue} onChange={switchChange} />
      </div>
      <div className="image-container">
        <Image
          src='https://mind-file.oss-cn-beijing.aliyuncs.com/Load%20Garment%20Image.png'
          alt=""
          fill
          style={{ objectFit: 'contain' }} 
        />
      </div>

      <div className="reset-picker" onClick={handlePickerClick} style={{ cursor: 'pointer' }}>
        <ColorPicker
          value={color}
          onChange={(e) => {
            setColor(e.toHexString());
          }} 
        ><div ref={pickerRef} style={btnStyle}></div></ColorPicker>
        <div className='color-text'>{color}</div>
        <Image
          src='/color.svg'
          alt="生成结果"
          width={20}
          height={20}
          style={{ objectFit: 'contain' }} 
        />
      </div>
    </div>
  );
};

export default Color;
