
import { TrainingModeConfig, Question } from './types';

export const NCL_SHIPS = [
  "Norwegian Encore",
  "Norwegian Bliss",
  "Norwegian Joy",
  "Norwegian Escape",
  "Norwegian Getaway",
  "Norwegian Breakaway",
  "Norwegian Epic",
  "Norwegian Jade",
  "Norwegian Gem",
  "Norwegian Pearl",
  "Norwegian Jewel",
  "Norwegian Pride of America",
  "Norwegian Star",
  "Norwegian Dawn",
  "Norwegian Sun",
  "Norwegian Sky",
  "Norwegian Spirit",
  "Norwegian Prima",
  "Norwegian Viva"
].sort();

export const MODES: TrainingModeConfig[] = [
  {
    id: 'simulation_all',
    label: 'Game Simulation (All Levels)',
    description: 'Practice with a mix of questions. No certificate.',
    passMark: 0,
    isTest: false,
  },
  {
    id: 'trainee_to_dice5',
    label: 'Trainee to Dice 5 (Beginner)',
    description: 'Test: Fundamentals, Pass Line, Come Out rolls.',
    passMark: 80,
    isTest: true,
  },
  {
    id: 'dice5_to_dice6',
    label: 'Dice 5 to Dice 6 (Intermediate)',
    description: 'Test: Odds, Come Bets, Lay Odds logic.',
    passMark: 80,
    isTest: true,
  },
  {
    id: 'dice6_to_dice7',
    label: 'Dice 6 to Dice 7 (Expert)',
    description: 'Test: Advanced payouts, units Across/Inside/Outside, and prop max limits.',
    passMark: 80,
    isTest: true,
  },
];

const generateBeginnerBank = (): Question[] => {
  const q: Question[] = [
    { id: 'b1', type: 'multiple-choice', difficulty: 'beginner', scenario: 'Dice Basics', text: 'What is the sum of opposite sides of a standard die?', options: ['5', '6', '7', '8'], correctIndex: 2, explanation: 'On a standard die, 1 is opposite 6, 2 is opposite 5, and 3 is opposite 4. All pairs sum to 7.' },
    { id: 'b2', type: 'multiple-choice', difficulty: 'beginner', scenario: 'Table Layout', text: 'Which number in the Field typically pays 3 to 1 or double?', options: ['5', '9', '12', '10'], correctIndex: 2, explanation: 'The numbers 2 and 12 in the Field are bonus payouts, usually paying double (2:1) or triple (3:1).' },
    { id: 'b3', type: 'multiple-choice', difficulty: 'beginner', scenario: 'Come Out Roll', text: 'On the Come Out roll, which numbers result in an immediate win for the Pass Line?', options: ['2, 3', '7, 11', '12', '4, 10'], correctIndex: 1, explanation: '7 and 11 are "naturals" and win immediately on the Come Out roll.' },
    { id: 'b4', type: 'multiple-choice', difficulty: 'beginner', scenario: 'Come Out Roll', text: 'On the Come Out roll, which numbers result in an immediate loss for the Pass Line?', options: ['7, 11', '5, 9', '2, 3, 12', '6, 8'], correctIndex: 2, explanation: '2, 3, and 12 are "craps" numbers and the Pass Line loses immediately.' },
    { id: 'b5', type: 'multiple-choice', difficulty: 'beginner', scenario: 'Pass Line Payout', text: 'What is the standard payout for a winning Pass Line bet?', options: ['2 to 1', '1 to 1 (Even Money)', '3 to 2', '7 to 6'], correctIndex: 1, explanation: 'Pass Line bets always pay even money (1 to 1).' },
  ];

  const combinations = [
    { d: [1,1] as [number, number], name: 'Aces (Snake Eyes)' },
    { d: [6,6] as [number, number], name: 'Twelve (Boxcars)' },
    { d: [1,2] as [number, number], name: 'Ace-Deuce' },
    { d: [5,6] as [number, number], name: 'Yo-Eleven' },
    { d: [4,3] as [number, number], name: 'Seven' },
  ];

  combinations.forEach((c, i) => {
    q.push({
      id: `b_gen_c_${i}`, type: 'multiple-choice', difficulty: 'beginner', scenario: 'Dice Identification',
      text: `A shooter rolls a ${c.d[0]} and a ${c.d[1]}. What is this roll commonly called?`,
      options: shuffleArray([c.name, 'Seven Out', 'The Point', 'Hardway']),
      correctIndex: 0, 
      explanation: `A ${c.d[0]} and ${c.d[1]} sums to ${c.d[0]+c.d[1]}, which is ${c.name}.`,
      visuals: { dice: c.d }
    });
  });
  
  q.forEach(quest => {
    if (quest.id.startsWith('b_gen_c_')) {
      const correctName = combinations[parseInt(quest.id.split('_')[3])].name;
      quest.correctIndex = quest.options?.indexOf(correctName);
    }
  });

  const totals = [4, 5, 6, 8, 9, 10];
  totals.forEach((t, i) => {
    q.push({
      id: `b_gen_t_${i}`, type: 'multiple-choice', difficulty: 'beginner', scenario: 'Point Establishment',
      text: `On a Come Out roll, the shooter rolls a ${t}. What happens to the Puck?`,
      options: ['Stays OFF', `Moves to ${t} and turns ON`, 'Dealer takes the bets', 'Shooter rolls again'],
      correctIndex: 1,
      explanation: `When a ${t} is rolled on the Come Out, it becomes the Point. The Puck moves to the ${t} box and is flipped to ON.`,
      visuals: { dice: [t/2, t/2] as [number, number] }
    });
  });

  while (q.length < 25) {
    const val = [5, 10, 25, 100][Math.floor(Math.random()*4)];
    q.push({
      id: `b_gen_f_${q.length}`, type: 'text-input', difficulty: 'beginner', scenario: 'Field Payout',
      text: `A player has $${val} on the Field and the shooter rolls a 3. How much do you pay?`,
      correctAnswerText: val.toString(),
      explanation: `The Field pays even money for numbers 3, 4, 9, 10, and 11. $${val} pays $${val}.`,
      visuals: { dice: [1, 2], bets: { field: val } }
    });
  }

  return q;
};

