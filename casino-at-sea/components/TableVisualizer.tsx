
import React, { useState, useRef, useEffect } from 'react';
import { BetType, ActiveBets } from '../types';

interface TableVisualizerProps {
  bets?: ActiveBets;
  point?: number | null;
  dice?: [number, number];
  isRolling?: boolean;
  onPlaceBet?: (type: BetType) => void;
  onMoveBet?: (from: BetType, to: BetType) => void;
  interactive?: boolean;
  scenarioText?: string;
}

const Puck = ({ isOn, boxNumber }: { isOn: boolean; boxNumber?: number }) => {
  let x = 45; 
  let y = 50;
  if (isOn && boxNumber) {
    const idxMap: Record<number, number> = { 4: 0, 5: 1, 6: 2, 8: 3, 9: 4, 10: 5 };
    const idx = idxMap[boxNumber];
    if (idx !== undefined) {
      x = 170 + (idx * 98) + 49;
      y = 50;
    }
  }
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r="18" fill={isOn ? "white" : "#111"} stroke={isOn ? "black" : "white"} strokeWidth="2" className="drop-shadow-lg" />
      <text dy="5" textAnchor="middle" fontSize="10" fontWeight="bold" fill={isOn ? "black" : "white"}>
        {isOn ? "ON" : "OFF"}
      </text>
    </g>
  );
};

const CasinoDie = ({ value }: { value: number }) => {
  const pips: Record<number, number[][]> = {
    1: [[50, 50]],
    2: [[20, 20], [80, 80]],
    3: [[20, 20], [50, 50], [80, 80]],
    4: [[20, 20], [80, 20], [20, 80], [80, 80]],
    5: [[20, 20], [80, 20], [50, 50], [20, 80], [80, 80]],
    6: [[20, 20], [20, 50], [20, 80], [80, 20], [80, 50], [80, 80]]
  };
  return (
    <div className="w-12 h-12 bg-red-600 rounded-lg shadow-xl border border-red-900 relative">
       <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-lg pointer-events-none" />
       {pips[value]?.map((p, i) => (
         <div 
           key={i}
           className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-sm"
           style={{ left: `${p[0]}%`, top: `${p[1]}%`, transform: 'translate(-50%, -50%)' }}
         />
       ))}
    </div>
  );
};

