import { Data } from "effect";

export class GeoScanError extends Data.TaggedError("GeoScanError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class GeoDiscoveryError extends Data.TaggedError("GeoDiscoveryError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}
