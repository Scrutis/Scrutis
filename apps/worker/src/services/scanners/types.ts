export type EngineResult = {
  engine: string;
  detected: boolean;
  threatName: string | null;
  severity: string | null;
  details: Record<string, unknown>;
};
