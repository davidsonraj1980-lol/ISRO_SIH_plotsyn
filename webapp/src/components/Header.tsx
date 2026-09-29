import React from 'react';
import { ISRO_SCENARIOS } from '../scenarios/isroScenarios';
import { ScenarioDefinition } from '../types';
import { Shield, Search, RefreshCw, Eye, ExternalLink, HelpCircle, Layers } from 'lucide-react';

interface HeaderProps {
  currentScenario: ScenarioDefinition;
  onSelectScenario: (scenario: ScenarioDefinition) => void;
  onRunAgent: () => void;
  onReset: () => void;
  onOpenPrivacyHud: () => void;
  isRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenario,
  onSelectScenario,
  onRunAgent,
  onReset,
  onOpenPrivacyHud,
  isRunning
}) => {
  return (
    <header>
      {/* 1. Official Government Accessibility Top Bar */}
      <div className="gov-top-bar">
        <div className="gov-top-left">
          <span className="gov-india-text">भारत सरकार | Government of India</span>
          <span className="gov-link">Skip to Main Content</span>
        </div>
        <div className="gov-top-right">
          <span className="gov-link">Screen Reader</span>
          <span className="gov-link">English</span>
          <span className="gov-link">A+ A A-</span>
        </div>
      </div>

      {/* 2. Official Header Branding (Bilingual ISRO Logo + Department of Space) */}
      <div className="app-gov-header">
        <div className="header-main-row">
          <div className="isro-official-branding">
            <img src="/isro-logo.svg" alt="ISRO Official Emblem" className="isro-crest-img" />
            <div className="bilingual-titles">
              <span className="hindi-title">भारतीय अंतरिक्ष अनुसंधान संगठन</span>
              <span className="english-title">Indian Space Research Organisation</span>
              <span className="dept-subtitle">Department of Space, Government of India • Smart India Hackathon PS #26171</span>
            </div>
          </div>

          <div className="header-search-box">
            <input 
              type="text" 
              placeholder="Search Services, Telemetry, Missions..." 
              readOnly 
              defaultValue="INSAT-3DS Clearance"
            />
            <Search size={15} className="search-icon-right" />
          </div>
        </div>
      </div>

      {/* 3. Government Navigation Bar */}
      <nav className="gov-nav-bar">
        <div className="nav-links-row">
          <span className="nav-item">Home</span>
          <span className="nav-item nav-active">
            My Mission Telemetry ▾
            <span className="nav-tag-badge">NETRA ACTIVE</span>
          </span>
          <span className="nav-item">About ISRO ▾</span>
          <span className="nav-item">Satellite Portals ▾</span>
          <span 
            className="nav-item" 
            onClick={onOpenPrivacyHud}
            title="Inspect on-device visual privacy audit"
          >
            Privacy Audit
          </span>
          <span className="nav-item">Guidelines ▾</span>
          <span className="nav-item">Help ▾</span>
        </div>

        <div className="header-right">
          <button 
            type="button"
            className="header-action-btn"
            onClick={onOpenPrivacyHud}
            title="Inspect cryptographic visual buffer"
          >
            <Eye size={13} />
            <span>Privacy Audit HUD</span>
          </button>

          <button 
            type="button"
            className="header-action-btn"
            onClick={onReset}
            disabled={isRunning}
            title="Reset active form"
          >
            <RefreshCw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
