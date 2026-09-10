export default function StarRating({ value, onChange, size = 18 }) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = typeof onChange === "function";

  return (
    <div style={{ display: "inline-flex", gap: 2 }}>
      {stars.map((n) => (
        <span
          key={n}
          onClick={() => interactive && onChange(n)}
          style={{
            cursor: interactive ? "pointer" : "default",
            fontSize: size,
            color: n <= Math.round(value) ? "#D4A94F" : "#3A4152",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
