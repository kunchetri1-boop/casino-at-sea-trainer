
import React from 'react';
import { CertificateData } from '../types';

interface CertificateProps {
  data: CertificateData;
  onClose: () => void;
  onPrint: () => void;
}

export const Certificate: React.FC<CertificateProps> = ({ data, onClose, onPrint }) => {
  const isPassed = data.score >= 80;

  return (
    <div className="w-full flex justify-center p-0">
      {/* Certificate Paper - Fixed size behavior for preview and high-quality print */}
      <div className="certificate-paper relative bg-white text-black p-10 md:p-20 border-[16px] border-double border-gold w-full max-w-[900px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col items-center text-center justify-between overflow-hidden">
        
        {/* Artistic Background Watermark */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none flex items-center justify-center">
           <svg viewBox="0 0 100 100" className="w-[85%] h-[85%]">
             <circle cx="50" cy="50" r="48" fill="none" stroke="black" strokeWidth="0.5" />
             <path d="M50 0 V100 M0 50 H100" stroke="black" strokeWidth="0.2" />
             <rect x="15" y="15" width="70" height="70" fill="none" stroke="black" strokeWidth="0.2" transform="rotate(45 50 50)" />
           </svg>
        </div>

        {/* Header Branding */}
        <div className="z-10 w-full mb-8">
          <h4 className="text-gold font-serif text-lg md:text-xl font-bold uppercase tracking-[0.4em] mb-2">Norwegian Cruise Line</h4>
          <div className="h-[2px] w-48 bg-gold mx-auto mb-4 opacity-50"></div>
          <h1 className="text-4xl md:text-6xl font-serif font-black text-slate-900 uppercase tracking-widest">Casino At Sea</h1>
        </div>

        {/* Main Content */}
        <div className="z-10 w-full flex flex-col items-center">
          <div className="mb-6">
            <h2 className="text-4xl md:text-5xl font-serif text-slate-800 font-bold mb-4 uppercase">Diploma of Professionalism</h2>
            <div className="h-1 w-64 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"></div>
          </div>
          
          {isPassed && (
            <div className="my-6 py-2 px-8 border-2 border-gold/30 rounded-full bg-gold/5">
              <p className="text-gold font-black text-3xl md:text-4xl uppercase tracking-[0.3em]">Congratulations!</p>
            </div>
          )}

          <p className="text-xl font-serif italic mb-2 text-slate-500">This certificate of merit is officially awarded to</p>

          <h3 className="text-5xl md:text-7xl font-bold border-b-2 border-slate-900 pb-4 px-12 inline-block mb-8 font-serif text-slate-900 leading-tight">
            {data.firstName} {data.lastName}
          </h3>
          
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-10 text-xs text-slate-500 font-bold uppercase tracking-widest border-y border-slate-100 py-6 w-full max-w-2xl">
            <div className="flex flex-col gap-1 items-start pl-12 border-l-4 border-gold/20">
              <span className="opacity-40">Employee ID</span>
              <span className="text-slate-900 text-sm font-black">{data.mapsId}</span>
            </div>
            <div className="flex flex-col gap-1 items-start pl-12 border-l-4 border-gold/20">
              <span className="opacity-40">Assigned Vessel</span>
              <span className="text-slate-900 text-sm font-black">{data.ship}</span>
            </div>
          </div>

          <p className="text-lg md:text-xl font-serif italic mb-4 text-slate-500">For the successful completion and passing of the professional training module</p>

          <h4 className="text-2xl md:text-4xl font-black text-slate-900 mb-12 bg-slate-50 px-10 py-5 rounded-3xl border border-slate-200 shadow-sm uppercase tracking-tight">
            {data.levelName}
          </h4>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-3 w-full px-4 md:px-12 gap-4 mb-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
            <div className="text-center">
              <p className="font-bold text-lg text-slate-900 mb-1">{data.dateCompleted}</p>
              <p className="text-[10px] uppercase text-slate-400 font-black tracking-widest">Completion Date</p>
              <p className="text-[9px] text-slate-400 font-mono mt-1">{data.timeCompleted}</p>
            </div>
            <div className="text-center border-x border-slate-200">
              <p className="font-bold text-lg text-slate-900 mb-1">{data.duration}</p>
              <p className="text-[10px] uppercase text-slate-400 font-black tracking-widest">Testing Time</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-3xl text-gold mb-1">{data.score}%</p>
              <p className="text-[10px] uppercase text-slate-400 font-black tracking-widest">Final Score</p>
            </div>
          </div>
        </div>

        {/* Footer Attestation */}
        <div className="w-full flex justify-between items-end text-[10px] text-slate-400 z-10 mt-6 pt-6 border-t border-slate-100">
          <div className="text-left flex flex-col gap-1">
            <p className="font-black text-slate-900 uppercase tracking-widest">Casino Operations Division</p>
            <p className="text-[9px]">Verified training document • CAS - Internal Records Only</p>
            <p className="font-mono text-[8px] opacity-40">Verification Hash: {data.id}</p>
          </div>
          <div className="text-right">
             <div className="mb-2 h-16 flex items-end justify-end">
                <div className="border-b-2 border-slate-900 w-56 text-center font-serif italic text-slate-400 pb-2">Electronic Validation Secured</div>
             </div>
             <p className="font-black text-slate-900 uppercase tracking-widest">Chief Gaming Training Officer</p>
          </div>
        </div>
      </div>
    </div>
  );
};
