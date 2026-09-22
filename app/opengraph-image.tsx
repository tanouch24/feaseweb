import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: "#1e4a43",
          padding: "80px",
          color: "#fbfaf7",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 40, opacity: 0.75, letterSpacing: 2 }}>
          FEASEWEB
        </div>
        <div style={{ fontSize: 64, marginTop: 24, lineHeight: 1.15 }}>
          Votre site internet.
        </div>
        <div style={{ fontSize: 64, lineHeight: 1.15 }}>
          Sans avoir à vous en occuper.
        </div>
        <div style={{ fontSize: 32, marginTop: 40, opacity: 0.85 }}>
          0 € de création — 49 €/mois tout compris
        </div>
      </div>
    ),
    { ...size }
  );
}
