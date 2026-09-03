import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Layers,
  Activity,
  Cpu,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analyzeNewProjectInput, type AddProjectInput, type DetailedAnalysisResult } from '../services/predictionService';
import type { Project, ProjectType, StageName } from '../types';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { addProject } = useApp();

  const [step, setStep] = useState<'input' | 'analyzing' | 'result'>('input');

  // Form State
  const [formData, setFormData] = useState<AddProjectInput>({
    name: 'NH-48 Package 4 Expressway Corridor',
    projectType: 'Expressway Corridor' as ProjectType,
    state: 'Maharashtra',
    district: 'Nashik',
    agency: 'National Highways Authority of India (NHAI)',
    landAreaHa: 480,
    affectedFamilies: 1240,
    currentStage: 'Compensation' as StageName,
    compensationPaidPercent: 32,
    approvalStatusPercent: 65,
    documentationCompletenessPercent: 58,
    possessionStatusPercent: 20,
    rrProgressPercent: 25,
    legalCasesCount: 14,
    pendingNotificationsCount: 3,
    stakeholderResponsiveness: 'Critical Blockade',
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DetailedAnalysisResult | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof AddProjectInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationError) setValidationError(null);
  };

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setValidationError('Project name is required.');
      return;
    }
    if (!formData.district.trim()) {
      setValidationError('District name is required.');
      return;
    }
    if (formData.landAreaHa <= 0) {
      setValidationError('Land area must be greater than 0 hectares.');
      return;
    }
    if (formData.affectedFamilies < 0) {
      setValidationError('Affected families count cannot be negative.');
      return;
    }
    if (formData.legalCasesCount < 0) {
      setValidationError('Legal disputes count cannot be negative.');
      return;
    }

    // Trigger analysis running state
    setStep('analyzing');

    setTimeout(() => {
      const result = analyzeNewProjectInput(formData);
      setAnalysisResult(result);
      setStep('result');
    }, 700);
  };

  const handleSaveProject = () => {
    if (!analysisResult) return;

    const newId = `LA-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProject: Project = {
      id: newId,
      name: formData.name,
      state: formData.state,
      district: formData.district,
      agency: formData.agency || 'Ministry of Road Transport & Highways',
      projectType: formData.projectType,
      landAreaHa: formData.landAreaHa,
      affectedFamilies: formData.affectedFamilies,
      villagesCount: Math.max(1, Math.round(formData.affectedFamilies / 120)),
      currentStage: formData.currentStage,
      stageProgressPercent: formData.compensationPaidPercent,
      lat: formData.state === 'Maharashtra' ? 19.9975 : formData.state === 'Bihar' ? 25.5941 : 26.8467,
      lng: formData.state === 'Maharashtra' ? 73.7898 : formData.state === 'Bihar' ? 85.1376 : 80.9462,
      lastUpdated: 'Just Now',
      isSyntheticDemo: true,
      features: {
        compensationPaidPercent: formData.compensationPaidPercent,
        unpaidBeneficiariesPercent: 100 - formData.compensationPaidPercent,
        legalCasesCount: formData.legalCasesCount,
        pendingApprovalsCount: formData.pendingNotificationsCount,
        documentationCompletenessPercent: formData.documentationCompletenessPercent,
        rrProgressPercent: formData.rrProgressPercent,
        daysPaymentStageVsMedian: 18,
      },
      stages: [
        { id: 'stg-1', name: 'Notification', expectedDays: 60, actualDays: 62, varianceDays: 2, status: 'Completed' },
        { id: 'stg-2', name: 'SIA', expectedDays: 90, actualDays: 95, varianceDays: 5, status: 'Completed' },
        { id: 'stg-3', name: 'Declaration', expectedDays: 45, actualDays: 48, varianceDays: 3, status: 'Completed' },
        { id: 'stg-4', name: 'Award', expectedDays: 60, actualDays: 78, varianceDays: 18, status: 'Delayed' },
        { id: 'stg-5', name: 'Compensation', expectedDays: 90, actualDays: 125, varianceDays: 35, status: 'In Progress' },
        { id: 'stg-6', name: 'Possession', expectedDays: 60, actualDays: 0, varianceDays: 0, status: 'Pending' },
        { id: 'stg-7', name: 'R&R', expectedDays: 120, actualDays: 0, varianceDays: 0, status: 'Pending' },
      ],
      evidenceSignals: [
        `${formData.legalCasesCount} pending title disputes filed under High Court`,
        `Compensation completion at ${formData.compensationPaidPercent}% (${100 - formData.compensationPaidPercent}% unpaid)`,
        `Stakeholder responsiveness flagged as ${formData.stakeholderResponsiveness}`,
      ],
      recommendedIntervention: {
        id: `int-${newId.toLowerCase()}-01`,
        actionName: analysisResult.recommendations[0] || 'Deploy SLAO Reconciliation Team',
        recommendedAction: analysisResult.recommendations[0] || 'Deploy SLAO Reconciliation Team',
        primaryDriver: analysisResult.contributors[0]?.factor || 'Compensation',
        owner: 'District Land Acquisition Cell',
        dueDays: 3,
        priority: analysisResult.riskScorePercent >= 80 ? 'P1' : 'P2',
        status: 'Open',
      },
    };

    addProject(newProject);
    onClose();
    setStep('input');
    navigate(`/projects/${newId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-white border border-slate-300 w-full max-w-4xl rounded-xs shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* MODAL HEADER */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Cpu className="w-5 h-5 text-blue-400" />
            <div>
              <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest block">
                KSHETRA AI PREDICTIVE ENGINE &bull; 
              </span>
              <h2 className="text-sm sm:text-base font-bold font-mono text-white uppercase tracking-tight">
                {step === 'input' ? 'Add New Project & Run Predictive Analysis' : step === 'analyzing' ? 'Analyzing Project Risk Parameters...' : 'Predictive Analysis Results'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xs cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: INPUT FORM */}
        {step === 'input' && (
          <form onSubmit={handleRunAnalysis} className="p-5 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
            {validationError && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-xs text-red-800 text-xs font-semibold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* SECTION 1: BASIC PROJECT INFORMATION */}
            <div className="space-y-3">
              <div className="border-b border-slate-200 pb-1 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-800" />
                <h3 className="font-mono font-bold text-slate-900 uppercase text-xs">
                  1. Basic Project Parameters
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-mono font-bold text-[11px] text-slate-700 block mb-1">
                    PROJECT NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. NH-48 Package 4 Expressway Corridor"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="font-mono font-bold text-[11px] text-slate-700 block mb-1">
                    PROJECT TYPE
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => handleInputChange('projectType', e.target.value as ProjectType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="Expressway Corridor">Expressway Corridor</option>
                    <option value="Rail Infrastructure">Rail Infrastructure</option>
                    <option value="Industrial Park">Industrial Park</option>
                    <option value="Airport">Airport</option>
                    <option value="Metro Rail">Metro Rail</option>
                    <option value="Renewable Energy Park">Renewable Energy Park</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono font-bold text-[11px] text-slate-700 block mb-1">
                    STATE JURISDICTION
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Gujarat">Gujarat</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono font-bold text-[11px] text-slate-700 block mb-1">
                    DISTRICT / TEHSIL *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    placeholder="e.g. Nashik"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-mono font-bold text-[11px] text-slate-700 block mb-1">
                    CURRENT STAGE
                  </label>
                  <select
                    value={formData.currentStage}
                    onChange={(e) => handleInputChange('currentStage', e.target.value as StageName)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="Notification">Notification</option>
                    <option value="SIA">Social Impact Assessment (SIA)</option>
                    <option value="Declaration">Declaration</option>
                    <option value="Award">Award Inquiry</option>
                    <option value="Compensation">Compensation Disbursement</option>
                    <option value="Possession">Possession</option>
                    <option value="R&R">Rehabilitation & Resettlement</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono font-bold text-[11px] text-slate-700 block mb-1">
                    LAND AREA (HECTARES)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.landAreaHa}
                    onChange={(e) => handleInputChange('landAreaHa', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="font-mono font-bold text-[11px] text-slate-700 block mb-1">
                    AFFECTED FAMILIES (COUNT)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.affectedFamilies}
                    onChange={(e) => handleInputChange('affectedFamilies', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden font-mono"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: ACQUISITION PROGRESS INDICATORS */}
            <div className="space-y-3 pt-2">
              <div className="border-b border-slate-200 pb-1 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-800" />
                <h3 className="font-mono font-bold text-slate-900 uppercase text-xs">
                  2. Acquisition Progress Indicators
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between font-mono text-[11px] mb-1">
                    <span className="font-bold text-slate-700">COMPENSATION DISBURSED</span>
                    <span className="font-bold text-blue-800">{formData.compensationPaidPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.compensationPaidPercent}
                    onChange={(e) => handleInputChange('compensationPaidPercent', Number(e.target.value))}
                    className="w-full accent-blue-700 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-mono text-[11px] mb-1">
                    <span className="font-bold text-slate-700">CLEARANCES & APPROVALS</span>
                    <span className="font-bold text-blue-800">{formData.approvalStatusPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.approvalStatusPercent}
                    onChange={(e) => handleInputChange('approvalStatusPercent', Number(e.target.value))}
                    className="w-full accent-blue-700 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-mono text-[11px] mb-1">
                    <span className="font-bold text-slate-700">DOCUMENTATION VERIFIED</span>
                    <span className="font-bold text-blue-800">{formData.documentationCompletenessPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.documentationCompletenessPercent}
                    onChange={(e) => handleInputChange('documentationCompletenessPercent', Number(e.target.value))}
                    className="w-full accent-blue-700 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-mono text-[11px] mb-1">
                    <span className="font-bold text-slate-700">POSSESSION HANDOVER</span>
                    <span className="font-bold text-blue-800">{formData.possessionStatusPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.possessionStatusPercent}
                    onChange={(e) => handleInputChange('possessionStatusPercent', Number(e.target.value))}
                    className="w-full accent-blue-700 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-mono text-[11px] mb-1">
                    <span className="font-bold text-slate-700">R&R EXECUTION</span>
                    <span className="font-bold text-blue-800">{formData.rrProgressPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.rrProgressPercent}
                    onChange={(e) => handleInputChange('rrProgressPercent', Number(e.target.value))}
                    className="w-full accent-blue-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: RISK & CONFLICT FACTORS */}
            <div className="space-y-3 pt-2">
              <div className="border-b border-slate-200 pb-1 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <h3 className="font-mono font-bold text-slate-900 uppercase text-xs">
                  3. Risk & Legal Conflict Indicators
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-mono font-bold text-[11px] text-slate-700 block mb-1">
                    PENDING LEGAL DISPUTES (COUNT)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.legalCasesCount}
                    onChange={(e) => handleInputChange('legalCasesCount', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="font-mono font-bold text-[11px] text-slate-700 block mb-1">
                    PENDING GAZETTE NOTIFICATIONS
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.pendingNotificationsCount}
                    onChange={(e) => handleInputChange('pendingNotificationsCount', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="font-mono font-bold text-[11px] text-slate-700 block mb-1">
                    COMMUNITY RESPONSIVENESS
                  </label>
                  <select
                    value={formData.stakeholderResponsiveness}
                    onChange={(e) => handleInputChange('stakeholderResponsiveness', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="High">High (Cooperative)</option>
                    <option value="Medium">Medium (Moderate Grievances)</option>
                    <option value="Low">Low (Friction / Slow Verification)</option>
                    <option value="Critical Blockade">Critical Blockade (Active Agitation)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs rounded-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-mono font-bold text-xs rounded-xs shadow-md flex items-center space-x-2 cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>ANALYZE PROJECT</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: ANALYZING STATE */}
        {step === 'analyzing' && (
          <div className="p-12 flex flex-col items-center justify-center space-y-4 my-auto">
            <div className="w-12 h-12 border-3 border-blue-700 border-t-transparent rounded-full animate-spin" />
            <div className="text-center space-y-1 font-mono">
              <h3 className="font-bold text-slate-900 text-base">Running KSHETRA Predictive Risk Scoring Engine...</h3>
              <p className="text-xs text-slate-500">Evaluating 14 land acquisition delay parameters against  benchmarks</p>
            </div>
          </div>
        )}

        {/* STEP 3: PREDICTIVE RESULTS VIEW */}
        {step === 'result' && analysisResult && (
          <div className="p-5 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
            {/* HEADER METRICS */}
            <div className="p-4 bg-slate-900 text-white rounded-xs space-y-3 shadow-md font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2 gap-2">
                <div>
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest block">PREDICTIVE ANALYTICS RESULT</span>
                  <h3 className="text-base font-bold text-white">{formData.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-xs uppercase ${
                      analysisResult.riskLevel === 'CRITICAL'
                        ? 'bg-red-700 text-white'
                        : analysisResult.riskLevel === 'HIGH'
                        ? 'bg-orange-600 text-white'
                        : analysisResult.riskLevel === 'MODERATE'
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {analysisResult.riskLevel} RISK
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">DELAY PROBABILITY</span>
                  <span className="text-3xl font-black text-red-400">{analysisResult.delayProbability}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">PROJECTED SCHEDULE SLIP</span>
                  <span className="text-2xl font-bold text-slate-200">+{analysisResult.predictedDelayDays} DAYS</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 uppercase block">PRIMARY BOTTLENECK</span>
                  <span className="text-sm font-bold text-amber-400 truncate block mt-1">{analysisResult.contributors[0]?.factor}</span>
                </div>
              </div>
            </div>

            {/* KEY RISK DRIVERS */}
            <div className="space-y-3 font-mono">
              <div className="border-b border-slate-200 pb-1">
                <h4 className="font-bold text-slate-900 uppercase text-xs">KEY RISK DRIVERS</h4>
              </div>

              <div className="space-y-2 font-sans">
                {analysisResult.contributors.slice(0, 4).map((c) => (
                  <div key={c.factor} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-900">{c.factor}</span>
                      <span className="font-mono font-bold text-slate-900">{c.percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-xs overflow-hidden">
                      <div className="h-full rounded-xs" style={{ width: `${c.percentage}%`, backgroundColor: c.impactColor }} />
                    </div>
                    <p className="text-[11px] text-slate-500">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* STAGE-LEVEL RISK MATRIX */}
            <div className="space-y-3 font-mono">
              <div className="border-b border-slate-200 pb-1">
                <h4 className="font-bold text-slate-900 uppercase text-xs">STAGE-LEVEL RISK BREAKDOWN</h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {analysisResult.stageRisks.map((s) => (
                  <div key={s.stage} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xs text-center space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block truncate">{s.stage}</span>
                    <span
                      className={`text-xs font-bold block ${
                        s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH'
                          ? 'text-red-700'
                          : s.riskLevel === 'MODERATE'
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {s.riskLevel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* WHY KSHETRA FLAGGED THIS PROJECT */}
            <div className="space-y-2 p-3 bg-amber-50 border border-amber-200 rounded-xs">
              <h4 className="font-mono font-bold text-amber-900 uppercase text-xs">WHY KSHETRA FLAGGED THIS PROJECT</h4>
              <ul className="space-y-1 text-xs text-amber-900 font-medium">
                {analysisResult.explanations.map((exp, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold">&bull;</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* KSHETRA RECOMMENDED INTERVENTIONS */}
            <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-xs">
              <h4 className="font-mono font-bold text-blue-950 uppercase text-xs">KSHETRA RECOMMENDS (PRIORITIZED ACTION)</h4>
              <ol className="space-y-1 text-xs text-blue-950 font-semibold list-decimal list-inside">
                {analysisResult.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ol>
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs rounded-xs cursor-pointer"
              >
                &larr; Edit Inputs
              </button>
              <button
                type="button"
                onClick={handleSaveProject}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-mono font-bold text-xs rounded-xs shadow-md flex items-center space-x-2 cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-200" />
                <span>SAVE PROJECT & OPEN INTELLIGENCE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
