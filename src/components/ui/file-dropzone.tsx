import { useRef } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type FileDropzoneProps = {
  onFileSelect: (file: File) => void;
  onFilesSelect?: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
  className?: string;
};

export function FileDropzone({
  onFileSelect,
  onFilesSelect,
  multiple = false,
  accept = "image/jpeg,image/png,image/webp",
  disabled = false,
  className,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0 || disabled) {
      return;
    }

    if (multiple && onFilesSelect) {
      onFilesSelect(Array.from(files));
      return;
    }

    onFileSelect(files[0]);
  };

  return (
    <div
      className={cn(
        "rounded-lg border-2 border-dashed border-gray-300 bg-white p-5 text-center transition-colors",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:border-primary",
        className,
      )}
      onClick={() => {
        if (!disabled) {
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
        handleFiles(event.dataTransfer.files);
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(event) => {
        if (!disabled && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      aria-disabled={disabled}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.currentTarget.value = "";
        }}
      />

      <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
        <Upload className="h-5 w-5 text-gray-500" />
        <p>
          {multiple ? "Arraste os arquivos aqui ou" : "Arraste o logo aqui ou"}{" "}
          <span className="font-semibold text-primary">
            clique para selecionar
          </span>
        </p>
        <p className="text-xs text-gray-500">JPEG, PNG ou WEBP (máx. 8MB)</p>
      </div>
    </div>
  );
}
