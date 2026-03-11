import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function StarRating({
  value,
  onChange,
  max = 5,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const handleKeyDown = (event: React.KeyboardEvent, starValue: number) => {
    if (readonly) return;

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onChange?.(Math.min(max, starValue + 1));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onChange?.(Math.max(1, starValue - 1));
    }
  };

  return (
    <div className="flex gap-1" role="group" aria-label="Avaliação por estrelas">
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= value;

        return (
          <button
            key={starValue}
            type="button"
            disabled={readonly}
            onClick={() => {
              if (!readonly) {
                onChange?.(starValue);
              }
            }}
            onKeyDown={(e) => {
              handleKeyDown(e, starValue);
            }}
            aria-label={`Avaliar ${starValue} de ${max} estrelas`}
            aria-pressed={starValue === value}
            className={cn(
              "transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded",
              !readonly && "cursor-pointer hover:scale-110",
              readonly && "cursor-default",
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-300",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
