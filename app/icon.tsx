import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#080809",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "440px",
            height: "440px",
            borderRadius: "90px",
            border: "8px solid #FF453A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1C1C1E",
          }}
        >
          <span
            style={{
              fontSize: "260px",
              fontWeight: "900",
              color: "#F5F5F7",
              fontFamily: "system-ui, -apple-system, sans-serif",
              lineHeight: 1,
            }}
          >
            R
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
