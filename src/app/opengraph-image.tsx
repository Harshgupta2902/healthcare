import { ImageResponse } from "next/og";

export const alt = "HealthHere — healthcare access platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0d9488 0%, #0f766e 45%, #115e59 100%)",
          padding: 72,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            letterSpacing: -3,
            lineHeight: 1.05,
          }}
        >
          HealthHere
        </div>
        <div
          style={{
            fontSize: 30,
            color: "rgba(255,255,255,0.92)",
            marginTop: 20,
            maxWidth: 720,
            lineHeight: 1.35,
          }}
        >
          Your health, our priority — trusted access to care.
        </div>
      </div>
    ),
    { ...size },
  );
}
