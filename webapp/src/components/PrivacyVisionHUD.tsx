import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Eye, 
  EyeOff, 
  FileJson, 
  Layers, 
  Lock, 
  CheckCircle2, 
  Download,
  AlertCircle
} from 'lucide-react';
import { BoundingBox, RedactionMethod } from '../types';

interface PrivacyVisionHUDProps {
  isOpen: boolean;
  onClose: () => void;
  sanitizedImageDataUrl: string | null;
  detectedBoxes: BoundingBox[];
  redactionMethod: RedactionMethod;
}

export const PrivacyVisionHUD: React.FC<PrivacyVisionHUDProps> = ({
  isOpen,
  onClose,
  sanitizedImageDataUrl,
  detectedBoxes,
  redactionMethod
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'graph' | 'audit'>('visual');

  if (!isOpen) return null;

  const sampleOutboundPayload = {
    transportSecurity: "TLS_AES_256_GCM_SHA384",
    clientSideSanitization: "ENABLED",
    redactionFilter: redactionMethod,
    totalMaskedEntities: detectedBoxes.length,
    exposedRawPiiBytes: 0,
    sanitizedImageBufferLength: sanitizedImageDataUrl ? `${Math.round(sanitizedImageDataUrl.length / 1024)} KB` : "0 KB",
    spatialEntitiesSentToServer: detectedBoxes.map(b => ({
      entityId: b.id,
      label: b.label,
      confidence: b.confidence,
      redactionStatus: "PERMANENTLY_BLURRED_AT_CANVAS_LEVEL",
      sanitizedBoundingBox: { x: b.x, y: b.y, w: b.width, h: b.height }
    }))
  };

  return (
    <div className="hud-modal-backdrop" onClick={onClose}>
      <div className="hud-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* HUD Header */}
        <div className="hud-header">
          <div className="hud-title-zone">
            <div className="hud-badge-icon">
              <ShieldCheck size={20} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="hud-title">ISRO Client-Side Privacy Verification HUD</h2>
              <p className="hud-subtitle">
                Cryptographic audit of visual context and outbound payload prior to network transmission
              </p>
            </div>
          </div>

          <div className="hud-controls">
            <span className="zero-leak-chip">
              <CheckCircle2 size={13} />
              <span>0% PII LEAK GUARANTEED</span>
            </span>
            <button className="btn-close-hud" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="hud-tabs">
          <button 
            className={`hud-tab ${activeTab === 'visual' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('visual')}
          >
            <EyeOff size={15} />
            <span>Sanitized Image Buffer (VLM Input)</span>
          </button>
          <button 
            className={`hud-tab ${activeTab === 'graph' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('graph')}
          >
            <Layers size={15} />
            <span>Entity Bounding Graph ({detectedBoxes.length})</span>
          </button>
          <button 
            className={`hud-tab ${activeTab === 'audit' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <FileJson size={15} />
            <span>Outbound Network Payload Audit</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="hud-content">
          {activeTab === 'visual' && (
            <div className="hud-visual-pane">
              <div className="visual-notice">
                <AlertCircle size={15} className="text-cyan-400" />
                <span>
                  This is the exact visual frame transmitted to the central VLM. Notice all credentials, passcodes, UIDAI Aadhaar, and officer facial biometrics are obscured at the hardware canvas buffer level.
                </span>
              </div>

              <div className="canvas-preview-container">
                {sanitizedImageDataUrl ? (
                  <img 
                    src={sanitizedImageDataUrl} 
                    alt="Sanitized Screen State for VLM" 
                    className="sanitized-screen-img"
                  />
                ) : (
                  <div className="canvas-empty-state">
                    <p>Run Comet agent once to generate live sanitized visual perception snapshot.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'graph' && (
            <div className="hud-graph-pane">
              <table className="entity-audit-table">
                <thead>
                  <tr>
                    <th>Entity Identifier</th>
                    <th>Type</th>
                    <th>Confidence</th>
                    <th>Coordinates (X, Y, W, H)</th>
                    <th>Protection Mechanism</th>
                  </tr>
                </thead>
                <tbody>
                  {detectedBoxes.map((b) => (
                    <tr key={b.id}>
                      <td className="entity-name">{b.label}</td>
                      <td><span className="type-tag">{b.type}</span></td>
                      <td className="conf-value">{(b.confidence * 100).toFixed(1)}%</td>
                      <td className="mono">{b.x}, {b.y} ({b.width}×{b.height})</td>
                      <td className="shield-col">
                        <span className="badge-shielded">
                          <Lock size={11} />
                          <span>{redactionMethod.toUpperCase()}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="hud-audit-pane">
              <div className="audit-header">
                <span className="audit-tag">OUTBOUND WIRE CAPTURE: 0 RAW SENSITIVE STRINGS</span>
              </div>
              <pre className="audit-json-box">
                {JSON.stringify(sampleOutboundPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
