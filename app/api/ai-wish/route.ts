import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_INSTRUCTION = `
Kamu adalah editor ucapan ulang tahun untuk pasangan yang sedang merayakan momen spesial.
Tugasmu adalah merapikan ucapan tamu tanpa mengubah maksud utama.

Aturan:
- Pertahankan nama, panggilan, detail penting, dan emosi yang ada di teks asli.
- Buat bahasa Indonesia yang hangat, natural, elegan, dan sedikit puitis.
- Jangan terdengar terlalu formal atau seperti puisi generik.
- Maksimal 80 kata.
- Jangan menambahkan fakta, tanggal, lokasi, atau janji yang tidak ada di teks asli.
- Output hanya teks ucapan final, tanpa tanda kutip, tanpa judul, tanpa penjelasan.
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? "Tamu").trim().slice(0, 60);
    const message = String(body?.message ?? "").trim().slice(0, 10000);

    if (!message) {
      return NextResponse.json({ error: "Ucapan masih kosong." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum diatur di environment variable." },
        { status: 500 }
      );
    }

    const client = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

    const interaction = await client.interactions.create({
      model,
      system_instruction: SYSTEM_INSTRUCTION,
      input: `Nama tamu: ${name}\n\nUcapan asli:\n${message}`,
      generation_config: {
        thinking_level: "low"
      }
    });

    const formatted = interaction.output_text?.trim();

    if (!formatted) {
      return NextResponse.json(
        { error: "Gemini tidak mengembalikan ucapan." },
        { status: 502 }
      );
    }

    return NextResponse.json({ formatted });
  } catch (error) {
    console.error("AI Wish Formatter error:", error);
    return NextResponse.json(
      { error: "Terjadi kendala saat memproses ucapan. Coba lagi." },
      { status: 500 }
    );
  }
}
