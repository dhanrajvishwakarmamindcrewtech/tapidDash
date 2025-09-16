import { Star } from "lucide-react";

const StarRating = ({ rating }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      // Full star
      stars.push(<Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />);
    } else if (rating >= i - 0.5) {
      // Half star (half-filled effect)
      stars.push(
        <Star
          key={i}
          size={16}
          color="#fbbf24"
          style={{
            fill: "url(#halfGradient)",
          }}
        />
      );
    } else {
      // Empty star (outline only)
      stars.push(<Star key={i} size={16} color="#fbbf24" />);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      <svg width="0" height="0">
        <defs>
          <linearGradient id="halfGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
      {stars}
    </div>
  );
};

export default StarRating;
