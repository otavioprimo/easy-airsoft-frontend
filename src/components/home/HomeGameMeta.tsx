import { Link } from "react-router-dom";

type HomeGameMetaProps = {
  teamName?: string | null;
  teamId?: string | null;
  fieldName?: string | null;
  city?: string | null;
  state?: string | null;
  distanceKm?: number | null;
  price?: number | string | null;
  confirmedCount?: number | null;
  interestedCount?: number | null;
  maxPlayers?: number | null;
};

export function HomeGameMeta({
  teamName,
  teamId,
  fieldName,
  city,
  state,
  distanceKm,
  price,
  confirmedCount,
  interestedCount,
  maxPlayers,
}: HomeGameMetaProps) {
  return (
    <div className="grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
      <p>
        <span className="font-medium">Time:</span>{" "}
        {teamName && teamId ? (
          <Link
            to={`/teams/${teamId}`}
            className="font-medium text-primary underline underline-offset-2"
          >
            {teamName}
          </Link>
        ) : (
          teamName ?? "-"
        )}
      </p>
      <p>
        <span className="font-medium">Campo:</span> {fieldName ?? "-"}
      </p>
      <p>
        <span className="font-medium">Local:</span>{" "}
        {city && state ? `${city}/${state}` : "-"}
      </p>
      <p>
        <span className="font-medium">Distância:</span>{" "}
        {distanceKm !== null && distanceKm !== undefined
          ? `${distanceKm.toFixed(1)} km`
          : "-"}
      </p>
      <p>
        <span className="font-medium">Preço:</span>{" "}
        {price !== null && price !== undefined
          ? `R$ ${Number(price).toFixed(2)}`
          : "A consultar"}
      </p>
      <p>
        <span className="font-medium">Confirmados:</span> {confirmedCount ?? 0}/
        {maxPlayers && maxPlayers > 0 ? maxPlayers : "Sem limite"}
      </p>
      <p>
        <span className="font-medium">Interessados:</span>{" "}
        {interestedCount ?? 0}
      </p>
    </div>
  );
}
