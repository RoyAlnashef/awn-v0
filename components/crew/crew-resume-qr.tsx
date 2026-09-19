"use client"

import QRCode from "react-qr-code"

export function CrewResumeQr({ url }: { url: string }) {
  return (
    <QRCode
      value={url}
      size={68}
      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
      viewBox="0 0 68 68"
    />
  )
}
