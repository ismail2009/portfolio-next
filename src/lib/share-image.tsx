import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteUrl } from "./site";

// Share images are always English: the image renderer (Satori) doesn't support right-to-left text.
export const shareImageSize = { width: 1200, height: 630 };

const fontDir = join(process.cwd(), "src/assets/og");
const [display, sans, mono] = await Promise.all([
  readFile(join(fontDir, "bricolage-800.ttf")),
  readFile(join(fontDir, "plex-sans-500.ttf")),
  readFile(join(fontDir, "jetbrains-mono-500.ttf")),
]);

type ShareImageProps = {
  eyebrow: string;
  title: string;
  accent?: string;
  footer: string;
};

export function renderShareImage({ eyebrow, title, accent, footer }: ShareImageProps) {
  const host = new URL(siteUrl).host;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: "#f6f6f3",
        color: "#111318",
        fontFamily: "Plex",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "#111318",
            color: "#f6f6f3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Mono",
            fontSize: 22,
          }}
        >
          IA
        </div>
        <div style={{ fontFamily: "Display", fontSize: 30 }}>Ismail Al-Saleh</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontFamily: "Mono", fontSize: 22, color: "#2b4bf2", letterSpacing: 2 }}>
          {eyebrow.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            columnGap: 18,
            fontFamily: "Display",
            fontSize: title.length > 70 ? 56 : 68,
            lineHeight: 1.04,
            letterSpacing: -2,
            maxWidth: 1000,
          }}
        >
          {/* One flex item per word, so wrapped lines never start with a stray gap. */}
          {[
            ...title.split(" ").map((word) => ({ word, accent: false })),
            ...(accent ?? "")
              .split(" ")
              .filter(Boolean)
              .map((word) => ({ word, accent: true })),
          ].map((item, index) => (
            <span key={index} style={{ color: item.accent ? "#2b4bf2" : "#111318" }}>
              {item.word}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "2px solid #deded8",
          paddingTop: 28,
          fontFamily: "Mono",
          fontSize: 22,
          color: "#555a63",
        }}
      >
        <span>{footer}</span>
        <span>{host}</span>
      </div>
    </div>,
    {
      ...shareImageSize,
      fonts: [
        { name: "Display", data: display, weight: 800, style: "normal" },
        { name: "Plex", data: sans, weight: 500, style: "normal" },
        { name: "Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
