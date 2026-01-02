
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UserSession, TrainingModeId, TrainingModeConfig, Question, CertificateData, QuizState, ViewState, GameState, BetType, ActiveBets, Employee, UserRole } from './types';
import { MODES, QUESTION_BANK as INITIAL_BANK, NCL_SHIPS } from './constants';
import { Certificate } from './components/Certificate';
import { TableVisualizer } from './components/TableVisualizer';
import { Trophy, User, LogOut, CheckCircle, XCircle, ChevronRight, PlayCircle, RotateCcw, Dices, DollarSign, Settings, AlertCircle, Database, Upload, Download, X, Info, Anchor, ShieldCheck, Users, Lock } from 'lucide-react';

// --- Helpers ---

const CHIP_VALUES = [1, 5, 25, 100, 500];

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const isStandardBet = (type: string) => {
  return ['pass', 'dontPass', 'come', 'dontCome', 'field', 'horn', 'big6', 'big8'].includes(type) || type.startsWith('place') || type.startsWith('buy') || type.startsWith('lay');
};

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

// Professional Branding Footer
const CreditFooter = () => (
  <div className="no-print fixed bottom-4 right-6 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] pointer-events-none z-[100] select-none text-right">
    Created by and copyright <br/> <span className="text-gold">Kunal Chetri</span>
  </div>
);

// --- Sub-Components ---

