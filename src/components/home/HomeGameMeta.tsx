type HomeGameMetaProps = {
  teamName?: string | null;
  fieldName?: string | null;
  city?: string | null;
  state?: string | null;
  price?: number | string | null;
  confirmedCount?: number | null;
  interestedCount?: number | null;
  maxPlayers: number;
};

export function HomeGameMeta({
  teamName,
  fieldName,
  city,
  state,
  price,
  confirmedCount,
  interestedCount,
  maxPlayers,
}: HomeGameMetaProps) {
  return (
    <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
      <p>
        <span className="font-medium">Time:</span> {teamName ?? "-"}
      </p>
      <p>
        <span className="font-medium">Campo:</span> {fieldName ?? "-"}
      </p>
      <p>
        <span className="font-medium">Local:</span>{" "}
        {city && state ? `${city}/${state}` : "-"}
      </p>
      <p>
        <span className="font-medium">Preço:</span>{" "}
        {price !== null && price !== undefined
          ? `R$ ${Number(price).toFixed(2)}`
          : "A consultar"}
      </p>
      <p>
        <span className="font-medium">Confirmados:</span> {confirmedCount ?? 0}/
        {maxPlayers}
      </p>
      <p>
        <span className="font-medium">Interessados:</span>{" "}
        {interestedCount ?? 0}
      </p>
    </div>
  );
}
