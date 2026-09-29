import React from 'react';
import { ScenarioDefinition, BoundingBox } from '../types';
import { ISRO_SCENARIOS } from '../scenarios/isroScenarios';
import { 
  UserCheck, 
  Satellite, 
  ArrowRight, 
  CheckCircle2, 
  Globe2, 
  Radio, 
  ShieldCheck, 
  Sparkles,
  FileCheck2,
  ChevronRight
} from 'lucide-react';

interface MissionPortalProps {
  scenario: ScenarioDefinition;
  onSelectScenario: (scenario: ScenarioDefinition) => void;
  detectedBoxes: BoundingBox[];
  activeActionSelector: string | null;
  onFormSubmitted?: () => void;
  formSuccess: boolean;
}

export const MissionPortal: React.FC<MissionPortalProps> = ({
  scenario,
  onSelectScenario,
  detectedBoxes,
  activeActionSelector,
  onFormSubmitted,
  formSuccess
}) => {
  const scenarioMeta: Record<string, {
    officerName: string;
    officerRank: string;
    officerId: string;
    actionButtonText: string;
    actionButtonId: string;
    consentText: string;
    telemetryTitle: string;
    telemetrySubtitle: string;
    telemetryRows: Array<{ label: string; value: string; isMono?: boolean }>;
  }> = {
    'sac-telemetry': {
      officerName: 'Dr. Rajesh V. Sharma',
      officerRank: "Mission Director (Scientist/Engineer 'H')",
      officerId: 'ISRO-SAC-8842',
      actionButtonText: 'Authorize Telemetry Downlink',
      actionButtonId: 'authorize-telemetry-btn',
      consentText: 'I verify that telemetry parameters conform to DOS/ISRO Outer Space Clearance Protocol (OSCP-2024).',
      telemetryTitle: 'Orbital Downlink Clearance',
      telemetrySubtitle: 'Downlink vector parameters for tracking ground stations.',
      telemetryRows: [
        { label: 'Target Orbit', value: 'Geosynchronous Transfer Orbit (GTO)' },
        { label: 'Apogee / Perigee', value: '36,000 km × 170 km' },
        { label: 'Transponder Band', value: 'Ku-Band (14.25 GHz up / 11.45 GHz down)' },
        { label: 'Ground Station', value: 'ISTRAC Bengaluru (Primary Ground Node)' },
        { label: 'Integrity Checksum', value: 'SHA256: 4a9e88...e109', isMono: true }
      ]
    },
    'chandrayaan-lunar': {
      officerName: 'Shri S. Mohan Kumar',
      officerRank: 'Mission Operations Director, ISTRAC',
      officerId: 'ISTRAC-MOX-1049',
      actionButtonText: 'Authorize Trans-Lunar Injection (TLI)',
      actionButtonId: 'authorize-telemetry-btn',
      consentText: 'I confirm cryogenic stage propellant loading and deep-space trajectory parameters (TLI-DV1).',
      telemetryTitle: 'Trans-Lunar Injection Clearance',
      telemetrySubtitle: 'Deep-space trajectory and cryogenic propulsion loading parameters.',
      telemetryRows: [
        { label: 'Profile', value: 'Trans-Lunar Injection (TLI-240h)' },
        { label: 'Target Lunar Orbit', value: '100 km × 100 km Polar' },
        { label: 'Propulsion Stage', value: 'CE-20 Cryogenic Upper Stage (LOX/LH2)' },
        { label: 'Deep Space Station', value: 'IDSN 32m Antenna, Byalalu' },
        { label: 'Crypto Signature', value: 'AES-GCM: 902f4a...9b12', isMono: true }
      ]
    },
    'mosdac-satellite': {
      officerName: 'Dr. Ananya Sen',
      officerRank: 'Principal Data Investigator, NRSC',
      officerId: 'NRSC-GEO-5521',
      actionButtonText: 'Authorize Dataset Procurement',
      actionButtonId: 'authorize-telemetry-btn',
      consentText: 'I agree to the National Remote Sensing Data Policy (NRSDP-2020) for sovereign research use.',
      telemetryTitle: 'Earth Observation Sensor Specifications',
      telemetrySubtitle: 'Cartosat-3 and multispectral dataset access specifications.',
      telemetryRows: [
        { label: 'Sensor Payload', value: 'Cartosat-3 PAN + Multi-Spectral VNIR' },
        { label: 'Resolution', value: '0.28m Panchromatic / 1.12m MX' },
        { label: 'Cloud Cover Filter', value: '< 2.0% Scene Threshold' },
        { label: 'Delivery Architecture', value: 'MeghRaj Government Cloud Encrypted CDN' },
        { label: 'GeoTIFF Hash', value: 'GEOHASH: 7bf812...aa44', isMono: true }
      ]
    }
  };

  const meta = scenarioMeta[scenario.id] || scenarioMeta['sac-telemetry'];

  return (
    <div className="portal-container" id="simulated-page-container">
      {/* 1. Hero Title & Subtitle (Styled authentically like My Aadhaar) */}
      <div className="portal-hero-section">
        <h1 className="portal-hero-title">ISRO Mission Telemetry & Clearance Services</h1>
        <p className="portal-hero-desc">
          Understand mission telemetry, orbital clearance protocols, on-device visual privacy masking, and statutory space authorization under Department of Space, Government of India.
        </p>
      </div>

      {/* 2. Category Selection Pills ("In this section" on UIDAI website) */}
      <div className="section-pills-row">
        <span className="section-pills-label">In this section</span>
        <div className="pills-group">
          {ISRO_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              type="button"
              className={`gov-pill-btn ${scenario.id === sc.id ? 'pill-selected' : ''}`}
              onClick={() => onSelectScenario(sc)}
            >
              {sc.id === 'sac-telemetry' && 'SAC INSAT-3DS Telemetry'}
              {sc.id === 'chandrayaan-lunar' && 'Chandrayaan-4 Lunar Console'}
              {sc.id === 'mosdac-satellite' && 'MOSDAC Earth Observation'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Section 1: "Updates Details" / "Mission Downlink & Telemetry Clearance" */}
      <div className="portal-section-group">
        <h2 className="section-group-heading">Updates & Telemetry Clearance</h2>

        <div className="portal-cards-grid">
          {/* Card 1: Operator Identity & Biometric Verification */}
          <div className="gov-service-card">
            <div className="card-top-header">
              <div className="card-minimal-icon">
                <UserCheck size={20} />
              </div>
              <h3 className="card-headline">Operator Identity Verification</h3>
              <p className="card-subheadline">
                Use verified scientist credentials or biometric face token. Mobile OTP is required.
              </p>
            </div>

            {/* Officer Identity Card */}
            <div className="officer-badge-card">
              <div 
                className={`officer-avatar ${detectedBoxes.some(b => b.type === 'face_avatar') ? 'detected-border' : ''}`}
                data-vision-sensitive="true"
              >
                <span>{meta.officerName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
              </div>
              <div className="officer-info">
                <span className="officer-name">{meta.officerName}</span>
                <span className="officer-role">{meta.officerRank} • {meta.officerId}</span>
              </div>
            </div>

            {/* Sensitive Form Fields */}
            <div className="form-field-group">
              {scenario.sensitiveElements.map((elem) => {
                const isPassword = elem.type === 'password';
                const inputType = isPassword ? 'password' : elem.type === 'phone' ? 'tel' : 'text';
                const cleanId = elem.selector.replace('#', '');
                const isDetected = detectedBoxes.some(b => b.selector === elem.selector);

                return (
                  <div key={elem.selector} className="gov-form-item">
                    <div className="gov-form-label-row">
                      <label htmlFor={cleanId}>{elem.label}:</label>
                      {isDetected && (
                        <span className="shield-badge-tag">Client Masked</span>
                      )}
                    </div>
                    <input
                      id={cleanId}
                      name={cleanId}
                      type={inputType}
                      defaultValue={elem.value}
                      className={`gov-input ${isDetected ? 'field-shielded' : ''}`}
                      readOnly
                    />
                  </div>
                );
              })}

              {/* Consent Box */}
              <div className={`gov-consent-box ${activeActionSelector === '#statutory-consent-check' ? 'box-active-target' : ''}`}>
                <label className="gov-checkbox-label">
                  <input
                    id="statutory-consent-check"
                    type="checkbox"
                    defaultChecked={false}
                  />
                  <span>{meta.consentText}</span>
                </label>
              </div>
            </div>

            {/* Card Footer with Circular Arrow and Fee/Status */}
            <div className="card-footer-row">
              <div className="circle-arrow-btn" title="View details">
                <ArrowRight size={14} />
              </div>
              <span className="card-status-text">Client Masked • 0% Leak</span>
            </div>
          </div>

          {/* Card 2: Orbital Downlink Specifications */}
          <div className="gov-service-card">
            <div className="card-top-header">
              <div className="card-minimal-icon">
                <Satellite size={20} />
              </div>
              <h3 className="card-headline">{meta.telemetryTitle}</h3>
              <p className="card-subheadline">{meta.telemetrySubtitle}</p>
            </div>

            <table className="gov-table">
              <tbody>
                {meta.telemetryRows.map((row) => (
                  <tr key={row.label}>
                    <td className="table-label">{row.label}</td>
                    <td className={`table-value ${row.isMono ? 'mono' : ''}`}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Card Footer with Circular Arrow and Clearance Status */}
            <div className="card-footer-row">
              <div className="circle-arrow-btn" title="Inspect specifications">
                <ArrowRight size={14} />
              </div>
              <span className="card-status-text">DOS Authorized</span>
            </div>
          </div>
        </div>

        {/* Full-width Status & Execution Strip (Modeled after "Check Status: Address Update ->") */}
        <div className="gov-status-strip">
          <div className="status-strip-left">
            <FileCheck2 size={16} className="text-blue-600" />
            <span className="status-strip-label">Check Status:</span>
            <span className="status-strip-target">Telemetry Downlink & Orbital Clearance</span>
          </div>

          <button
            id={meta.actionButtonId}
            className={`gov-strip-action-btn ${activeActionSelector === `#${meta.actionButtonId}` ? 'btn-active-target' : ''}`}
            onClick={onFormSubmitted}
          >
            <span>{meta.actionButtonText}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {formSuccess && (
          <div className="decree-verified-banner">
            <CheckCircle2 size={16} />
            <span>Statutory clearance decree approved. Verified and executed by Netra Vision Agent.</span>
          </div>
        )}
      </div>

      {/* 4. Section 2: "Satellite Data & Observation Portals" (Modeled after "Download or Order Card") */}
      <div className="portal-section-group">
        <h2 className="section-group-heading">Satellite Data & Payload Access</h2>

        <div className="portal-cards-grid">
          {/* Card 3: MOSDAC Earth Observation */}
          <div className="gov-service-card">
            <div className="card-top-header">
              <div className="card-minimal-icon">
                <Globe2 size={20} />
              </div>
              <h3 className="card-headline">MOSDAC Earth Observation Imagery</h3>
              <p className="card-subheadline">
                High-resolution 0.28m PAN + Multi-Spectral VNIR satellite scenes. MeghRaj sovereign cloud.
              </p>
            </div>
            <div className="card-footer-row">
              <div className="circle-arrow-btn" title="Open MOSDAC datasets">
                <ArrowRight size={14} />
              </div>
              <span className="card-status-text green">Open Access • Free</span>
            </div>
          </div>

          {/* Card 4: ISTRAC Deep Space Network */}
          <div className="gov-service-card">
            <div className="card-top-header">
              <div className="card-minimal-icon">
                <Radio size={20} />
              </div>
              <h3 className="card-headline">ISTRAC Deep Space Ground Network</h3>
              <p className="card-subheadline">
                32m Deep Space antenna at Byalalu, Bengaluru. Trans-lunar injection telemetry link.
              </p>
            </div>
            <div className="card-footer-row">
              <div className="circle-arrow-btn" title="Connect to ISTRAC node">
                <ArrowRight size={14} />
              </div>
              <span className="card-status-text">Classified Node</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

