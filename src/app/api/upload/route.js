import client from '../../lib/oss';
import { NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename");

    const form = new formidable.IncomingForm({
        maxFileSize: 10 * 1024 * 1024, // 10 MB
      });
    
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file = files.file;
    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = fs.readFileSync(file.filepath);
    const uniqueFilename = `${Date.now()}_${file.originalFilename}`;
    const result = await client.put(uniqueFilename, buffer);
    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "File upload failed", error: error.message },
      { status: 500 }
    );
  }
}
