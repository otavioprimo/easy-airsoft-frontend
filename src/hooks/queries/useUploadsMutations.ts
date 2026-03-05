import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

type UploadFolder = "general" | "fields" | "teams" | "users" | "games";

type ApiSuccessResponse<T> = {
  success: boolean;
  data: T;
};

type PresignUploadResponse = {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresInSeconds: number;
  requiredHeaders: {
    "Content-Type": string;
  };
};

type UploadImagePayload = {
  file: File;
  folder?: UploadFolder;
};

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

export function useUploadImageMutation() {
  return useMutation({
    mutationFn: async ({ file, folder = "teams" }: UploadImagePayload) => {
      if (!ALLOWED_CONTENT_TYPES.has(file.type)) {
        throw new Error("Formato inválido. Use JPEG, PNG ou WEBP.");
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        throw new Error("Arquivo excede 8MB.");
      }

      const presignResponse = await api.post<
        ApiSuccessResponse<PresignUploadResponse>
      >("/uploads/presign", {
        folder,
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      });

      const { uploadUrl, fileUrl, requiredHeaders } = presignResponse.data.data;

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: requiredHeaders,
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Falha ao enviar arquivo para armazenamento.");
      }

      return {
        fileUrl,
      };
    },
  });
}
