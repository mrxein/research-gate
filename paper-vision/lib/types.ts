export type Status = "Unread" | "Reading" | "Reviewed";
export type Priority = "High" | "Medium" | "Low";

export interface Limitation {
  text: string;
  theme: string;
}

export interface EvidenceRef {
  item: string;
  page: string;
  section?: string;
  ref?: string;
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  doi?: string;
  researchArea?: string;
  tags: string[];
  problem: string;
  motivation: string;
  noveltyAndContributions: string[];
  methodology: string[];
  keyAssumptions: string[];
  datasets: string[];
  partition: string[];
  numClients?: number[];
  experimentalSetup?: string[];
  baselines?: string[];
  flAlgorithms: string[];
  xaiMethods: string[];
  xaiEvaluation?: string;
  metrics: string[];
  results: string;
  failureConditions?: string[];
  costEvaluation?: string;
  limitations: Limitation[];
  futureWork: string[];
  relevance?: string;
  newIdeas?: string[];
  reviewStatus?: string;
  priority?: Priority;
  evidence?: EvidenceRef[];
}

export interface Evidence {
  id: string;
  page: string;
  section: string;
  ref: string;
  quote: string;
}

export interface Gap {
  id: string;
  kind: "Recurring limitation" | "Unexplored combination";
  title: string;
  papers: string[];
  evidence: string[];
}

export interface WS {
  status: Record<string, Status>;
  notes: Record<string, string>;
  tags: Record<string, string[]>;
  evidence: Record<string, Evidence[]>;
  validated: Record<string, string>;
  questions: string[];
}