const generateIntermediateBank = (): Question[] => {
  const q: Question[] = [];
  
  const sixEightUnits = [6, 12, 18, 30, 60, 120];
  sixEightUnits.forEach((u, i) => {
    const pays = (u / 6) * 7;
    q.push({
      id: `i_p_68_${i}`, type: 'text-input', difficulty: 'intermediate', scenario: 'Place Payouts',
      text: `A player has $${u} Place Bet on the 8. The shooter rolls an 8. How much is the payout?`,
      correctAnswerText: pays.toString(),
      explanation: `Place 6 and 8 pay 7 to 6. $${u} is ${u/6} units of $6. ${u/6} * $7 = $${pays}.`,
      visuals: { point: 5, bets: { place8: u }, dice: [4, 4] }
    });
  });

  const fiveNineUnits = [5, 10, 15, 25, 50, 100];
  fiveNineUnits.forEach((u, i) => {
    const pays = (u / 5) * 7;
    q.push({
      id: `i_p_59_${i}`, type: 'text-input', difficulty: 'intermediate', scenario: 'Place Payouts',
      text: `A player has $${u} Place Bet on the 5. The shooter rolls a 5. How much is the payout?`,
      correctAnswerText: pays.toString(),
      explanation: `Place 5 and 9 pay 7 to 5. $${u} is ${u/5} units of $5. ${u/5} * $7 = $${pays}.`,
      visuals: { point: 6, bets: { place5: u }, dice: [3, 2] }
    });
  });

  const fourTenUnits = [5, 10, 15, 25, 50];
  fourTenUnits.forEach((u, i) => {
    const pays = (u / 5) * 9;
    q.push({
      id: `i_p_410_${i}`, type: 'text-input', difficulty: 'intermediate', scenario: 'Place Payouts',
      text: `A player has $${u} Place Bet on the 10. The shooter rolls a 10. How much is the payout?`,
      correctAnswerText: pays.toString(),
      explanation: `Place 4 and 10 pay 9 to 5. $${u} is ${u/5} units of $5. ${u/5} * $9 = $${pays}.`,
      visuals: { point: 8, bets: { place10: u }, dice: [6, 4] }
    });
  });

  const hardUnits = [5, 10, 25];
  hardUnits.forEach((u, i) => {
    q.push({
      id: `i_h_410_${i}`, type: 'text-input', difficulty: 'intermediate', scenario: 'Hardway Payouts',
      text: `A player has $${u} on Hard 4. The shooter rolls [2, 2]. How much is the payout?`,
      correctAnswerText: (u * 7).toString(),
      explanation: `Hard 4 and Hard 10 pay 7 to 1 (or 8 for 1). $${u} * 7 = $${u*7}.`,
      visuals: { point: 6, bets: { hard4: u }, dice: [2, 2] }
    });
    q.push({
      id: `i_h_68_${i}`, type: 'text-input', difficulty: 'intermediate', scenario: 'Hardway Payouts',
      text: `A player has $${u} on Hard 6. The shooter rolls [3, 3]. How much is the payout?`,
      correctAnswerText: (u * 9).toString(),
      explanation: `Hard 6 and Hard 8 pay 9 to 1 (or 10 for 1). $${u} * 9 = $${u*9}.`,
      visuals: { point: 4, bets: { hard6: u }, dice: [3, 3] }
    });
  });

  const oddsPairs = [
    { p: 4, b: 10, o: 10, ans: '20', r: '2 to 1' },
    { p: 10, b: 20, o: 20, ans: '40', r: '2 to 1' },
    { p: 5, b: 10, o: 10, ans: '15', r: '3 to 2' },
    { p: 9, b: 20, o: 20, ans: '30', r: '3 to 2' },
    { p: 6, b: 10, o: 10, ans: '12', r: '6 to 5' },
    { p: 8, b: 25, o: 25, ans: '30', r: '6 to 5' }
  ];
  oddsPairs.forEach((pair, i) => {
    q.push({
      id: `i_odds_${i}`, type: 'text-input', difficulty: 'intermediate', scenario: 'Pass Line Odds',
      text: `Point is ${pair.p}. Player has $${pair.b} Pass Line and $${pair.o} Odds. Shooter hits the point. How much do the Odds pay?`,
      correctAnswerText: pair.ans,
      explanation: `True odds on ${pair.p} pay ${pair.r}. $${pair.o} Odds pay $${pair.ans}.`,
      visuals: { point: pair.p, bets: { pass: pair.b, passOdds: pair.o }, dice: [pair.p/2, pair.p/2] as any }
    });
  });

  while (q.length < 40) {
    const val = [5, 10, 25, 50][Math.floor(Math.random()*4)];
    q.push({
      id: `i_gen_ext_${q.length}`, type: 'text-input', difficulty: 'intermediate', scenario: 'Place Payouts',
      text: `Payout for $${val * 6} Place Bet on the 6?`,
      correctAnswerText: (val * 7).toString(),
      explanation: `Place 6 pays 7 to 6. $${val*6} / 6 * 7 = $${val*7}.`,
      visuals: { point: 4, bets: { place6: val * 6 } }
    });
  }

  return q;
};

