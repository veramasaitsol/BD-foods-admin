import * as React from "react";

import { cn } from "@/lib/utils";

export interface NumberInputProps
  extends Omit<React.ComponentProps<"input">, "type" | "value" | "onChange" | "min" | "max"> {
  value: number | undefined | null;
  onChange: (value: number | undefined) => void;
  /** Allow a decimal point (prices) — set false for integer-only fields (stock, quantity). */
  allowDecimal?: boolean;
  min?: number;
  max?: number;
}

/**
 * A numeric text field that avoids the pitfalls of a native `<input type="number">`:
 * - no up/down spinner arrows
 * - the mouse scroll wheel never changes the value
 * - the field can actually be cleared to empty instead of snapping back to "0"
 *   while typing (native number inputs coerce "" to 0 on every keystroke when
 *   the value is a controlled number)
 */
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, allowDecimal = true, min, max, className, onFocus, onBlur, ...props }, ref) => {
    const toText = (v: number | undefined | null) => (v === undefined || v === null ? "" : String(v));
    const [text, setText] = React.useState(toText(value));
    const focused = React.useRef(false);

    // Keep the field in sync with external value changes (e.g. form reset),
    // but never fight the user while they're actively typing.
    React.useEffect(() => {
      if (!focused.current) {
        setText(toText(value));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const pattern = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;

    return (
      <input
        {...props}
        ref={ref}
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        value={text}
        onFocus={(e) => {
          focused.current = true;
          onFocus?.(e);
        }}
        onChange={(e) => {
          let next = e.target.value;
          if (next !== "" && !pattern.test(next)) return;
          // Strip a leading zero the moment a second digit follows it (e.g. typing
          // "5" right after "0" should replace it, giving "5" instead of "05").
          if (/^0\d/.test(next)) {
            next = next.replace(/^0+/, "");
          }
          setText(next);
          onChange(next === "" ? undefined : Number(next));
        }}
        onBlur={(e) => {
          focused.current = false;
          let n = text === "" ? undefined : Number(text);
          if (n !== undefined) {
            if (min !== undefined && n < min) n = min;
            if (max !== undefined && n > max) n = max;
          }
          setText(toText(n));
          onChange(n);
          onBlur?.(e);
        }}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
      />
    );
  },
);
NumberInput.displayName = "NumberInput";

export { NumberInput };
