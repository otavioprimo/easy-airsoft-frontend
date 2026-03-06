import { useEffect, useRef, useState } from "react";
import L, { type CircleMarker, type Map as LeafletMap } from "leaflet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useIbgeCitiesByStateQuery,
  useIbgeStatesQuery,
} from "@/hooks/queries/useIbgeQueries";
import { useUpdateFieldMutation } from "@/hooks/queries/useFieldsMutations";
import { useFieldQuery } from "@/hooks/queries/useFieldsQueries";
import { useUploadImageMutation } from "@/hooks/queries/useUploadsMutations";
import { useTeamMembersQuery, useTeamQuery } from "@/hooks/queries/useTeamsQueries";
import { useAuth } from "@/hooks/useAuth";
import type { TeamRole } from "@/types/teams";
import "leaflet/dist/leaflet.css";

type CoordinateInputMode = "manual" | "address" | "map";

const editFieldSchema = z.object({
  name: z
    .string()
    .min(2, "Nome do campo é obrigatório")
    .max(120, "Nome deve ter no máximo 120 caracteres"),
  state: z
    .string()
    .min(2, "Estado é obrigatório")
    .max(2, "Estado inválido"),
  city: z
    .string()
    .min(2, "Cidade é obrigatória")
    .max(100, "Cidade inválida"),
  latitude: z
    .string()
    .min(1, "Latitude é obrigatória")
    .refine((value) => !Number.isNaN(Number(value)), "Latitude inválida")
    .refine((value) => Number(value) >= -90 && Number(value) <= 90, {
      message: "Latitude deve estar entre -90 e 90",
    }),
  longitude: z
    .string()
    .min(1, "Longitude é obrigatória")
    .refine((value) => !Number.isNaN(Number(value)), "Longitude inválida")
    .refine((value) => Number(value) >= -180 && Number(value) <= 180, {
      message: "Longitude deve estar entre -180 e 180",
    }),
});

type EditFieldFormData = z.infer<typeof editFieldSchema>;

type UploadedPhoto = {
  url: string;
  filename: string;
};

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