export const TableVisualizer: React.FC<TableVisualizerProps> = ({ 
  bets = {}, 
  point = null, 
  dice, 
  isRolling = false,
  onPlaceBet, 
  onMoveBet,
  interactive = false,
  scenarioText 
}) => {
  const [draggingFrom, setDraggingFrom] = useState<BetType | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const handleBetClick = (type: BetType) => {
    if (interactive && onPlaceBet && !draggingFrom) onPlaceBet(type);
  };

  const handleChipPointerDown = (e: React.PointerEvent, type: BetType) => {
    if (!interactive || isRolling || !bets[type]) return;
    e.stopPropagation();
    setDraggingFrom(type);
    updateMousePos(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingFrom) {
      updateMousePos(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent, targetType?: BetType) => {
    if (draggingFrom) {
      if (targetType && onMoveBet && draggingFrom !== targetType) {
        onMoveBet(draggingFrom, targetType);
      }
      setDraggingFrom(null);
    }
  };

  const updateMousePos = (e: React.PointerEvent) => {
    if (svgRef.current) {
      const pt = svgRef.current.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
      setMousePos({ x: svgP.x, y: svgP.y });
    }
  };

  const Chip = ({ amount, x, y, scale = 1, onPointerDown }: { amount: number, x: number, y: number, scale?: number, onPointerDown?: (e: React.PointerEvent) => void }) => {
    if (!amount || amount <= 0) return null;
    let fill = '#f8fafc'; let stroke = '#94a3b8'; let textColor = '#0f172a';
    if (amount >= 500) { fill = '#a855f7'; stroke = '#6b21a8'; textColor = '#fff'; }
    else if (amount >= 100) { fill = '#171717'; stroke = '#404040'; textColor = '#fff'; }
    else if (amount >= 25) { fill = '#22c55e'; stroke = '#15803d'; textColor = '#fff'; }
    else if (amount >= 5) { fill = '#ef4444'; stroke = '#b91c1c'; textColor = '#fff'; }
    return (
      <g 
        transform={`translate(${x}, ${y}) scale(${scale})`} 
        onPointerDown={onPointerDown} 
        style={{ cursor: onPointerDown ? 'grab' : 'default' }}
      >
        <circle r="15" fill={fill} stroke={stroke} strokeWidth="3" className="drop-shadow-md" />
        <circle r="11" fill="none" stroke={textColor} strokeDasharray="3 2" opacity="0.4" />
        <text y="4" textAnchor="middle" fill={textColor} fontSize="10" fontWeight="bold" className="select-none pointer-events-none">
          {amount}
        </text>
      </g>
    );
  };

  return (
    <div 
      className="w-full bg-feltDark rounded-xl border-[8px] border-amber-900 shadow-2xl relative overflow-hidden select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={(e) => handlePointerUp(e)}
    >
      <div className="absolute top-0 left-0 right-0 bg-black/40 text-goldLight text-center py-1 text-xs z-10 backdrop-blur-sm border-b border-white/10 flex justify-between px-4">
        <span>{scenarioText || "Interactive Table"}</span>
        {interactive && <span>Click to bet • Drag chips to move</span>}
      </div>
      <div className="mt-8 p-1">
        <svg 
          ref={svgRef}
          viewBox="0 0 1000 400" 
          className="w-full h-auto drop-shadow-lg"
          style={{ touchAction: 'none' }}
        >
          <defs>
            <pattern id="feltPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="#0f4d2a"/><circle cx="50" cy="50" r="1" fill="#ffffff" opacity="0.1"/>
            </pattern>
          </defs>
          <rect x="0" y="0" width="1000" height="400" rx="10" fill="url(#feltPattern)" stroke="#0a331c" strokeWidth="4" />
          
          {/* --- Don't Pass --- */}
          <g onClick={() => handleBetClick('dontPass')} onPointerUp={(e) => handlePointerUp(e, 'dontPass')} className="cursor-pointer hover:opacity-80 group">
             <rect x="70" y="20" width="40" height="250" fill="transparent" stroke="white" strokeWidth="2" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
             <text transform="translate(95, 145) rotate(-90)" textAnchor="middle" fontSize="16" fill="white" letterSpacing="1">Don't Pass Bar</text>
             <Chip amount={bets['dontPass']} x={90} y={200} onPointerDown={(e) => handleChipPointerDown(e, 'dontPass')} />
          </g>
          
          {/* --- Pass Line --- */}
          <g onClick={() => handleBetClick('pass')} onPointerUp={(e) => handlePointerUp(e, 'pass')} className="cursor-pointer hover:opacity-80 group">
            <rect x="20" y="20" width="50" height="360" fill="transparent" stroke="white" strokeWidth="2" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
            <text transform="translate(45, 200) rotate(-90)" textAnchor="middle" fontSize="24" fill="white" fontWeight="bold" letterSpacing="2">PASS LINE</text>
            <rect x="70" y="330" width="650" height="50" fill="transparent" stroke="white" strokeWidth="2" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
            <text x="400" y="362" textAnchor="middle" fontSize="30" fill="white" fontWeight="bold" letterSpacing="4">PASS LINE</text>
            <Chip amount={bets['pass']} x={400} y={355} onPointerDown={(e) => handleChipPointerDown(e, 'pass')} />
          </g>

          {point !== null && (
             <g onClick={() => handleBetClick('passOdds')} onPointerUp={(e) => handlePointerUp(e, 'passOdds')} className="cursor-pointer hover:opacity-80">
                <rect x="350" y="382" width="100" height="18" rx="5" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="1" strokeDasharray="4 2" />
                <text x="400" y="395" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">PLACE ODDS</text>
                <Chip amount={bets['passOdds']} x={380} y={365} scale={0.9} onPointerDown={(e) => handleChipPointerDown(e, 'passOdds')} />
             </g>
          )}

          {/* --- Don't Come Bar --- */}
          <g onClick={() => handleBetClick('dontCome')} onPointerUp={(e) => handlePointerUp(e, 'dontCome')} className="cursor-pointer hover:opacity-80 group"> 
             <rect x="110" y="20" width="60" height="80" fill="transparent" stroke="white" strokeWidth="2" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
             <text x="140" y="45" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">DON'T</text>
             <text x="140" y="57" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">COME</text>
             <text x="140" y="69" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">BAR 12</text>
             <Chip amount={bets['dontCome']} x={140} y={60} onPointerDown={(e) => handleChipPointerDown(e, 'dontCome')} />
          </g>

          {/* --- Big 6 & Big 8 --- */}
          <g className="cursor-pointer group">
             <path d="M 70 270 H 150 L 130 330 H 70 Z" fill="transparent" stroke="white" strokeWidth="2" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
             <g onClick={() => handleBetClick('big6')} onPointerUp={(e) => handlePointerUp(e, 'big6')} className="cursor-pointer">
                <text x="95" y="305" textAnchor="middle" fontSize="32" fill="#ef4444" fontWeight="900" stroke="white" strokeWidth="0.5">6</text>
                <Chip amount={bets['big6']} x={95} y={305} scale={0.7} onPointerDown={(e) => handleChipPointerDown(e, 'big6')} />
             </g>
             <g onClick={() => handleBetClick('big8')} onPointerUp={(e) => handlePointerUp(e, 'big8')} className="cursor-pointer">
                <text x="125" y="315" textAnchor="middle" fontSize="32" fill="#ef4444" fontWeight="900" stroke="white" strokeWidth="0.5">8</text>
                <Chip amount={bets['big8']} x={125} y={315} scale={0.7} onPointerDown={(e) => handleChipPointerDown(e, 'big8')} />
             </g>
             <text x="80" y="325" fontSize="8" fill="white" fontWeight="bold" transform="rotate(-45 80 325)">BIG</text>
          </g>

          {/* --- Box Numbers --- */}
          {[4, 5, 6, 8, 9, 10].map((num, idx) => {
            const xStart = 170 + (idx * 98); const w = 98; const h = 100; const isPoint = point === num;
            const placeKey = `place${num}` as BetType;
            const buyKey = `buy${num}` as BetType;
            const layKey = `lay${num}` as BetType;
            return (
              <g key={num}>
                <g onClick={() => handleBetClick(placeKey)} onPointerUp={(e) => handlePointerUp(e, placeKey)} className="cursor-pointer hover:opacity-80 group">
                    <rect x={xStart} y={20} width={w} height={h} fill="transparent" stroke="white" strokeWidth="2" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
                    <text x={xStart + w/2} y={80} textAnchor="middle" fontSize="50" fill="#facc15" fontWeight="bold" opacity={isPoint ? 1 : 0.9}>{num}</text>
                    <Chip amount={bets[placeKey]} x={xStart + w/2} y={90} onPointerDown={(e) => handleChipPointerDown(e, placeKey)} />
                </g>
                
                {/* Buy Bet Strip */}
                <g onClick={() => handleBetClick(buyKey)} onPointerUp={(e) => handlePointerUp(e, buyKey)} className="cursor-pointer group">
                  <rect x={xStart} y={20} width={w/2} height={20} fill="none" stroke="white" strokeWidth="0.5" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
                  <text x={xStart + w/4} y={35} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">BUY</text>
                  <Chip amount={bets[buyKey]} x={xStart + w/4} y={30} scale={0.6} onPointerDown={(e) => handleChipPointerDown(e, buyKey)} />
                </g>

                {/* Lay Bet Strip */}
                <g onClick={() => handleBetClick(layKey)} onPointerUp={(e) => handlePointerUp(e, layKey)} className="cursor-pointer group">
                  <rect x={xStart + w/2} y={20} width={w/2} height={20} fill="none" stroke="white" strokeWidth="0.5" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
                  <text x={xStart + (w*3)/4} y={35} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">LAY</text>
                  <Chip amount={bets[layKey]} x={xStart + (w*3)/4} y={30} scale={0.6} onPointerDown={(e) => handleChipPointerDown(e, layKey)} />
                </g>
              </g>
            )
          })}

          {/* --- Come Area --- */}
          <g onClick={() => handleBetClick('come')} onPointerUp={(e) => handlePointerUp(e, 'come')} className="cursor-pointer hover:opacity-80 group">
            <rect x="110" y="120" width="648" height="80" fill="transparent" stroke="white" strokeWidth="2" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
            <text x="434" y="175" textAnchor="middle" fontSize="50" fill="#ef4444" fontWeight="bold" letterSpacing="6" stroke="white" strokeWidth="0.5">COME</text>
            <Chip amount={bets['come']} x={434} y={160} onPointerDown={(e) => handleChipPointerDown(e, 'come')} />
          </g>

          {/* --- Field Area - Restored Numbers --- */}
          <g onClick={() => handleBetClick('field')} onPointerUp={(e) => handlePointerUp(e, 'field')} className="cursor-pointer hover:opacity-80 group">
            <path d="M 110 200 H 758 L 720 280 H 150 L 110 200" fill="transparent" stroke="white" strokeWidth="2" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
            <text x="434" y="235" textAnchor="middle" fontSize="36" fill="#eab308" fontWeight="bold" letterSpacing="4" stroke="black" strokeWidth="0.5" opacity="0.3">FIELD</text>
            <g fill="#eab308" fontSize="20" fontWeight="bold" textAnchor="middle">
               <g transform="translate(183, 250)"><circle r="22" fill="none" stroke="#eab308" strokeWidth="1.5" /><text y="6" fontSize="24">2</text><text y="-26" fontSize="8" fill="white">PAYS DOUBLE</text></g>
               <text x="240" y="258">3</text><text x="290" y="258">4</text><text x="530" y="258">9</text><text x="580" y="258">10</text><text x="630" y="258">11</text>
               <g transform="translate(685, 250)"><circle r="22" fill="none" stroke="#eab308" strokeWidth="1.5" /><text y="6" fontSize="24">12</text><text y="-26" fontSize="8" fill="white">PAYS DOUBLE</text></g>
            </g>
            <Chip amount={bets['field']} x={434} y={265} onPointerDown={(e) => handleChipPointerDown(e, 'field')} />
          </g>

          {/* --- Don't Pass Bar Bar --- */}
          <g onClick={() => handleBetClick('dontPass')} onPointerUp={(e) => handlePointerUp(e, 'dontPass')} className="cursor-pointer hover:opacity-80 group">
            <rect x="160" y="280" width="560" height="40" fill="transparent" stroke="white" strokeWidth="2" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
            <text x="440" y="307" textAnchor="middle" fontSize="16" fill="white" fontWeight="bold" letterSpacing="2">DON'T PASS BAR 12</text>
          </g>

          {/* --- C & E --- */}
          <g transform="translate(765, 140)">
             <line x1="0" y1="-5" x2="0" y2="145" stroke="white" strokeWidth="2" /><line x1="60" y1="-5" x2="60" y2="145" stroke="white" strokeWidth="2" />
             {[0, 1, 2, 3].map(i => {
               const yPos = i * 38 + 18;
               return (
                <React.Fragment key={i}>
                   <g onClick={() => handleBetClick('c')} onPointerUp={(e) => handlePointerUp(e, 'c')} className="cursor-pointer hover:opacity-80 group">
                     <circle cx="16" cy={yPos} r="12" fill="transparent" stroke="#facc15" strokeWidth="1.5" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
                     <text x="16" y={yPos + 4} textAnchor="middle" fontSize="12" fill="#facc15" fontWeight="bold">C</text>
                     {i === 0 && <Chip amount={bets['c']} x={16} y={yPos} scale={0.7} onPointerDown={(e) => handleChipPointerDown(e, 'c')} />}
                   </g>
                   <g onClick={() => handleBetClick('e')} onPointerUp={(e) => handlePointerUp(e, 'e')} className="cursor-pointer hover:opacity-80 group">
                     <circle cx="44" cy={yPos} r="12" fill="transparent" stroke="#facc15" strokeWidth="1.5" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
                     <text x="44" y={yPos + 4} textAnchor="middle" fontSize="12" fill="#facc15" fontWeight="bold">E</text>
                     {i === 0 && <Chip amount={bets['e']} x={44} y={yPos} scale={0.7} onPointerDown={(e) => handleChipPointerDown(e, 'e')} />}
                   </g>
                </React.Fragment>
               )
             })}
          </g>

          {/* --- Proposition Box --- */}
          <g transform="translate(835, 20)">
            <rect x="0" y="0" width="155" height="360" fill="none" stroke="white" strokeWidth="3" rx="5" />
            
            {/* Hardways */}
            <g transform="translate(0, 0)">
               <rect x="0" y="0" width="155" height="25" fill="none" stroke="white" strokeWidth="1" />
               <text x="77" y="18" textAnchor="middle" fontSize="12" fill="white">HARDWAYS</text>
               
               {/* Hard 4 */}
               <g onClick={() => handleBetClick('hard4')} onPointerUp={(e) => handlePointerUp(e, 'hard4')} className="cursor-pointer group">
                  <rect x="0" y="25" width="77.5" height="60" fill="transparent" stroke="white" strokeWidth="1" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
                  <g transform="translate(19, 35) scale(0.5)">
                    <rect width="30" height="30" rx="4" fill="#ef4444" />
                    <circle cx="8" cy="8" r="3" fill="white"/> <circle cx="22" cy="22" r="3" fill="white"/>
                    <rect x="40" width="30" height="30" rx="4" fill="#ef4444" />
                    <circle cx="48" cy="8" r="3" fill="white"/> <circle cx="62" cy="22" r="3" fill="white"/>
                  </g>
                  <text x="38" y="80" textAnchor="middle" fontSize="9" fill="white">7 to 1</text>
                  <Chip amount={bets['hard4']} x={38} y={55} scale={0.8} onPointerDown={(e) => handleChipPointerDown(e, 'hard4')} />
               </g>

               {/* Hard 10 */}
               <g onClick={() => handleBetClick('hard10')} onPointerUp={(e) => handlePointerUp(e, 'hard10')} className="cursor-pointer group">
                  <rect x="77.5" y="25" width="77.5" height="60" fill="transparent" stroke="white" strokeWidth="1" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
                  <g transform="translate(96, 35) scale(0.5)">
                    <rect width="30" height="30" rx="4" fill="#ef4444" /><circle cx="8" cy="8" r="3" fill="white"/> <circle cx="22" cy="22" r="3" fill="white"/> <circle cx="15" cy="15" r="3" fill="white"/> <circle cx="22" cy="8" r="3" fill="white"/> <circle cx="8" cy="22" r="3" fill="white"/>
                    <rect x="40" width="30" height="30" rx="4" fill="#ef4444" /><circle cx="48" cy="8" r="3" fill="white"/> <circle cx="62" cy="22" r="3" fill="white"/> <circle cx="55" cy="15" r="3" fill="white"/> <circle cx="62" cy="8" r="3" fill="white"/> <circle cx="48" cy="22" r="3" fill="white"/>
                  </g>
                  <text x="116" y="80" textAnchor="middle" fontSize="9" fill="white">7 to 1</text>
                  <Chip amount={bets['hard10']} x={116} y={55} scale={0.8} onPointerDown={(e) => handleChipPointerDown(e, 'hard10')} />
               </g>

               {/* Hard 6 */}
               <g onClick={() => handleBetClick('hard6')} onPointerUp={(e) => handlePointerUp(e, 'hard6')} className="cursor-pointer group">
                  <rect x="0" y="85" width="77.5" height="60" fill="transparent" stroke="white" strokeWidth="1" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
                  <g transform="translate(19, 95) scale(0.5)">
                    <rect width="30" height="30" rx="4" fill="#ef4444" /><circle cx="8" cy="8" r="3" fill="white"/><circle cx="22" cy="22" r="3" fill="white"/><circle cx="15" cy="15" r="3" fill="white"/>
                    <rect x="40" width="30" height="30" rx="4" fill="#ef4444" /><circle cx="48" cy="8" r="3" fill="white"/><circle cx="62" cy="22" r="3" fill="white"/><circle cx="55" cy="15" r="3" fill="white"/>
                  </g>
                  <text x="38" y="140" textAnchor="middle" fontSize="9" fill="white">9 to 1</text>
                  <Chip amount={bets['hard6']} x={38} y={115} scale={0.8} onPointerDown={(e) => handleChipPointerDown(e, 'hard6')} />
               </g>

               {/* Hard 8 */}
               <g onClick={() => handleBetClick('hard8')} onPointerUp={(e) => handlePointerUp(e, 'hard8')} className="cursor-pointer group">
                  <rect x="77.5" y="85" width="77.5" height="60" fill="transparent" stroke="white" strokeWidth="1" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
                  <g transform="translate(96, 95) scale(0.5)">
                    <rect width="30" height="30" rx="4" fill="#ef4444" /><circle cx="8" cy="8" r="3" fill="white"/><circle cx="22" cy="22" r="3" fill="white"/><circle cx="8" cy="22" r="3" fill="white"/><circle cx="22" cy="8" r="3" fill="white"/>
                    <rect x="40" width="30" height="30" rx="4" fill="#ef4444" /><circle cx="48" cy="8" r="3" fill="white"/><circle cx="62" cy="22" r="3" fill="white"/><circle cx="48" cy="22" r="3" fill="white"/><circle cx="62" cy="8" r="3" fill="white"/>
                  </g>
                  <text x="116" y="140" textAnchor="middle" fontSize="9" fill="white">9 to 1</text>
                  <Chip amount={bets['hard8']} x={116} y={115} scale={0.8} onPointerDown={(e) => handleChipPointerDown(e, 'hard8')} />
               </g>
            </g>

            {/* One Roll Proposition Bets */}
            <g transform="translate(0, 145)">
               <rect x="0" y="0" width="155" height="25" fill="none" stroke="white" strokeWidth="1" />
               <text x="77" y="18" textAnchor="middle" fontSize="12" fill="white">ONE ROLL</text>
               
               {/* Any Seven */}
               <g onClick={() => handleBetClick('anySeven')} onPointerUp={(e) => handlePointerUp(e, 'anySeven')} className="cursor-pointer group">
                 <rect x="0" y="25" width="155" height="35" fill="transparent" stroke="white" strokeWidth="1" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
                 <text x="77" y="48" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">ANY SEVEN</text>
                 <Chip amount={bets['anySeven']} x={77} y={42} scale={0.8} onPointerDown={(e) => handleChipPointerDown(e, 'anySeven')} />
               </g>

               {/* Ace-Deuce (3) */}
               <g onClick={() => handleBetClick('aceDeuce')} onPointerUp={(e) => handlePointerUp(e, 'aceDeuce')} className="cursor-pointer group">
                  <rect x="0" y="60" width="50" height="60" fill="transparent" stroke="white" strokeWidth="1" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
                  <g transform="translate(4, 65) scale(0.6)">
                    <rect width="30" height="30" rx="4" fill="#ef4444" /><circle cx="15" cy="15" r="3" fill="white"/>
                    <rect x="35" width="30" height="30" rx="4" fill="#ef4444" /><circle cx="43" cy="8" r="3" fill="white" /><circle cx="57" cy="22" r="3" fill="white"/>
                  </g>
                  <text x="25" y="115" textAnchor="middle" fontSize="9" fill="white">15 to 1</text>
                  <Chip amount={bets['aceDeuce']} x={25} y={90} scale={0.7} onPointerDown={(e) => handleChipPointerDown(e, 'aceDeuce')} />
               </g>

               {/* Yo (11) */}
               <g onClick={() => handleBetClick('yo11')} onPointerUp={(e) => handlePointerUp(e, 'yo11')} className="cursor-pointer group">
                  <rect x="105" y="60" width="50" height="60" fill="transparent" stroke="white" strokeWidth="1" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
                  <g transform="translate(109, 65) scale(0.6)">
                    <rect width="30" height="30" rx="4" fill="#ef4444" /><circle cx="8" cy="8" r="3" fill="white" /><circle cx="22" cy="22" r="3" fill="white" /><circle cx="15" cy="15" r="3" fill="white" /><circle cx="22" cy="8" r="3" fill="white" /><circle cx="8" cy="22" r="3" fill="white"/>
                    <rect x="35" width="30" height="30" rx="4" fill="#ef4444" /><circle cx="43" cy="8" r="3" fill="white" /><circle cx="57" cy="22" r="3" fill="white" /><circle cx="50" cy="15" r="3" fill="white" /><circle cx="50" cy="8" r="3" fill="white" /><circle cx="50" cy="22" r="3" fill="white" /><circle cx="43" cy="15" r="3" fill="white" /><circle cx="57" cy="15" r="3" fill="white"/>
                  </g>
                  <text x="130" y="115" textAnchor="middle" fontSize="9" fill="white">15 to 1</text>
                  <Chip amount={bets['yo11']} x={130} y={90} scale={0.7} onPointerDown={(e) => handleChipPointerDown(e, 'yo11')} />
               </g>
               
               {/* HORN Text Zone */}
               <g onClick={() => handleBetClick('horn')} onPointerUp={(e) => handlePointerUp(e, 'horn')} className="cursor-pointer hover:fill-white/10 group">
                  <rect x="50" y="60" width="55" height="120" fill="transparent" stroke="white" strokeWidth="1" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
                  <text x="77" y="125" textAnchor="middle" fontSize="16" fill="white" fontWeight="bold">HORN</text>
                  <Chip amount={bets['horn']} x={77} y={120} scale={0.9} onPointerDown={(e) => handleChipPointerDown(e, 'horn')} />
               </g>

               {/* Aces (2) */}
               <g onClick={() => handleBetClick('aces')} onPointerUp={(e) => handlePointerUp(e, 'aces')} className="cursor-pointer group">
                  <rect x="0" y="120" width="50" height="60" fill="transparent" stroke="white" strokeWidth="1" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
                  <g transform="translate(4, 125) scale(0.6)">
                    <rect width="30" height="30" rx="4" fill="#ef4444" /><circle cx="15" cy="15" r="3" fill="white"/>
                    <rect x="35" width="30" height="30" rx="4" fill="#ef4444" /><circle cx="50" cy="15" r="3" fill="white"/>
                  </g>
                  <text x="25" y="175" textAnchor="middle" fontSize="9" fill="white">30 to 1</text>
                  <Chip amount={bets['aces']} x={25} y={150} scale={0.7} onPointerDown={(e) => handleChipPointerDown(e, 'aces')} />
               </g>

               {/* Midnight (12) */}
               <g onClick={() => handleBetClick('twelve')} onPointerUp={(e) => handlePointerUp(e, 'twelve')} className="cursor-pointer group">
                  <rect x="105" y="120" width="50" height="60" fill="transparent" stroke="white" strokeWidth="1" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
                  <g transform="translate(109, 125) scale(0.6)">
                    <rect width="30" height="30" rx="4" fill="#ef4444" /><circle cx="8" cy="8" r="3" fill="white"/><circle cx="22" cy="8" r="3" fill="white"/><circle cx="22" cy="22" r="3" fill="white"/><circle cx="8" cy="22" r="3" fill="white"/><circle cx="8" cy="15" r="3" fill="white"/><circle cx="22" cy="15" r="3" fill="white"/>
                    <rect x="35" width="30" height="30" rx="4" fill="#ef4444" /><circle cx="43" cy="8" r="3" fill="white"/><circle cx="57" cy="8" r="3" fill="white"/><circle cx="57" cy="22" r="3" fill="white"/><circle cx="43" cy="22" r="3" fill="white"/><circle cx="43" cy="15" r="3" fill="white"/><circle cx="57" cy="15" r="3" fill="white"/>
                  </g>
                  <text x="130" y="175" textAnchor="middle" fontSize="9" fill="white">30 to 1</text>
                  <Chip amount={bets['twelve']} x={130} y={150} scale={0.7} onPointerDown={(e) => handleChipPointerDown(e, 'twelve')} />
               </g>
               
               {/* Any Craps */}
               <g onClick={() => handleBetClick('anyCraps')} onPointerUp={(e) => handlePointerUp(e, 'anyCraps')} className="cursor-pointer group">
                 <rect x="0" y="180" width="155" height="35" fill="transparent" stroke="white" strokeWidth="1" className={draggingFrom ? "group-hover:fill-white/10" : ""} />
                 <text x="77" y="203" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">ANY CRAPS</text>
                 <Chip amount={bets['anyCraps']} x={77} y={197} scale={0.8} onPointerDown={(e) => handleChipPointerDown(e, 'anyCraps')} />
               </g>
            </g>
          </g>

          <Puck isOn={point !== null} boxNumber={point || undefined} />

          {/* Floating Ghost Chip while dragging */}
          {draggingFrom && (
            <g style={{ pointerEvents: 'none' }}>
              <Chip 
                amount={bets[draggingFrom]} 
                x={mousePos.x} 
                y={mousePos.y} 
                scale={1.2} 
              />
            </g>
          )}

        </svg>
      </div>
      {dice && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
             <div className={`absolute transition-all duration-1000 ease-out ${isRolling ? 'animate-roll-1' : ''}`} style={{ top: '40%', left: '35%' }}><CasinoDie value={dice[0]} /></div>
             <div className={`absolute transition-all duration-1000 ease-out ${isRolling ? 'animate-roll-2' : ''}`} style={{ top: '48%', left: '45%' }}><CasinoDie value={dice[1]} /></div>
        </div>
      )}
      <style>{`
        @keyframes roll-1 {
           0% { transform: translate(400px, 400px) rotate(0deg) scale(1.5); opacity: 0; }
           100% { transform: translate(0, 0) rotate(1440deg) scale(1); }
        }
        @keyframes roll-2 {
           0% { transform: translate(350px, 450px) rotate(0deg) scale(1.5); opacity: 0; }
           100% { transform: translate(0, 0) rotate(-1440deg) scale(1); }
        }
        .animate-roll-1 { animation: roll-1 0.8s ease-out forwards; }
        .animate-roll-2 { animation: roll-2 1.0s ease-out forwards; }
      `}</style>
    </div>
  );
};
