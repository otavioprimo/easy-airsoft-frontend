import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  useIbgeCitiesByStateQuery,
  useIbgeStatesQuery,
} from "@/hooks/queries/useIbgeQueries";
import { useCreateTeamMutation } from "@/hooks/queries/useTeamsMutations";
import { useUploadImageMutation } from "@/hooks/queries/useUploadsMutations";

const createTeamSchema = z.object({
  name: z
    .string()
    .min(2, "Nome do time é obrigatório")
    .max(120, "Nome do time deve ter no máximo 120 caracteres"),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
  state: z.string().max(2, "Estado inválido").optional().or(z.literal("")),
  city: z.string().max(100, "Cidade inválida").optional().or(z.literal("")),
});

type CreateTeamFormData = z.infer<typeof createTeamSchema>;

function normalizePayload(data: CreateTeamFormData) {
  return {
    name: data.name.trim(),
    description: data.description?.trim() || undefined,
    state: data.state?.trim().toUpperCase() || undefined,
    city: data.city?.trim() || undefined,
  };
}

export default function CreateTeamPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [logoFilename, setLogoFilename] = useState<string>("");

  const createTeamMutation = useCreateTeamMutation();
  const uploadImageMutation = useUploadImageMutation();
  const statesQuery = useIbgeStatesQuery();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      description: "",
      state: "",
      city: "",
    },
  });

  const stateValue = (watch("state") || "").trim().toUpperCase();
  const cityValue = watch("city") || "";
  const citiesQuery = useIbgeCitiesByStateQuery(stateValue);

  const handleLogoFileSelect = async (file: File) => {
    setErrorMessage("");

    try {
      const uploadResult = await uploadImageMutation.mutateAsync({
        file,
        folder: "teams",
      });

      setLogoUrl(uploadResult.fileUrl);
      setLogoFilename(file.name);
    } catch (error) {
      const uploadError = error as { message?: string };
      setErrorMessage(uploadError.message || "Não foi possível enviar o logo.");
    }
  };

  const onSubmit = async (data: CreateTeamFormData) => {
    setErrorMessage("");

    try {
      const createdTeam = await createTeamMutation.mutateAsync({
        ...normalizePayload(data),
        logoUrl,
      });
      navigate(`/app/teams/${createdTeam.id}`);
    } catch (error) {
      const apiError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setErrorMessage(
        apiError.response?.data?.message || "Não foi possível criar o time.",
      );
    }
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="rounded-3xl border border-primary/20 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-primary">Criar time</h1>
          <p className="mt-1 text-sm text-gray-600">
            Preencha os dados para criar seu time no Easy Airsoft.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-300 bg-red-50/80 p-4 text-red-800">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <FormField
            label="Nome do time"
            placeholder="Ex.: Lobos do Sul"
            error={errors.name?.message}
            {...register("name")}
          />

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              rows={4}
              className="flex w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm text-text-dark placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Fale sobre o estilo do time, região de atuação, etc."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Select
                id="state"
                value={stateValue}
                onChange={(event) => {
                  const nextState = event.target.value;
                  setValue("state", nextState, { shouldValidate: true });
                  setValue("city", "", { shouldValidate: true });
                }}
                disabled={statesQuery.isLoading}
              >
                <option value="">
                  {statesQuery.isLoading ? "Carregando..." : "Selecione"}
                </option>
                {(statesQuery.data ?? []).map((stateOption) => (
                  <option key={stateOption.code} value={stateOption.code}>
                    {stateOption.code} - {stateOption.name}
                  </option>
                ))}
              </Select>
              {errors.state && (
                <p className="text-sm text-red-600">{errors.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Select
                id="city"
                value={cityValue}
                onChange={(event) => {
                  setValue("city", event.target.value, {
                    shouldValidate: true,
                  });
                }}
                disabled={!stateValue || citiesQuery.isLoading}
              >
                <option value="">
                  {!stateValue
                    ? "Selecione um estado"
                    : citiesQuery.isLoading
                      ? "Carregando..."
                      : "Selecione"}
                </option>
                {(citiesQuery.data ?? []).map((cityOption) => (
                  <option key={cityOption} value={cityOption}>
                    {cityOption}
                  </option>
                ))}
              </Select>
              {errors.city && (
                <p className="text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Logo do time</Label>
            <FileDropzone
              onFileSelect={handleLogoFileSelect}
              disabled={uploadImageMutation.isPending || isSubmitting}
            />
            {uploadImageMutation.isPending && (
              <p className="text-sm text-gray-600">Enviando logo...</p>
            )}
            {logoFilename && logoUrl && !uploadImageMutation.isPending && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                <p className="text-sm text-emerald-800">
                  Logo enviado:{" "}
                  <span className="font-medium">{logoFilename}</span>
                </p>
                <img
                  src={logoUrl}
                  alt="Prévia do logo do time"
                  className="h-16 w-16 rounded-md object-cover border border-emerald-200"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLogoUrl(undefined);
                    setLogoFilename("");
                  }}
                  disabled={isSubmitting || createTeamMutation.isPending}
                >
                  Remover logo
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                createTeamMutation.isPending ||
                uploadImageMutation.isPending
              }
            >
              {isSubmitting || createTeamMutation.isPending
                ? "Criando time..."
                : "Criar time"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/app")}
              disabled={
                isSubmitting ||
                createTeamMutation.isPending ||
                uploadImageMutation.isPending
              }
            >
              Cancelar
            </Button>
          </div>
        </form>

        <p className="text-sm text-gray-600">
          Preferiu voltar?{" "}
          <Link
            to="/app"
            className="font-semibold text-primary hover:underline"
          >
            Ir para Home
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
