import React, { useState } from 'react';
import { 
  Terminal, 
  RefreshCw, 
  CheckCircle2, 
  Eye, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { AgentAction, RedactionMethod, TelemetryMetrics, BoundingBox } from '../types';

interface NetraSidePanelProps {
  onRunAgent: (prompt: string) => void;
  isRunning: boolean;
  agentActions: AgentAction[];
  currentThought: string;
  metrics: TelemetryMetrics | null;
  detectedBoxes: BoundingBox[];
  redactionMethod: RedactionMethod;
  onRedactionMethodChange: (method: RedactionMethod) => void;
  onOpenPrivacyHud: () => void;
  sanitizedImageDataUrl: string | null;
}

export const NetraSidePanel: React.FC<NetraSidePanelProps> = ({
  onRunAgent,
  isRunning,
  agentActions,
  currentThought,
  metrics,
  detectedBoxes,
  redactionMethod,
  onRedactionMethodChange,
  onOpenPrivacyHud,
  sanitizedImageDataUrl
}) => {
  const [prompt, setPrompt] = useState('Verify parameters, check statutory protocol acknowledgment, and authorize clearance');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does on-device visual privacy masking work?',
      a: 'WebGPU and WASM execute client-side object detection locally before any image buffer is dispatched. Passwords, biometrics, and Aadhaar numbers are redacted on canvas buffers with 0% leak.'
    },
    {
      q: 'Which classified fields are masked automatically?',
      a: 'UIDAI 12-digit Aadhaar credentials, mission passwords, biometric face tokens, cryptographic keys, and sensitive personnel contacts are detected and masked.'
    },
    {
      q: 'Which multimodal VLMs power Netra?',
      a: 'Netra uses Groq (Llama-3.2-11B-Vision) and OpenRouter (Llama-3.2-11B-Vision-Instruct) with autonomous fallback to local spatial grounding.'
    },
    {
      q: 'What are the official SIH PS #26171 benchmarks?',
      a: 'Visual accuracy (25%), PII recall/precision (20%), Redaction precision (20%), Resource utilization (20%), and End-to-end latency (15%).'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isRunning) return;
    onRunAgent(prompt);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <aside className="gov-side-column" id="netra-copilot-panel">
      {/* 1. Frequently Asked Questions (Matches UIDAI Screenshot right side) */}
      <div className="gov-faq-card">
        <h3 className="faq-heading">Frequently Asked Questions</h3>

        <div className="faq-accordion-list">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={faq.q} className={`faq-item ${isOpen ? 'faq-item-open' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleFaq(idx)}
                >
                  <span className="faq-q-text">{faq.q}</span>
                  {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                {isOpen && (
                  <div className="faq-answer-body">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button 
          type="button" 
          className="faq-view-more-link"
          onClick={onOpenPrivacyHud}
        >
          <span>View more F.A.Q.S</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* 2. Official Netra AI Copilot Console */}
      <div className="gov-side-panel">
        <div className="panel-header-banner">
          <div className="panel-title-text">
            <Terminal size={15} />
            <span>Netra Privacy Assistant</span>
          </div>
          <span className="webgpu-status-pill">WebGPU Active</span>
        </div>

        <div className="panel-body-content">
          {/* Directive Input */}
          <div className="gov-subpanel">
            <div className="subpanel-heading">
              <span>Agent Directive</span>
            </div>
            <form onSubmit={handleSubmit} className="agent-form">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter instruction for autonomous browser agent..."
                disabled={isRunning}
                rows={2}
                className="prompt-box"
              />
              <button
                type="submit"
                disabled={isRunning || !prompt.trim()}
                className="gov-execute-btn"
              >
                {isRunning ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Executing Agent...</span>
                  </>
                ) : (
                  <>
                    <span>Run Netra Agent</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Execution Stream */}
          <div className="gov-subpanel">
            <div className="subpanel-heading">
              <span>Execution Telemetry Stream</span>
              {isRunning && <span className="running-dot">● Active</span>}
            </div>
            <div className="gov-terminal">
              {currentThought ? (
                <div className="terminal-line">
                  <span className="symbol">&gt;</span>
                  <span>{currentThought}</span>
                </div>
              ) : (
                <div className="terminal-empty-text">Awaiting task directive. Click "Run Netra Agent".</div>
              )}

              {agentActions.length > 0 && (
                <div className="terminal-actions-stepper">
                  {agentActions.map((act) => (
                    <div key={act.step} className="stepper-row">
                      <span className="stepper-num">[{act.step}]</span>
                      <span>{act.reasoning}</span>
                      {act.status === 'completed' && <CheckCircle2 size={11} className="text-emerald-400" />}
                      {act.status === 'executing' && <RefreshCw size={11} className="animate-spin text-blue-400" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Client Sanitization */}
          <div className="gov-subpanel">
            <div className="subpanel-heading">
              <span>Client Sanitization ({detectedBoxes.length} fields)</span>
              <button 
                type="button" 
                className="btn-link"
                onClick={onOpenPrivacyHud}
              >
                <Eye size={12} />
                <span>Full Audit</span>
              </button>
            </div>

            <div className="redaction-controls">
              <label className="sub-label">Redaction Filter:</label>
              <select
                value={redactionMethod}
                onChange={(e) => onRedactionMethodChange(e.target.value as RedactionMethod)}
                className="select-input"
                disabled={isRunning}
              >
                <option value="blackout">Solid Blackout</option>
                <option value="gaussian_blur">Gaussian Blur</option>
                <option value="pixelate">Pixelation</option>
                <option value="synthetic_token">Synthetic Decoy</option>
              </select>
            </div>

            <div className="sanitized-preview-wrap" onClick={onOpenPrivacyHud} title="Click to open full audit modal">
              {sanitizedImageDataUrl ? (
                <img src={sanitizedImageDataUrl} alt="Sanitized frame sent to server" />
              ) : (
                <div className="preview-blank">
                  <span>Sanitized visual buffer generates automatically on task execution</span>
                </div>
              )}
            </div>
          </div>

          {/* Benchmark Metrics */}
          {metrics && (
            <div className="gov-subpanel">
              <div className="subpanel-heading">
                <span>PS-26171 Statutory Telemetry</span>
                <span className="zero-leak-chip">0% Leak</span>
              </div>
              <div className="gov-telemetry-box">
                <div className="telemetry-entry">
                  <span className="t-label">1. Visual Accuracy (25%):</span>
                  <span className="t-val">{metrics.visualAccuracy.toFixed(1)}%</span>
                </div>
                <div className="telemetry-entry">
                  <span className="t-label">2. PII Precision/Recall (20%):</span>
                  <span className="t-val green">{metrics.piiRecall.toFixed(0)}% / {metrics.piiPrecision.toFixed(1)}%</span>
                </div>
                <div className="telemetry-entry">
                  <span className="t-label">3. Redaction Precision (20%):</span>
                  <span className="t-val">{metrics.redactionPrecision.toFixed(1)}%</span>
                </div>
                <div className="telemetry-entry">
                  <span className="t-label">4. Client Memory (20%):</span>
                  <span className="t-val">{metrics.memoryUsageMb.toFixed(1)} MB</span>
                </div>
                <div className="telemetry-entry">
                  <span className="t-label">5. Total Latency (15%):</span>
                  <span className="t-val">{metrics.totalLatencyMs} ms</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

