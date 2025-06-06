import { MessageFns } from "./generated/src/protos/sample_record";

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

  async push_record<T>(schemaName: string, record: T, codec: MessageFns<T>): Promise<boolean> {
    const url =
      this.baseURL.replace(/\/$/, "") + "/produce_record";

    const encoded_record = codec.encode(record).finish();
    const base64_record = Buffer.from(encoded_record).toString("base64");
    const request_body = JSON.stringify({
      schema_name: schemaName,
      record: base64_record,
    });

    console.log(request_body);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: request_body,
    });

    if (!res.ok) {
      throw new Error(
        `Tinkler.push_record failed: ${res.status} ${res.statusText}`
      );
    }

    return (await res.json()) as boolean;
  }
}