const generateExpertBank = (): Question[] => {
  const q: Question[] = [];
  const propMaxes = [
    { text: 'How much is the maximum bet on a Horn Bet?', ans: '120', exp: 'Standard $1000 limit: $30 max per number. 4 numbers * $30 = $120.' },
    { text: 'How much is the maximum bet on Horn - high 12?', ans: '125', exp: '5 unit bet. 2 units on 12 ($50 total on 12) pays $1500? In many houses, this is capped to $125 total bet to manage risk.' },
    { text: 'How much is the maximum bet on Horn - high 11?', ans: '250', exp: '11 pays 15:1. $1000 / 15 = ~$66 per unit. Standard 5-unit increments cap at $250.' },
    { text: 'How much is the maximum bet on Horn - high 2?', ans: '125', exp: 'Management of the 30:1 payout risk for 2 units on the 2.' },
    { text: 'How much is the maximum bet on 3 way craps?', ans: '90', exp: '3 numbers (2, 3, 12). 2 and 12 pay 30:1. $30 per number * 3 = $90.' }
  ];
  propMaxes.forEach((pm, i) => {
    q.push({
      id: `e_prop_${i}`, type: 'text-input', difficulty: 'expert', scenario: 'Prop Max Limits',
      text: pm.text, correctAnswerText: pm.ans, explanation: pm.exp, visuals: { point: null }
    });
  });
  const oddsScenarios = [
    { p: 5, b: 25, ans: '100' }, { p: 9, b: 50, ans: '200' }, { p: 5, b: 75, ans: '300' },
    { p: 6, b: 12, ans: '60' }, { p: 8, b: 30, ans: '150' }, { p: 6, b: 60, ans: '300' },
    { p: 5, b: 100, ans: '400' }, { p: 6, b: 150, ans: '750' }, { p: 9, b: 200, ans: '800' },
    { p: 8, b: 500, ans: '2500' }
  ];
  oddsScenarios.forEach((s, i) => {
    const mult = (s.p === 5 || s.p === 9) ? 4 : 5;
    q.push({
      id: `e_odds_${i}`, type: 'text-input', difficulty: 'expert', scenario: 'Max Odds Math',
      text: `Point is ${s.p}. Pass Line bet is $${s.b}. What are the maximum odds (${mult}x) allowed?`,
      correctAnswerText: s.ans,
      explanation: `On Point ${s.p}, max odds are ${mult}x. $${s.b} * ${mult} = $${s.ans}.`,
      visuals: { point: s.p, bets: { pass: s.b } }
    });
  });
  const placeScenarios = [
    { n: 4, b: 25, ans: '45' }, { n: 10, b: 50, ans: '90' }, { n: 4, b: 75, ans: '135' }, { n: 10, b: 100, ans: '180' }, { n: 4, b: 250, ans: '450' },
    { n: 5, b: 25, ans: '35' }, { n: 9, b: 50, ans: '70' }, { n: 5, b: 75, ans: '105' }, { n: 9, b: 100, ans: '140' }, { n: 5, b: 250, ans: '350' },
    { n: 4, b: 15, ans: '27' }, { n: 5, b: 35, ans: '49' }, { n: 10, b: 40, ans: '72' }, { n: 9, b: 60, ans: '84' }, { n: 4, b: 20, ans: '36' }
  ];
  placeScenarios.forEach((s, i) => {
    const ratio = (s.n === 4 || s.n === 10) ? '9 to 5' : '7 to 5';
    q.push({
      id: `e_place_${i}`, type: 'text-input', difficulty: 'expert', scenario: 'Place Payouts',
      text: `Give the payout for a $${s.b} Place Bet on the ${s.n}? (Ratio: ${ratio})`,
      correctAnswerText: s.ans,
      explanation: `Place ${s.n} pays ${ratio}. ($${s.b} / 5) * ${ratio.split(' ')[0]} = $${s.ans}.`,
      visuals: { point: 6, bets: { [`place${s.n}`]: s.b } }
    });
  });
  const units = [1, 2, 3, 4, 5, 6, 8, 10, 20, 25];
  const types = ['Across', 'Inside', 'Outside'];
  const points = [4, 5, 6, 8, 9, 10];
  let qCount = 0;
  while (q.length < 60) {
    const u = units[Math.floor(Math.random() * units.length)];
    const t = types[Math.floor(Math.random() * types.length)] as 'Across' | 'Inside' | 'Outside';
    const p = points[Math.floor(Math.random() * points.length)];
    let total = 0;
    const active: number[] = [];
    if (t === 'Across') active.push(4, 5, 6, 8, 9, 10);
    else if (t === 'Inside') active.push(5, 6, 8, 9);
    else if (t === 'Outside') active.push(4, 5, 9, 10);
    const toBet = active.filter(n => n !== p);
    toBet.forEach(n => {
      total += (n === 6 || n === 8) ? u * 6 : u * 5;
    });
    const id = `e_units_${qCount++}`;
    const text = `Dealer, how much is ${u} unit${u > 1 ? 's' : ''} ${t} if the puck is on ${p}?`;
    if (!q.find(existing => existing.text === text)) {
      q.push({
        id, type: 'text-input', difficulty: 'expert', scenario: 'Units Calculation',
        text, correctAnswerText: total.toString(),
        explanation: `${u} unit(s) ${t} excludes the point ${p}. Total cost for [${toBet.join(', ')}] is $${total}.`,
        visuals: { point: p }
      });
    }
  }
  return q;
};

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export const QUESTION_BANK: Record<string, Question[]> = {
  beginner: generateBeginnerBank(),
  intermediate: generateIntermediateBank(),
  expert: generateExpertBank()
};
