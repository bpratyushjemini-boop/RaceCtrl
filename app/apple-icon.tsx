import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
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
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FF453A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 4L4 20" />
          <path d="M8.5 4L12.5 4L14.5 8L12.5 12L7.5 12" />
          <path d="M9.5 12L13.5 20" />
          <path d="M21 4L18.5 4L16.5 12L19 20L21.5 20" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
