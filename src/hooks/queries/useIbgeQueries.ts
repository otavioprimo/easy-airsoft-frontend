import { useQuery } from "@tanstack/react-query";
import type { IbgeCity, IbgeState, StateOption } from "@/types/ibge";

export function useIbgeStatesQuery() {
  return useQuery({
    queryKey: ["ibge-states"],
    queryFn: async () => {
      const response = await fetch(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome",
      );

      if (!response.ok) {
        throw new Error("Falha ao carregar estados");
      }

      const data = (await response.json()) as IbgeState[];
      return data.map(
        (item): StateOption => ({
          code: item.sigla,
          name: item.nome,
        }),
      );
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useIbgeCitiesByStateQuery(state: string) {
  const normalizedState = state.trim().toUpperCase();

  return useQuery({
    queryKey: ["ibge-cities", normalizedState],
    queryFn: async () => {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${normalizedState}/municipios`,
      );

      if (!response.ok) {
        throw new Error("Falha ao carregar cidades");
      }

      const data = (await response.json()) as IbgeCity[];
      return data.map((item) => item.nome);
    },
    enabled: Boolean(normalizedState),
    staleTime: 1000 * 60 * 60,
  });
}
