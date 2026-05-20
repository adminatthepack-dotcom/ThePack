"use client";

import { useState, useRef } from "react";
import QRCode from "react-qr-code";

export default function ProfileSharePanel({ profileUrl }: { profileUrl: string }) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  function copyLink() {
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function downloadQr() {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // White background so the PNG isn't transparent
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    const img = new Image();
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.download = "my-pack-profile-qr.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = url;
  }

  return (
    <section className="mt-8 rounded-lg border border-pack-tan/40 bg-white p-5">
      <h2 className="text-sm font-semibold text-pack-mask">Share your profile</h2>
      <p className="mt-1 text-xs text-pack-brown">
        Post this link on social media or print the QR code on business cards to
        let people find your Pack profile.
      </p>

      {/* Link row */}
      <div className="mt-3 flex items-center gap-2">
        <input
          readOnly
          value={profileUrl}
          className="min-w-0 flex-1 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-700 focus:outline-none"
          onFocus={(e) => e.target.select()}
        />
        <button
          onClick={copyLink}
          className="shrink-0 rounded-md border border-pack-tan/40 bg-white px-3 py-1.5 text-xs font-medium text-pack-mask transition hover:border-pack-tan hover:bg-pack-sand/40"
        >
          {copied ? "Copied ✓" : "Copy link"}
        </button>
      </div>

      {/* QR toggle */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setShowQr((v) => !v)}
          className="rounded-md border border-pack-tan/40 bg-white px-3 py-1.5 text-xs font-medium text-pack-mask transition hover:border-pack-tan hover:bg-pack-sand/40"
        >
          {showQr ? "Hide QR code" : "Generate QR code"}
        </button>
        {showQr && (
          <button
            onClick={downloadQr}
            className="rounded-md border border-pack-tan/40 bg-white px-3 py-1.5 text-xs font-medium text-pack-mask transition hover:border-pack-tan hover:bg-pack-sand/40"
          >
            Download PNG
          </button>
        )}
      </div>

      {showQr && (
        <div className="mt-4 flex flex-col items-start gap-3">
          <div
            ref={qrRef}
            className="rounded-lg border border-neutral-200 bg-white p-4"
          >
            <QRCode value={profileUrl} size={180} />
          </div>
          <p className="text-xs text-neutral-400">
            Scan to open your profile. Download the PNG for print.
          </p>
        </div>
      )}
    </section>
  );
}
