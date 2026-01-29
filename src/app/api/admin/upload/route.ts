import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".webp";
  const safeName = `img_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, safeName);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, buffer);

  return NextResponse.json({ url: `/uploads/${safeName}` });
}
