const MESSAGES = [
  "Free shipping on orders over ₹499",
  "Cash on Delivery — pay when it arrives",
  "7-day hassle-free returns",
  "Verified sellers only",
  "New arrivals every week",
];

export function AnnouncementBar() {
  const track = [...MESSAGES, ...MESSAGES];

  return (
    <div className="overflow-hidden bg-[oklch(0.08_0_0)] text-[oklch(0.99_0_0)] border-b border-[oklch(0.18_0_0)] h-8 flex items-center">
      <div className="flex shrink-0 announcement-track">
        {track.map((msg, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-10 font-mono text-[10px] uppercase tracking-[0.22em] whitespace-nowrap text-white/75"
          >
            <span className="text-white/30">—</span>
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
