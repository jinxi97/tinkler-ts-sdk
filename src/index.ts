export interface TinklerOptions {
  apiKey?: string;                 // optional override
  baseURL?: string;                 // optional override
}

export class Tinkler {
  /** sole instance (lazy-initialised in the Constructor) */
  private static _instance: Tinkler | null = null;

  /** write-once, never re-assigned, never visible outside */
  private readonly apiKey!: string;

  /** base URL for your backend API */
  private readonly baseURL!: string;

  /**
   * You may call `new Tinkler()` many times; the same object is returned.
   */
  constructor(opts: TinklerOptions = {}) {
    if (Tinkler._instance) return Tinkler._instance;

    const key = opts.apiKey ?? process.env.TINKLER_API_KEY;
    if (!key) {
      throw new Error(
        "Tinkler: API key missing. Set TINKLER_API_KEY or pass { apiKey }."
      );
    }

    this.apiKey = key;

    // Resolve base URL
    this.baseURL =
      opts.baseURL ??
      "https://api.tinkler.ai";

    Tinkler._instance = this;                 // cache & return
  }

  /**
   * Verifies that the current API key is valid by calling
   * GET {baseURL}/verify_api_key and expecting a boolean response.
   */
  async verify_key(): Promise<boolean> {
    const url =
      this.baseURL.replace(/\/$/, "") + "/verify_api_key";

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!res.ok) {
      throw new Error(
        `Tinkler.verify_key failed: ${res.status} ${res.statusText}`
      );
    }

    // assume the endpoint returns a raw boolean
    return (await res.json()) as boolean;
  }
}