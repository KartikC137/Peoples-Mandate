import { slicer } from "@/lib/util/helpers";

export default function HashBadge({
  hash,
  style = "",
  startOffset,
  custom,
}: {
  hash: string;
  startOffset?: number;
  custom?: number;
  style?: string;
}) {
  const truncatedHash = slicer(hash, custom, startOffset);
  return (
    <span className={`cursor-pointer font-mono ${style}`} title={hash}>
      {truncatedHash}
    </span>
  );
}
