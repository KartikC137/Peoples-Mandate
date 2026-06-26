export const bigintToDateWithTimeStamp = (rawTimeStamp: bigint) => {
  return new Date(Number(rawTimeStamp) * 1000);
};

export const bigIntToIsoDate = (rawTimeStamp: bigint) => {
  const date = new Date(Number(rawTimeStamp) * 1000);
  return date.toISOString().split("T")[0];
};

/**
 * @notice 'custom' value must be provided with 'startOffset'.
 * @param data string data to slice. notice: (auto select standard slices for eth address(len = 42) and bytes32(len = 66), can be overriden with custom value)
 * @param custom no. of characters to slice from start and end
 * @param startOffset no. of characters to skip from start
 * @returns if valid startOffset and custom provided : sliced hash with "..." in betweeen, else the data itself.
 */
export function slicer(
  data: string,
  custom?: number,
  startOffset?: number,
): string {
  if (!data || data.length === 0) return data;
  const len = data.length;

  if (!custom && data.startsWith("0x")) {
    // standard slices for eth address and solidity bytes32
    if (len === 42) {
      return data.slice(0, 15) + "..." + data.slice(27, 42);
    }
    if (len === 66) {
      return data.slice(0, 15) + "..." + data.slice(51, 66);
    }
  }
  if (custom) {
    const offset = startOffset || 0;
    const max = Math.floor((len - offset) / 2) - 3;
    if (custom <= max) {
      return data.slice(0, offset + custom) + "..." + data.slice(len - custom);
    }
  }
  return data;
}
