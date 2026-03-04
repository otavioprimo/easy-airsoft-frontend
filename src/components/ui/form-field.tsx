import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-2">
        <Label htmlFor={fieldId}>{label}</Label>
        <Input
          id={fieldId}
          ref={ref}
          className={cn(
            error && "border-red-500 focus:border-red-500",
            className,
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  },
);

FormField.displayName = "FormField";

export { FormField };
