// Shows the user's photo (photoUrl), or their initials when there is none.
export default function Avatar({ user, size = 64, className = "" }) {
  const label = (user?.name || user?.email || "?").trim();
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  const style = { width: size, height: size, fontSize: size * 0.38 };

  if (user?.photoUrl) {
    return (
      <img
        src={user.photoUrl}
        alt=""
        style={style}
        className={`shrink-0 rounded-full border border-navy-700/60 object-cover ${className}`}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      style={style}
      className={`flex shrink-0 items-center justify-center rounded-full border border-navy-700/60 bg-navy-900 font-display text-ivory/50 ${className}`}
    >
      {initials}
    </div>
  );
}