export interface IChingResult {
  hexagramName: string;
  hexagramSymbol: string;
  hexagramCode: string; // "101101" (1=Yang, 0=Yin) from top to bottom
  interpretation: string;
  advice: string;
}

export interface AlmanacResult {
  luckyNumbers: number[];
  goodFor: string[];
  badFor: string[];
  significance: string;
}

export interface GypsyResult {
  symbolsDetected: string[];
  meaning: string;
  prediction: string;
}

export interface FreudResult {
  manifestContent: string;
  latentContent: string;
  psychologicalMeaning: string;
}

export interface NeuroscienceResult {
  brainActivity: string;
  memoryConsolidation: string;
  sleepCycleAnalysis: string;
}

export interface DreamScores {
  iching: number;
  almanac: number;
  gypsy: number;
  freud: number;
  neuroscience: number;
}

export interface DreamAnalysis {
  summary: string;
  scores: DreamScores;
  iching: IChingResult;
  almanac: AlmanacResult;
  gypsy: GypsyResult;
  freud: FreudResult;
  neuroscience: NeuroscienceResult;
}