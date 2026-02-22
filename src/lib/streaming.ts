/** Amazon Prime streaming option shown when user clicks "Where to Watch" */
export const AMAZON_PRIME_STREAMING_OPTION = {
  platform: "Amazon Prime",
  type: "subscription" as const,
  url: "https://amzn.to/4740qh0",
};

export type StreamingOption = {
  platform: string;
  type: "free" | "subscription" | "rent" | "buy";
  price?: string;
  url: string;
  quality?: string;
};

/** Prepend Amazon Prime to the list, avoiding duplicate by platform name */
export function withAmazonPrime(options: StreamingOption[]): StreamingOption[] {
  const hasAmazon = options.some(
    (o) => o.platform.toLowerCase().includes("amazon")
  );
  if (hasAmazon) return options;
  return [AMAZON_PRIME_STREAMING_OPTION, ...options];
}
