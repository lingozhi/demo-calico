import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const path = body.path; // 从请求体中获取目标路径
    const apiUrl = `http://dev.chimerai.cn:11118/v1/${path}`; // 构建外部 API 的 URL

    // 删除 path 属性，因为它不需要转发到外部 API
    delete body.path;

    // 转发请求到外部 API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ai-token": "534dc1cc256cd9c3f1b62f14900fa5978SnLbY",
        terminal: "4",
      },
      body: JSON.stringify(body), // 将请求体转发给外部 API
    });

    // 检查外部 API 请求是否成功
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${errorText}`);
    }

    // 获取响应数据并返回
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy error:", error.message);
    return NextResponse.json(
      { error: `Failed to proxy the request: ${error.message}` },
      { status: 500 }
    );
  }
}
