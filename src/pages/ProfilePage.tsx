import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { SearchSelect } from "@/components/ui/search-select";
import { useAuth } from "@/hooks/useAuth";
import {
  useIbgeCitiesByStateQuery,
  useIbgeStatesQuery,
} from "@/hooks/queries/useIbgeQueries";
import { useUploadImageMutation } from "@/hooks/queries/useUploadsMutations";
import { useUpdateMyProfileMutation } from "@/hooks/queries/useUsersMutations";
import { useMyProfileQuery } from "@/hooks/queries/useUsersQueries";

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Nome é obrigatório")
    .max(120, "Nome deve ter no máximo 120 caracteres"),
  bio: z
    .string()
    .max(500, "Bio deve ter no máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
  state: z.string().max(2, "Estado inválido").optional().or(z.literal("")),
  city: z.string().max(100, "Cidade inválida").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function getApiErrorMessage(error: unknown, fallback: string) {
  const apiError = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  return apiError.response?.data?.message || fallback;
}

function normalizeProfilePayload(data: ProfileFormData, profilePhoto?: string) {
  return {
    name: data.name.trim(),
    bio: data.bio?.trim() || undefined,
    state: data.state?.trim().toUpperCase() || undefined,
    city: data.city?.trim() || undefined,
    profilePhoto,
  };
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { syncCurrentUser } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(undefined);
  const [profilePhotoFilename, setProfilePhotoFilename] = useState("");

  const profileQuery = useMyProfileQuery();
  const updateProfileMutation = useUpdateMyProfileMutation();
  const uploadImageMutation = useUploadImageMutation();
  const statesQuery = useIbgeStatesQuery();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      bio: "",
      state: "",
      city: "",
    },
  });

  const stateValue = (watch("state") || "").trim().toUpperCase();
  const cityValue = watch("city") || "";
  const citiesQuery = useIbgeCitiesByStateQuery(stateValue);

  useEffect(() => {
    const profile = profileQuery.data;

    if (!profile) {
      return;
    }

    reset({
      name: profile.name || "",
      bio: profile.bio || "",
      state: profile.state || "",
      city: profile.city || "",
    });

    setProfilePhoto(profile.profilePhoto || undefined);
    setProfilePhotoFilename(profile.profilePhoto ? "Foto atual" : "");
  }, [profileQuery.data, reset]);

  const handleProfilePhotoFileSelect = async (file: File) => {
    setErrorMessage("");

    try {
      const uploadResult = await uploadImageMutation.mutateAsync({
        file,
        folder: "users",
      });

      setProfilePhoto(uploadResult.fileUrl);
      setProfilePhotoFilename(file.name);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Não foi possível enviar a foto de perfil."),
      );
    }
  };

  const handleUpdateProfile = async (data: ProfileFormData) => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updatedProfile = await updateProfileMutation.mutateAsync(
        normalizeProfilePayload(data, profilePhoto),
      );

      syncCurrentUser({
        name: updatedProfile.name,
        city: updatedProfile.city,
        state: updatedProfile.state,
        bio: updatedProfile.bio,
        profilePhoto: updatedProfile.profilePhoto,
      });

      navigate("/app");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Não foi possível atualizar o perfil."),
      );
    }
  };

  if (profileQuery.isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">Carregando perfil...</p>
        </div>
      </AppShell>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-800">
          <p>Não foi possível carregar o perfil.</p>
          <Link to="/app">
            <Button variant="outline">Voltar para Home</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-3xl border border-primary/20 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-primary">Meu perfil</h1>
          <p className="mt-1 text-sm text-gray-600">
            Atualize sua foto e dados públicos.
          </p>
        </div>

        {errorMessage && (
          <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {successMessage}
          </p>
        )}

        <form
          onSubmit={handleSubmit(handleUpdateProfile)}
          className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-2">
            <Label>Foto de perfil</Label>
            <FileDropzone
              onFileSelect={handleProfilePhotoFileSelect}
              disabled={
                uploadImageMutation.isPending ||
                isSubmitting ||
                updateProfileMutation.isPending
              }
            />
            {uploadImageMutation.isPending && (
              <p className="text-sm text-gray-600">Enviando foto...</p>
            )}
            {profilePhoto && !uploadImageMutation.isPending && (
              <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-sm text-emerald-800">
                  Foto selecionada: {" "}
                  <span className="font-medium">
                    {profilePhotoFilename || "Imagem"}
                  </span>
                </p>
                <img
                  src={profilePhoto}
                  alt="Prévia da foto de perfil"
                  className="h-16 w-16 rounded-full border border-emerald-200 object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setProfilePhoto(undefined);
                    setProfilePhotoFilename("");
                  }}
                  disabled={
                    isSubmitting ||
                    updateProfileMutation.isPending ||
                    uploadImageMutation.isPending
                  }
                >
                  Remover foto
                </Button>
              </div>
            )}
          </div>

          <FormField
            label="Nome"
            placeholder="Seu nome"
            error={errors.name?.message}
            {...register("name")}
          />

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              rows={4}
              className="flex w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm text-text-dark placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Conte um pouco sobre você no airsoft"
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-sm text-red-600">{errors.bio.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <SearchSelect
                items={(statesQuery.data ?? []).map((stateOption) => ({
                  value: stateOption.code,
                  label: `${stateOption.code} - ${stateOption.name}`,
                }))}
                value={stateValue}
                onChange={(nextState) => {
                  setValue("state", nextState, { shouldValidate: true });
                  setValue("city", "", { shouldValidate: true });
                }}
                placeholder={statesQuery.isLoading ? "Carregando..." : "Selecione"}
                searchPlaceholder="Buscar estado..."
                emptyText="Nenhum estado encontrado."
                disabled={statesQuery.isLoading}
                clearable
                onClear={() => {
                  setValue("state", "", { shouldValidate: true });
                  setValue("city", "", { shouldValidate: true });
                }}
              />
              {errors.state && (
                <p className="text-sm text-red-600">{errors.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <SearchSelect
                items={(citiesQuery.data ?? []).map((cityOption) => ({
                  value: cityOption,
                  label: cityOption,
                }))}
                value={cityValue}
                onChange={(nextCity) => {
                  setValue("city", nextCity, {
                    shouldValidate: true,
                  });
                }}
                placeholder={!stateValue
                  ? "Selecione um estado"
                  : citiesQuery.isLoading
                    ? "Carregando..."
                    : "Selecione"}
                searchPlaceholder="Buscar cidade..."
                emptyText="Nenhuma cidade encontrada."
                disabled={!stateValue || citiesQuery.isLoading}
                clearable
                onClear={() => {
                  setValue("city", "", { shouldValidate: true });
                }}
              />
              {errors.city && (
                <p className="text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                updateProfileMutation.isPending ||
                uploadImageMutation.isPending
              }
            >
              {isSubmitting || updateProfileMutation.isPending
                ? "Salvando..."
                : "Salvar perfil"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/app")}
              disabled={
                isSubmitting ||
                updateProfileMutation.isPending ||
                uploadImageMutation.isPending
              }
            >
              Voltar para Home
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