const AdminCenter: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  bank: Record<string, Question[]>; 
  roster: Employee[];
  onUpdateBank: (newBank: Record<string, Question[]>) => void;
  onUpdateRoster: (newRoster: Employee[]) => void;
}> = ({ isOpen, onClose, bank, roster, onUpdateBank, onUpdateRoster }) => {
  const [tab, setTab] = useState<'questions' | 'roster'>('questions');
  const [jsonText, setJsonText] = useState(JSON.stringify(bank, null, 2));
  const [rosterText, setRosterText] = useState(JSON.stringify(roster, null, 2));
  const [error, setError] = useState('');

  useEffect(() => {
    setJsonText(JSON.stringify(bank, null, 2));
    setRosterText(JSON.stringify(roster, null, 2));
  }, [bank, roster, isOpen]);

  if (!isOpen) return null;

  const handleSaveQuestions = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.beginner || !parsed.intermediate || !parsed.expert) {
        throw new Error("Bank must contain 'beginner', 'intermediate', and 'expert' sections.");
      }
      onUpdateBank(parsed);
      setError('');
      alert("Question Bank Updated!");
    } catch (e: any) {
      setError("Invalid JSON format: " + e.message);
    }
  };

  const handleSaveRoster = () => {
    try {
      const parsed = JSON.parse(rosterText);
      if (!Array.isArray(parsed)) throw new Error("Roster must be an array of employees.");
      onUpdateRoster(parsed);
      setError('');
      alert("Employee Roster Updated!");
    } catch (e: any) {
      setError("Invalid Roster JSON: " + e.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[300] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><ShieldCheck className="text-gold"/> CAS Admin Center</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Management Panel • Authorized Use Only</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white"><X size={24}/></button>
        </div>
        
        <div className="flex border-b border-slate-800 px-6 bg-slate-800/20">
          <button onClick={() => setTab('questions')} className={`px-6 py-4 font-bold text-sm transition-all border-b-2 ${tab === 'questions' ? 'border-gold text-gold' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Questions Bank</button>
          <button onClick={() => setTab('roster')} className={`px-6 py-4 font-bold text-sm transition-all border-b-2 ${tab === 'roster' ? 'border-gold text-gold' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Employee Roster</button>
        </div>

        <div className="flex-1 p-6 flex flex-col min-h-0">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mb-4 font-mono">{error}</div>}
          
          <textarea 
            className="flex-1 bg-black border border-slate-800 rounded-xl p-4 font-mono text-sm text-green-400 outline-none focus:border-gold/50 resize-none"
            value={tab === 'questions' ? jsonText : rosterText}
            onChange={(e) => tab === 'questions' ? setJsonText(e.target.value) : setRosterText(e.target.value)}
            spellCheck={false}
          />
          
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <button 
              onClick={() => {
                const data = tab === 'questions' ? jsonText : rosterText;
                const name = tab === 'questions' ? 'cas-questions.json' : 'cas-roster.json';
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = name;
                a.click();
              }}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition border border-slate-700"
            >
              <Download size={18}/> Export current {tab}
            </button>
            <button 
              onClick={tab === 'questions' ? handleSaveQuestions : handleSaveRoster}
              className="flex-[1.5] bg-gold hover:bg-yellow-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-gold/20"
            >
              Save {tab === 'questions' ? 'Bank' : 'Roster'} Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuizScreen: React.FC<{ 
  mode: TrainingModeConfig, 
  user: UserSession, 
  bank: Record<string, Question[]>,
  onComplete: (score: number, duration: string) => void,
  onExit: () => void 
}> = ({ mode, user, bank, onComplete, onExit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ isCorrect: boolean, selectedIndex?: number, textAnswer?: string }[]>([]);
  const [textInput, setTextInput] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const randomizedPool = useMemo(() => {
    let pool: Question[] = [];
    if (mode.id === 'trainee_to_dice5') pool = bank.beginner;
    else if (mode.id === 'dice5_to_dice6') pool = bank.intermediate;
    else if (mode.id === 'dice6_to_dice7') pool = bank.expert;
    else pool = [...bank.beginner, ...bank.intermediate, ...bank.expert];
    
    return shuffleArray(pool);
  }, [mode.id, bank]);

  const currentQuestion = randomizedPool[currentIdx];

  const handleSelect = (idx: number) => {
    if (showExplanation || !currentQuestion) return;
    const isCorrect = idx === currentQuestion.correctIndex;
    setAnswers(prev => [...prev, { isCorrect, selectedIndex: idx }]);
    setShowExplanation(true);
  };

  const handleTextSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (showExplanation || !textInput.trim() || !currentQuestion) return;
    const normalizedInput = textInput.toLowerCase().replace(/[\$,]/g, '').trim();
    const normalizedCorrect = (currentQuestion.correctAnswerText || '').toLowerCase().replace(/[\$,]/g, '').trim();
    const isCorrect = normalizedInput === normalizedCorrect;
    setAnswers(prev => [...prev, { isCorrect, textAnswer: textInput }]);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    setTextInput('');
    if (currentIdx + 1 < randomizedPool.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      const correctCount = answers.filter(a => a.isCorrect).length;
      const score = Math.round((correctCount / randomizedPool.length) * 100);
      const duration = formatDuration(Date.now() - startTimeRef.current);
      onComplete(score, duration);
    }
  };

  useEffect(() => {
    if (currentQuestion?.type === 'text-input' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIdx, currentQuestion]);

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Module Empty</h2>
          <p className="text-slate-400 mb-6">Ask a manager to update the question bank.</p>
          <button onClick={onExit} className="bg-gold text-black font-bold px-6 py-2 rounded-lg">Return to Menu</button>
        </div>
      </div>
    );
  }

  const progress = Math.round((currentIdx / randomizedPool.length) * 100);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col p-4 md:p-6 overflow-x-hidden">
      <header className="max-w-5xl mx-auto w-full flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h2 className="text-gold font-bold flex items-center gap-2">{mode.label}</h2>
          <span className="text-xs text-slate-500 uppercase tracking-widest">Question {currentIdx + 1} of {randomizedPool.length}</span>
        </div>
        <button onClick={onExit} className="text-slate-400 hover:text-white transition bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 text-sm font-bold">Exit Test</button>
      </header>
      
      <div className="max-w-5xl mx-auto w-full bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-slate-700/50 h-2 w-full">
          <div className="bg-gold h-full transition-all duration-300 shadow-[0_0_10px_rgba(212,175,55,0.5)]" style={{ width: `${progress}%` }}></div>
        </div>
        
        <div className="p-4 bg-black/30 border-b border-slate-700 relative group">
           <div className="max-w-3xl mx-auto opacity-95 transition-transform duration-500 group-hover:scale-[1.02] origin-top">
              <TableVisualizer 
                bets={currentQuestion.visuals?.bets || {}} 
                point={currentQuestion.visuals?.point} 
                dice={currentQuestion.visuals?.dice} 
                interactive={false}
                scenarioText={`Live Scenario: ${currentQuestion.scenario}`}
              />
           </div>
        </div>

        <div className="p-8 md:p-12 max-w-4xl mx-auto w-full">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-10 leading-snug">{currentQuestion.text}</h3>
          
          {currentQuestion.type === 'text-input' ? (
            <div className="max-w-lg">
              <form onSubmit={handleTextSubmit} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-500">$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    disabled={showExplanation}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter amount..."
                    className={`w-full bg-slate-900 border-2 rounded-2xl py-5 pl-10 pr-6 text-3xl font-bold outline-none transition-all ${
                      showExplanation 
                        ? (answers[currentIdx]?.isCorrect ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400')
                        : 'border-slate-700 text-white focus:border-gold shadow-inner'
                    }`}
                  />
                </div>
                {!showExplanation && (
                  <button type="submit" disabled={!textInput.trim()} className="w-full bg-gold hover:bg-yellow-500 text-black font-bold py-5 rounded-2xl text-xl shadow-lg transition active:scale-95 disabled:opacity-30">Check Payout</button>
                )}
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options?.map((opt, i) => {
                const isSelected = answers[currentIdx]?.selectedIndex === i;
                const isCorrect = currentQuestion.correctIndex === i;
                let style = "bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-400 hover:translate-y-[-2px]";
                if (showExplanation) {
                  if (isCorrect) style = "bg-green-600/20 border-green-500 text-green-200 shadow-[0_0_15px_rgba(34,197,94,0.15)]";
                  else if (isSelected) style = "bg-red-600/20 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
                  else style = "bg-slate-700/50 border-slate-700 text-slate-500 grayscale opacity-50";
                }
                return (
                  <button 
                    key={i} 
                    onClick={() => handleSelect(i)}
                    disabled={showExplanation}
                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex justify-between items-center group shadow-md ${style}`}
                  >
                    <span className="font-bold text-lg">{opt}</span>
                    {showExplanation && isCorrect && <CheckCircle className="text-green-500" size={24}/>}
                    {showExplanation && isSelected && !isCorrect && <XCircle className="text-red-500" size={24}/>}
                  </button>
                );
              })}
            </div>
          )}

          {showExplanation && (
            <div className="mt-10 p-8 bg-slate-900/60 border border-slate-700 rounded-3xl animate-in fade-in slide-in-from-bottom-6 duration-500 shadow-2xl backdrop-blur-md">
              <div className="flex items-start gap-6">
                <div className={`p-4 rounded-2xl shrink-0 ${answers[currentIdx]?.isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                   {answers[currentIdx]?.isCorrect ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
                </div>
                <div className="flex-1">
                  <h4 className={`text-2xl font-bold mb-2 ${answers[currentIdx]?.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {answers[currentIdx]?.isCorrect ? 'Professional Calculation!' : 'Incorrect Payout'}
                  </h4>
                  {currentQuestion.type === 'text-input' && !answers[currentIdx]?.isCorrect && (
                    <p className="text-white font-mono mb-2 text-lg">Correct Answer: <span className="text-gold font-bold">{currentQuestion.correctAnswerText}</span></p>
                  )}
                  <p className="text-slate-400 text-lg leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              </div>
              <button 
                onClick={handleNext}
                className="mt-8 w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-slate-200 transition flex items-center justify-center gap-3 text-xl shadow-xl group"
              >
                {currentIdx + 1 === randomizedPool.length ? 'Final Review' : 'Proceed to Next'} 
                <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
      <CreditFooter />
    </div>
  );
};

const LoginScreen: React.FC<{ 
  onLogin: (u: UserSession) => void, 
  onOpenAdmin: () => void,
  roster: Employee[] 
}> = ({ onLogin, onOpenAdmin, roster }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mapsId, setMapsId] = useState('');
  const [ship, setShip] = useState('');
  const [role, setRole] = useState<UserRole>('dealer');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!firstName.trim() || !lastName.trim() || !ship || !mapsId) {
      setError('Please complete all fields.');
      return;
    }

    if (roster.length > 0) {
      const found = roster.find(emp => 
        emp.mapsId === mapsId && 
        emp.firstName.toLowerCase() === firstName.trim().toLowerCase() &&
        emp.lastName.toLowerCase() === lastName.trim().toLowerCase()
      );
      
      if (!found) {
        setError('Employee credentials not found in roster. Contact your manager.');
        return;
      }
      onLogin({ 
        firstName: found.firstName, 
        lastName: found.lastName, 
        mapsId: found.mapsId, 
        ship, 
        role: found.role, 
        isLoggedIn: true 
      });
    } else {
      if (!/^\d{6,7}$/.test(mapsId)) {
        setError('MAPS ID must be 6-7 digits.');
        return;
      }
      onLogin({ firstName: firstName.trim(), lastName: lastName.trim(), mapsId, ship, role, isLoggedIn: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-black p-4 relative">
      <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
        
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-600/5 rounded-full blur-3xl"></div>

        <div className="absolute top-0 right-0 p-6">
           <button onClick={() => {
             const pw = prompt("Enter Management Password:");
             if (pw === "NCL-CAS-2025") onOpenAdmin();
             else if (pw !== null) alert("Access Denied.");
           }} className="text-slate-600 hover:text-gold transition-colors p-2"><Lock size={20}/></button>
        </div>

        <div className="flex flex-col items-center mb-8">
          <Anchor size={48} className="text-gold mb-4"/>
          <h1 className="text-4xl font-black text-white tracking-tight">Casino At Sea</h1>
          <p className="text-gold text-xs font-bold uppercase tracking-[0.3em] mt-1">NCL Training Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">First Name</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-gold transition-colors" placeholder="John" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Last Name</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-gold transition-colors" placeholder="Doe" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Employee ID (MAPS)</label>
            <input type="text" maxLength={7} value={mapsId} onChange={e => setMapsId(e.target.value.replace(/\D/g, ''))} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white font-mono outline-none focus:border-gold transition-colors" placeholder="0000000" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Assign Vessel</label>
            <select 
              value={ship} 
              onChange={e => setShip(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-gold transition-colors appearance-none"
            >
              <option value="" disabled>Select NCL Ship...</option>
              {NCL_SHIPS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {roster.length === 0 && (
            <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
              {(['dealer', 'manager'] as UserRole[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${role === r ? 'bg-gold text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {error && <div className="text-red-400 text-xs bg-red-400/10 p-4 rounded-xl border border-red-400/20 animate-pulse">{error}</div>}
          
          <button type="submit" className="w-full bg-gold hover:bg-yellow-500 text-black font-black py-4 rounded-xl transition transform active:scale-95 mt-4 shadow-xl shadow-gold/20 text-lg uppercase tracking-widest">
            Log In System
          </button>
        </form>
        <p className="text-[10px] text-slate-600 mt-8 text-center font-medium">Security Level 1 Active • Norwegian Cruise Line Holdings Ltd.</p>
      </div>
      <CreditFooter />
    </div>
  );
};

const MenuScreen: React.FC<{ 
  user: UserSession, 
  onSelectMode: (id: TrainingModeId) => void, 
  onLogout: () => void, 
  onOpenAdmin: () => void 
}> = ({ user, onSelectMode, onLogout, onOpenAdmin }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 relative">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-gold to-yellow-600 rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-xl transform -rotate-3">
              {user.firstName[0]}
            </div>
            <div>
              <h2 className="text-xl font-black flex items-center gap-2">{user.firstName} {user.lastName} {user.role === 'manager' && <ShieldCheck size={16} className="text-gold"/>}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-widest">
                <Anchor size={12}/> {user.ship}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user.role === 'manager' && (
               <button onClick={onOpenAdmin} className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-slate-300 hover:text-gold transition font-bold text-xs uppercase">
                 <ShieldCheck size={16}/> Admin
               </button>
            )}
            <button onClick={onLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition font-black text-xs uppercase tracking-tighter bg-slate-800/50 px-4 py-2 rounded-xl">
              <LogOut size={16}/> Exit
            </button>
          </div>
        </header>

        <div className="mb-12">
          <h1 className="text-5xl font-black mb-2 tracking-tight">Certification Center</h1>
          <p className="text-slate-400 text-lg font-medium">Verified training modules for {user.ship} crew members.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className="group text-left bg-slate-800/40 border border-slate-700 p-8 rounded-[2rem] hover:bg-slate-800 hover:border-gold/50 transition-all duration-500 shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-gold/10 transition-colors"></div>
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${mode.isTest ? 'bg-gold/10 text-gold' : 'bg-blue-500/10 text-blue-500 shadow-inner'}`}>
                   {mode.isTest ? <ShieldCheck size={28}/> : <PlayCircle size={28}/>}
                </div>
                {mode.isTest && <span className="text-[10px] font-black bg-gold text-black px-2 py-1 rounded uppercase tracking-[0.2em] shadow-lg">TEST</span>}
              </div>
              <h3 className="text-2xl font-black mb-2 group-hover:text-gold transition-colors">{mode.label}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">{mode.description}</p>
              <div className="flex items-center gap-2 text-gold text-sm font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                Launch Module <ChevronRight size={18}/>
              </div>
            </button>
          ))}
        </div>
      </div>
      <CreditFooter />
    </div>
  );
};

const SandboxScreen: React.FC<{ user: UserSession, onExit: () => void }> = ({ user, onExit }) => {
  const [point, setPoint] = useState<number | null>(null);
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [balance, setBalance] = useState(10000);
  const [bets, setBets] = useState<ActiveBets>({});
  const [message, setMessage] = useState('Place your bets and roll the dice!');
  const [history, setHistory] = useState<string[]>([]);
  const [selectedChip, setSelectedChip] = useState(5);
  const [tableMin, setTableMin] = useState(5);
  const [tableMax, setTableMax] = useState(1000);
  const [areBetsWorking, setAreBetsWorking] = useState(false);

  const log = (msg: string) => { setHistory(prev => [msg, ...prev].slice(0, 15)); setMessage(msg); };

  const handlePlaceBet = (type: BetType) => {
    if (balance < selectedChip) { log("Insufficient funds!"); return; }
    const currentBetAmount = bets[type] || 0;
    const newTotal = currentBetAmount + selectedChip;
    
    if (isStandardBet(type) && newTotal > tableMax) { 
      log(`Bet exceeds table maximum of $${tableMax}.`); 
      return; 
    }

    if (type === 'come' && point === null) { log("Come Bets only allowed when Point is ON."); return; }
    if (type === 'dontCome' && point === null) { log("Don't Come Bets only allowed when Point is ON."); return; }
    
    let extraCost = 0;
    if (type.startsWith('buy')) {
        const num = parseInt(type.replace('buy', ''));
        if ((num === 4 || num === 10) && newTotal < 20) {
            log(`Buy ${num} requires a minimum bet of $20.`);
            return;
        }
        extraCost = Math.max(1, Math.floor(newTotal * 0.05));
    } else if (type.startsWith('lay')) {
        const num = parseInt(type.replace('lay', ''));
        const winRatio = (num === 4 || num === 10) ? 0.5 : (num === 5 || num === 9) ? (2/3) : (5/6);
        const potentialWin = newTotal * winRatio;
        extraCost = Math.max(1, Math.floor(potentialWin * 0.05));
    }

    if (balance < (selectedChip + extraCost)) {
        log(`Need $${selectedChip + extraCost} for bet + commission.`);
        return;
    }

    setBalance(prev => prev - (selectedChip + extraCost));
    setBets(prev => ({ ...prev, [type]: newTotal }));
    if (extraCost > 0) log(`Placed $${selectedChip} ${type.slice(0,3)} on ${type.replace(/buy|lay/, '')}. Paid $${extraCost} vig.`);
  };

  const handleMoveBet = (from: BetType, to: BetType) => {
    if (isRolling) return;
    const amount = bets[from];
    if (!amount || amount <= 0) return;
    if (from === to) return;

    if (to === 'come' && point === null) { log("Cannot move to Come when Point is OFF."); return; }
    if (to === 'dontCome' && point === null) { log("Cannot move to Don't Come when Point is OFF."); return; }

    const newTotalTo = (bets[to] || 0) + amount;
    if (isStandardBet(to) && newTotalTo > tableMax) { log(`Table Max reached on target.`); return; }

    setBets(prev => {
      const next = { ...prev };
      delete next[from];
      next[to] = newTotalTo;
      return next;
    });
    log(`Moved $${amount} from ${from} to ${to}.`);
  };

  const handleClearBets = () => { if (isRolling) return; let refund = 0; Object.values(bets).forEach((v: any) => { if (typeof v === 'number') refund += v; }); setBalance(prev => prev + refund); setBets({}); log("Bets cleared."); };

  const rollDice = () => {
    if (isRolling) return;
    const passAmt = bets['pass'] || 0;
    const dontPassAmt = bets['dontPass'] || 0;
    if (point === null) {
      if (passAmt === 0 && dontPassAmt === 0) { log("Shooter requires a Pass or Don't Pass bet."); return; }
      if (passAmt > 0 && passAmt < tableMin) { log(`Pass Line bet must be at least $${tableMin}.`); return; }
    }
    
    setIsRolling(true);
    const d1 = Math.ceil(Math.random() * 6);
    const d2 = Math.ceil(Math.random() * 6);
    setDice([d1, d2]);
    setTimeout(() => { setIsRolling(false); resolveBets(d1, d2); }, 1200);
  };

  const resolveBets = (d1: number, d2: number) => {
    const total = d1 + d2;
    const isHard = d1 === d2;
    let winnings = 0;
    let nextBets = { ...bets };
    let rollLog = `Rolled ${total}${isHard ? ' (Hard)' : ''}. `;

    if (nextBets['field']) {
      if ([2, 3, 4, 9, 10, 11, 12].includes(total)) {
        let mult = total === 2 || total === 12 ? 3 : 2; 
        winnings += nextBets['field'] * mult;
        rollLog += "Field Win! ";
      }
      delete nextBets['field'];
    }

    if (point === null) {
      if (total === 7 || total === 11) {
        if (nextBets['pass']) winnings += nextBets['pass'] * 2;
        delete nextBets['pass'];
        if (nextBets['dontPass']) delete nextBets['dontPass'];
      } else if ([2, 3, 12].includes(total)) {
        if (nextBets['pass']) delete nextBets['pass'];
        if (nextBets['dontPass']) {
          if (total === 12) winnings += nextBets['dontPass'];
          else winnings += nextBets['dontPass'] * 2;
        }
        delete nextBets['dontPass'];
      } else {
        setPoint(total);
        rollLog += `Point is ${total}. `;
      }
    } else {
      if (total === point) {
        if (nextBets['pass']) winnings += nextBets['pass'] * 2;
        delete nextBets['pass']; delete nextBets['passOdds'];
        setPoint(null);
        rollLog += "Point Made! ";
      } else if (total === 7) {
        if (nextBets['dontPass']) winnings += nextBets['dontPass'] * 2;
        delete nextBets['dontPass'];
        setPoint(null);
        rollLog += "Seven Out. ";
      }
    }

    setBalance(prev => prev + Math.floor(winnings));
    setBets(nextBets);
    log(rollLog);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col relative">
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center shadow-lg">
        <h2 className="font-bold text-gold flex items-center gap-2 text-xl"><Dices size={24}/> {user.ship} Sandbox</h2>
        <div className="flex items-center gap-4">
          <div className="bg-black/40 px-4 py-2 rounded-xl text-green-400 font-mono flex items-center gap-2 shadow-inner border border-white/5 text-lg">
            <DollarSign size={18}/> {balance.toLocaleString()}
          </div>
          <button onClick={onExit} className="bg-slate-700 hover:bg-red-900/50 text-white px-6 py-2 rounded-xl transition-all font-bold border border-white/10 shadow-lg uppercase text-xs">Menu</button>
        </div>
      </div>
      <div className="flex-1 p-4 flex flex-col items-center overflow-y-auto">
        <TableVisualizer 
          bets={bets} 
          point={point} 
          dice={dice} 
          isRolling={isRolling} 
          interactive={!isRolling} 
          onPlaceBet={handlePlaceBet} 
          onMoveBet={handleMoveBet}
          scenarioText={message} 
        />
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pb-12">
           <div className="bg-slate-800/80 p-8 rounded-[2.5rem] border border-slate-700 shadow-2xl backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Select Denomination</span>
              <div className="flex justify-between items-center gap-2 mb-8 bg-black/20 p-4 rounded-2xl border border-white/5">
                {CHIP_VALUES.map(val => (
                  <button
                    key={val}
                    onClick={() => setSelectedChip(val)}
                    className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-bold text-sm transition-all active:scale-90 ${
                      selectedChip === val ? 'border-gold scale-110 shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'border-white/10'
                    }`}
                    style={{
                      backgroundColor: val >= 500 ? '#a855f7' : val >= 100 ? '#171717' : val >= 25 ? '#22c55e' : val >= 5 ? '#ef4444' : '#f8fafc',
                      color: val >= 5 ? '#fff' : '#0f172a'
                    }}
                  >
                    ${val}
                  </button>
                ))}
              </div>
              <button onClick={rollDice} disabled={isRolling} className="w-full bg-gold hover:bg-yellow-500 text-black font-black py-6 rounded-2xl flex items-center justify-center gap-4 text-3xl transition shadow-[0_0_30px_rgba(212,175,55,0.2)] active:scale-[0.98] disabled:opacity-50">
                <Dices size={32} className={isRolling ? 'animate-spin' : ''}/> {isRolling ? 'Rolling...' : 'ROLL DICE'}
              </button>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button onClick={handleClearBets} className="bg-red-900/20 hover:bg-red-900/40 text-red-400 py-4 rounded-2xl transition font-bold border border-red-800/20 text-xs uppercase">Clear Table</button>
                <button onClick={() => setAreBetsWorking(!areBetsWorking)} className={`py-4 rounded-2xl font-bold border transition-all text-xs uppercase ${areBetsWorking ? 'bg-green-600/20 text-green-400 border-green-500/40 shadow-lg' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                  {areBetsWorking ? 'Working ON' : 'Working OFF'}
                </button>
              </div>
           </div>
           
           <div className="bg-black/60 p-6 rounded-[2rem] border border-white/5 h-[400px] flex flex-col shadow-inner overflow-hidden">
             <div className="text-slate-600 text-[10px] mb-4 uppercase tracking-[0.2em] font-bold border-b border-white/5 pb-3 flex justify-between items-center">
                <span>Ship Table Logs</span>
                <RotateCcw size={12} className="cursor-pointer hover:text-white" onClick={() => setHistory([])}/>
             </div>
             <div className="flex-1 overflow-y-auto font-mono text-sm flex flex-col-reverse space-y-reverse space-y-2 scrollbar-thin scrollbar-thumb-slate-700 pr-2">
               {history.map((h, i) => (
                 <div key={i} className={`flex items-start gap-2 animate-in fade-in slide-in-from-left-2 duration-300 ${i === 0 ? 'text-gold font-bold' : 'text-slate-500'}`}>
                   <span className="opacity-40 text-[10px] mt-1 shrink-0">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                   <span>• {h}</span>
                 </div>
               ))}
               {history.length === 0 && <div className="text-slate-700 italic text-center mt-20 opacity-30">Waiting for shooter...</div>}
             </div>
           </div>
        </div>
      </div>
      <CreditFooter />
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [viewState, setViewState] = useState<ViewState>('login');
  const [selectedMode, setSelectedMode] = useState<TrainingModeConfig | null>(null);
  const [lastScore, setLastScore] = useState(0);
  const [lastDuration, setLastDuration] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  const [questionBank, setQuestionBank] = useState<Record<string, Question[]>>(() => {
    const saved = localStorage.getItem('cas_craps_bank');
    return saved ? JSON.parse(saved) : INITIAL_BANK;
  });

  const [roster, setRoster] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('cas_roster');
    return saved ? JSON.parse(saved) : [];
  });

  const handleUpdateBank = (newBank: Record<string, Question[]>) => {
    setQuestionBank(newBank);
    localStorage.setItem('cas_craps_bank', JSON.stringify(newBank));
  };

  const handleUpdateRoster = (newRoster: Employee[]) => {
    setRoster(newRoster);
    localStorage.setItem('cas_roster', JSON.stringify(newRoster));
  };

  const handleModeSelect = (modeId: TrainingModeId) => {
    const mode = MODES.find(m => m.id === modeId)!;
    setSelectedMode(mode);
    if (mode.id === 'simulation_all') setViewState('simulation');
    else setViewState('summary'); 
  };

  const handleQuizComplete = (score: number, duration: string) => {
    setLastScore(score);
    setLastDuration(duration);
    setViewState('certificate');
  };

  return (
    <>
      {viewState === 'login' && (
        <LoginScreen 
          onLogin={(u) => { setUser(u); setViewState('menu'); }} 
          onOpenAdmin={() => setIsAdminOpen(true)}
          roster={roster}
        />
      )}
      
      {viewState === 'menu' && user && (
        <MenuScreen 
          user={user} 
          onSelectMode={handleModeSelect} 
          onLogout={() => setViewState('login')} 
          onOpenAdmin={() => setIsAdminOpen(true)}
        />
      )}
      
      {viewState === 'simulation' && user && (
        <SandboxScreen user={user} onExit={() => setViewState('menu')} />
      )}
      
      {viewState === 'summary' && selectedMode && user && (
        <QuizScreen 
          mode={selectedMode} 
          user={user} 
          bank={questionBank}
          onComplete={handleQuizComplete} 
          onExit={() => setViewState('menu')} 
        />
      )}
      
      {viewState === 'certificate' && user && selectedMode && (
        <div className="min-h-screen bg-slate-900 p-8 flex flex-col items-center overflow-y-auto relative">
          <div className="w-full max-w-[1400px] flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center">
            {/* Summary Card */}
            <div className="w-full max-w-sm text-center bg-slate-800 p-8 rounded-[3rem] border border-slate-700 shadow-2xl no-print shrink-0">
               <Trophy size={80} className={`mx-auto mb-6 ${lastScore >= selectedMode.passMark ? 'text-gold' : 'text-slate-700 animate-pulse'}`}/>
               <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">{lastScore >= selectedMode.passMark ? 'PASSED!' : 'FAILED'}</h2>
               <p className="text-slate-400 mb-8 text-lg font-bold">EXAMINATION SCORE: <span className="text-white text-2xl ml-2">{lastScore}%</span> <br/> <span className="text-[10px] uppercase tracking-widest opacity-50">(Goal: {selectedMode.passMark}%)</span></p>
               
               {lastScore >= selectedMode.passMark && (
                  <button onClick={() => window.print()} className="w-full bg-gold hover:bg-yellow-500 text-black font-black py-5 rounded-2xl mb-4 shadow-xl shadow-gold/20 transition transform hover:scale-[1.02] uppercase tracking-widest text-sm">DOWNLOAD CERTIFICATE</button>
               )}
               
               <button onClick={() => setViewState('menu')} className="w-full bg-slate-700 text-white font-bold py-4 rounded-2xl hover:bg-slate-600 transition shadow-lg uppercase tracking-widest text-xs">Return to Main Menu</button>
            </div>
            
            {/* Certificate Preview */}
            <div className="flex-1 w-full max-w-full lg:max-w-none flex justify-center">
              <Certificate 
                data={{
                  id: Math.random().toString(36).substr(2, 9).toUpperCase(),
                  firstName: user.firstName,
                  lastName: user.lastName,
                  mapsId: user.mapsId,
                  ship: user.ship,
                  levelName: selectedMode.label,
                  score: lastScore,
                  dateCompleted: new Date().toLocaleDateString(),
                  timeCompleted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  duration: lastDuration
                }} 
                onClose={() => setViewState('menu')} 
                onPrint={() => window.print()} 
              />
            </div>
          </div>
          <CreditFooter />
        </div>
      )}

      <AdminCenter 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        bank={questionBank} 
        roster={roster}
        onUpdateBank={handleUpdateBank}
        onUpdateRoster={handleUpdateRoster}
      />
    </>
  );
};

export default App;