export default function EditFieldPage() {
  const navigate = useNavigate();
  const { teamId = "", fieldId = "" } = useParams();
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [coordinateMode, setCoordinateMode] = useState<CoordinateInputMode>("manual");
  const [addressQuery, setAddressQuery] = useState("");
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [locationSuccessMessage, setLocationSuccessMessage] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [locationHintMessage, setLocationHintMessage] = useState("");
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const mapMarkerRef = useRef<CircleMarker | null>(null);

  const teamQuery = useTeamQuery(teamId);
  const membersQuery = useTeamMembersQuery(teamId);
  const fieldQuery = useFieldQuery(fieldId);
  const statesQuery = useIbgeStatesQuery();
  const updateFieldMutation = useUpdateFieldMutation(fieldId, teamId);
  const uploadImageMutation = useUploadImageMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFieldFormData>({
    resolver: zodResolver(editFieldSchema),
    defaultValues: {
      name: "",
      state: "",
      city: "",
      latitude: "",
      longitude: "",
    },
  });

  const stateValue = (watch("state") || "").trim().toUpperCase();
  const cityValue = watch("city") || "";
  const latitudeValue = watch("latitude") || "";
  const longitudeValue = watch("longitude") || "";
  const citiesByStateQuery = useIbgeCitiesByStateQuery(stateValue);

  const currentUserMembership = (membersQuery.data ?? []).find((member) => {
    return member.userId === user?.id;
  });

  const currentUserRole = currentUserMembership?.role as TeamRole | undefined;
  const canEditField = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  useEffect(() => {
    const field = fieldQuery.data;

    if (!field) {
      return;
    }

    reset({
      name: field.name,
      state: field.state,
      city: field.city,
      latitude: String(field.latitude),
      longitude: String(field.longitude),
    });

    setUploadedPhotos(
      (field.photos ?? []).map((photo, index) => ({
        url: photo.photoUrl,
        filename: `Foto ${index + 1}`,
      })),
    );
  }, [fieldQuery.data, reset]);

  const handlePhotoUpload = async (file: File) => {
    setErrorMessage("");

    if (uploadedPhotos.length >= 10) {
      setErrorMessage("Você pode adicionar no máximo 10 fotos.");
      return;
    }

    try {
      const uploadResult = await uploadImageMutation.mutateAsync({
        file,
        folder: "fields",
      });

      setUploadedPhotos((current) => [
        ...current,
        { url: uploadResult.fileUrl, filename: file.name },
      ]);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Não foi possível enviar a foto do campo."),
      );
    }
  };

  const handleRemovePhoto = (url: string) => {
    setUploadedPhotos((current) => current.filter((photo) => photo.url !== url));
  };

  const applyCoordinates = (latitude: string, longitude: string, successMessage: string) => {
    setValue("latitude", latitude, { shouldValidate: true, shouldDirty: true });
    setValue("longitude", longitude, { shouldValidate: true, shouldDirty: true });
    setLocationSuccessMessage(successMessage);
  };

  const handleResolveAddress = async () => {
    const normalizedAddress = addressQuery.trim();

    if (!normalizedAddress) {
      setErrorMessage("Informe um endereço para buscar as coordenadas.");
      return;
    }

    setErrorMessage("");
    setLocationSuccessMessage("");
    setIsResolvingAddress(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(normalizedAddress)}`,
      );

      if (!response.ok) {
        throw new Error("Falha ao buscar coordenadas");
      }

      const results = (await response.json()) as Array<{
        lat: string;
        lon: string;
      }>;

      const firstResult = results[0];

      if (!firstResult?.lat || !firstResult?.lon) {
        throw new Error("Endereço não encontrado");
      }

      applyCoordinates(firstResult.lat, firstResult.lon, "Coordenadas preenchidas a partir do endereço.");
    } catch {
      setErrorMessage("Não foi possível encontrar coordenadas para este endereço.");
    } finally {
      setIsResolvingAddress(false);
    }
  };

  const setMapMarker = (latitude: number, longitude: number) => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const nextLatLng: [number, number] = [latitude, longitude];

    if (mapMarkerRef.current) {
      mapMarkerRef.current.setLatLng(nextLatLng);
    } else {
      mapMarkerRef.current = L.circleMarker(nextLatLng, {
        radius: 8,
        color: "#0f766e",
        fillColor: "#14b8a6",
        fillOpacity: 0.7,
      }).addTo(map);
    }
  };

  const handleUseCurrentLocation = () => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    if (!("geolocation" in navigator)) {
      setLocationHintMessage("Geolocalização não disponível neste navegador.");
      return;
    }

    setIsLocatingUser(true);
    setLocationHintMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude.toFixed(7));
        const longitude = Number(position.coords.longitude.toFixed(7));

        map.setView([latitude, longitude], 16);
        setMapMarker(latitude, longitude);
        applyCoordinates(
          latitude.toFixed(7),
          longitude.toFixed(7),
          "Coordenadas definidas pela sua localização atual.",
        );
        setIsLocatingUser(false);
      },
      () => {
        setLocationHintMessage(
          "Não foi possível acessar sua localização. Verifique a permissão no navegador.",
        );
        setIsLocatingUser(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  useEffect(() => {
    if (!isMapModalOpen || !mapContainerRef.current) {
      return;
    }

    const parsedLat = Number(latitudeValue);
    const parsedLng = Number(longitudeValue);
    const hasValidCoordinates =
      !Number.isNaN(parsedLat) &&
      !Number.isNaN(parsedLng) &&
      latitudeValue.trim() !== "" &&
      longitudeValue.trim() !== "";

    const initialCenter: [number, number] = hasValidCoordinates
      ? [parsedLat, parsedLng]
      : [-15.793889, -47.882778];

    const initialZoom = hasValidCoordinates ? 13 : 4;

    const map = L.map(mapContainerRef.current).setView(initialCenter, initialZoom);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    if (hasValidCoordinates) {
      setMapMarker(initialCenter[0], initialCenter[1]);
    } else {
      handleUseCurrentLocation();
    }

    map.on("click", (event) => {
      const { lat, lng } = event.latlng;
      setMapMarker(lat, lng);
      applyCoordinates(lat.toFixed(7), lng.toFixed(7), "Coordenadas definidas pelo mapa.");
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 0);

    return () => {
      map.remove();
      mapRef.current = null;
      mapMarkerRef.current = null;
    };
  }, [isMapModalOpen]);

  const onSubmit = async (data: EditFieldFormData) => {
    setErrorMessage("");

    try {
      await updateFieldMutation.mutateAsync({
        name: data.name.trim(),
        state: data.state.trim().toUpperCase(),
        city: data.city.trim(),
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        photos: uploadedPhotos.map((photo) => photo.url),
      });

      navigate(`/app/teams/${teamId}`);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Não foi possível atualizar o campo."),
      );
    }
  };

  if (teamQuery.isLoading || membersQuery.isLoading || fieldQuery.isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-2/3" />

          <div className="space-y-3 rounded-2xl border border-gray-200 p-4">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-10 w-full" />
            <div className="grid gap-3 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-gray-200 p-4">
            <Skeleton className="h-5 w-40" />
            <div className="grid gap-2 sm:grid-cols-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (teamQuery.isError || !teamQuery.data || fieldQuery.isError || !fieldQuery.data) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-800">
          <p>Não foi possível carregar os dados do campo.</p>
          <Link to={`/app/teams/${teamId}`}>
            <Button variant="outline">Voltar para o time</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!canEditField) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
          <p>Apenas OWNER ou ADMIN do time podem editar campos.</p>
          <Link to={`/app/teams/${teamId}`}>
            <Button variant="outline">Voltar para o time</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const team = teamQuery.data;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-primary/20 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-primary">Editar campo do time</h1>
          <p className="mt-1 text-sm text-gray-600">
            Atualize os dados do campo para <span className="font-semibold">{team.name}</span>.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-300 bg-red-50/80 p-4 text-red-800">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <section className="space-y-4 rounded-2xl border border-gray-200 p-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Informações do campo</h2>
              <p className="text-sm text-gray-600">Nome e localização principal.</p>
            </div>

            <FormField
              label="Nome do campo"
              placeholder="Ex.: Arena Tática Sul"
              error={errors.name?.message}
              {...register("name")}
            />

            <div className="grid gap-4 md:grid-cols-2">
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
                  disabled={!stateValue || citiesByStateQuery.isLoading}
                >
                  <option value="">
                    {!stateValue
                      ? "Selecione um estado"
                      : citiesByStateQuery.isLoading
                        ? "Carregando..."
                        : "Selecione"}
                  </option>
                  {(citiesByStateQuery.data ?? []).map((cityOption) => (
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
          </section>

          <section className="space-y-4 rounded-2xl border border-gray-200 p-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Coordenadas</h2>
              <p className="text-sm text-gray-600">
                Escolha a forma mais prática para definir a localização do campo.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <Button
                type="button"
                variant={coordinateMode === "manual" ? "default" : "outline"}
                onClick={() => {
                  setCoordinateMode("manual");
                  setLocationSuccessMessage("");
                }}
              >
                Inserir coordenadas
              </Button>
              <Button
                type="button"
                variant={coordinateMode === "address" ? "default" : "outline"}
                onClick={() => {
                  setCoordinateMode("address");
                  setLocationSuccessMessage("");
                }}
              >
                Buscar por endereço
              </Button>
              <Button
                type="button"
                variant={coordinateMode === "map" ? "default" : "outline"}
                onClick={() => {
                  setCoordinateMode("map");
                  setLocationSuccessMessage("");
                }}
              >
                Selecionar no mapa
              </Button>
            </div>

            {coordinateMode === "address" && (
              <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
                <Label htmlFor="address-search">Endereço do campo</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="address-search"
                    value={addressQuery}
                    onChange={(event) => {
                      setAddressQuery(event.target.value);
                    }}
                    placeholder="Ex.: Rua Exemplo, 123, Curitiba - PR"
                    className="flex h-10 w-full rounded-lg border-2 border-gray-300 bg-white px-3 text-sm text-text-dark placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      void handleResolveAddress();
                    }}
                    disabled={isResolvingAddress}
                  >
                    {isResolvingAddress ? "Buscando..." : "Buscar coordenadas"}
                  </Button>
                </div>
              </div>
            )}

            {coordinateMode === "map" && (
              <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm text-gray-600">
                  Abra o mapa e clique no ponto exato do campo para capturar latitude e longitude.
                </p>
                <Button
                  type="button"
                  onClick={() => {
                    setIsMapModalOpen(true);
                  }}
                >
                  Abrir mapa
                </Button>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Latitude"
                type="number"
                step="0.0000001"
                placeholder="Ex.: -25.4284"
                error={errors.latitude?.message}
                readOnly={coordinateMode !== "manual"}
                {...register("latitude")}
              />

              <FormField
                label="Longitude"
                type="number"
                step="0.0000001"
                placeholder="Ex.: -49.2733"
                error={errors.longitude?.message}
                readOnly={coordinateMode !== "manual"}
                {...register("longitude")}
              />
            </div>

            {locationSuccessMessage && (
              <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {locationSuccessMessage}
              </p>
            )}
          </section>

          <section className="space-y-4 rounded-2xl border border-gray-200 p-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Fotos do campo</h2>
              <p className="text-sm text-gray-600">
                Adicione até 10 fotos para apresentar o espaço.
              </p>
            </div>

            <FileDropzone
              onFileSelect={handlePhotoUpload}
              disabled={
                uploadImageMutation.isPending ||
                isSubmitting ||
                updateFieldMutation.isPending ||
                uploadedPhotos.length >= 10
              }
            />

            {uploadImageMutation.isPending && (
              <p className="text-sm text-gray-600">Enviando foto...</p>
            )}

            {uploadedPhotos.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {uploadedPhotos.map((photo) => (
                  <div
                    key={photo.url}
                    className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3"
                  >
                    <img
                      src={photo.url}
                      alt={photo.filename}
                      className="h-28 w-full rounded-md object-cover"
                    />
                    <p className="truncate text-xs text-gray-600">{photo.filename}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleRemovePhoto(photo.url);
                      }}
                      disabled={isSubmitting || updateFieldMutation.isPending}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                updateFieldMutation.isPending ||
                uploadImageMutation.isPending
              }
            >
              {isSubmitting || updateFieldMutation.isPending
                ? "Salvando campo..."
                : "Salvar alterações"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/app/teams/${teamId}`)}
              disabled={
                isSubmitting ||
                updateFieldMutation.isPending ||
                uploadImageMutation.isPending
              }
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>

      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-3xl space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Selecionar no mapa</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocatingUser}
                >
                  {isLocatingUser ? "Localizando..." : "Usar minha localização"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsMapModalOpen(false);
                  }}
                >
                  Fechar
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Clique no mapa para definir a localização do campo.
            </p>

            {locationHintMessage && (
              <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {locationHintMessage}
              </p>
            )}

            <div ref={mapContainerRef} className="h-[420px] w-full rounded-xl border border-gray-200" />

            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
              <span>Latitude: {latitudeValue || "-"}</span>
              <span>Longitude: {longitudeValue || "-"}</span>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
