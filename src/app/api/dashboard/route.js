import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    // 使用 request.formData() 解析 multipart/form-data
    const formData = await request.formData();
    const file = formData.get("file"); // 假设文件字段的名称是 'file'

    // 检查文件是否存在
    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    // 将文件读取为 ArrayBuffer，然后转换为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 使用 @vercel/blob 的 put 方法上传文件
    const blob = await put(filename, buffer, {
      access: "public",
    });

    return NextResponse.json(blob);
  } catch (error) {
    return NextResponse.json(
      { message: "File upload failed", error: error.message },
      { status: 500 }
    );
  }
}
