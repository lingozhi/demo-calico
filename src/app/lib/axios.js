import axios from "axios";

const instance = axios.create({
  baseURL: "/", // 使用环境变量设置 base URL
  timeout: 30000, // 设置请求超时时间
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = "534dc1cc256cd9c3f1b62f14900fa5978SnLbY";
    if (token) {
      config.headers["ai-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
    }
    return Promise.reject(error);
  }
);

export default instance;
