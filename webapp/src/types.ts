export type SensitiveEntityType = 
  | 'password' 
  | 'email' 
  | 'phone' 
  | 'aadhaar_ssn' 
  | 'credit_card' 
  | 'face_avatar' 
  | 'secret_token' 
  | 'gps_coordinate';

export type RedactionMethod = 'blackout' | 'gaussian_blur' | 'pixelate' | 'synthetic_token';

export interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
  type: SensitiveEntityType;
  selector?: string;
  textSnippet?: string;
}

export interface TelemetryMetrics {
  visualAccuracy: number;       // Criterion 1 (25%): Screen structure accuracy
  piiRecall: number;            // Criterion 2 (20%): Detected sensitive items / total true sensitive items
  piiPrecision: number;         // Criterion 2 (20%): True positives / total detections
  redactionPrecision: number;   // Criterion 3 (20%): Exact spatial mask coverage with 0% leak
  memoryUsageMb: number;        // Criterion 4 (20%): Client side memory footprint
  deviceInferenceMs: number;    // Criterion 4 & 5: Time taken by local ViT/Vision engine
  serverVlmMs: number;          // Criterion 5: Cloud/Server reasoning latency
  totalLatencyMs: number;       // Criterion 5 (15%): Complete perception-to-action cycle
}

export interface AgentAction {
  step: number;
  actionType: 'click' | 'type' | 'scroll' | 'select' | 'verify';
  targetElement: string;
  coordinates: { x: number; y: number };
  reasoning: string;
  confidence: number;
  status: 'pending' | 'executing' | 'completed';
  executionFeedback?: string;
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  department: string;
  description: string;
  defaultTaskPrompt: string;
  sensitiveElements: Array<{
    selector: string;
    type: SensitiveEntityType;
    label: string;
    value: string;
    isVisuallyRendered: boolean;
  }>;
}
