/** Reown's public project identifier; never accept an RPC URL or other credential. */
export function readWalletProjectId(value: string | undefined) {
  const id = value?.trim();
  return id && /^[a-f0-9]{32}$/i.test(id) ? id : undefined;
}
