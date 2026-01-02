
export type ViewState = 'login' | 'menu' | 'simulation' | 'summary' | 'certificate';

export type TrainingModeId = 'simulation_all' | 'trainee_to_dice5' | 'dice5_to_dice6' | 'dice6_to_dice7';

export type UserRole = 'dealer' | 'manager';

export interface Employee {
  firstName: string;
  lastName: string;
  mapsId: string;
  role: UserRole;
}

export interface UserSession {
  firstName: string;
  lastName: string;
  mapsId: string;
  ship: string;
  role: UserRole;
  isLoggedIn: boolean;
}

export interface TrainingModeConfig {
  id: TrainingModeId;
  label: string;
  description: string;
  passMark: number; // Percentage
  isTest: boolean;
}

export interface Question {
  id: string;
  type?: 'multiple-choice' | 'text-input';
  text: string;
  options?: string[]; // Optional for text-input
  correctIndex?: number; // Optional for text-input
  correctAnswerText?: string; // Required for text-input
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  scenario: string; // Describes the table state
  visuals?: {
    point?: number | null;
    bets?: ActiveBets;
    dice?: [number, number];
  };
}

export interface QuizState {
  currentQuestionIndex: number;
  correctCount: number;
  answers: { questionId: string; isCorrect: boolean; selectedIndex?: number; textAnswer?: string }[];
  isComplete: boolean;
}

export interface CertificateData {
  id: string;
  firstName: string;
  lastName: string;
  mapsId: string;
  ship: string;
  levelName: string;
  score: number;
  dateCompleted: string;
  timeCompleted: string;
  duration: string;
}

// --- Simulation Sandbox Types ---

export type BetType = 
  | 'pass' | 'passOdds' | 'dontPass' | 'come' | 'dontCome' | 'field' 
  | 'place4' | 'place5' | 'place6' | 'place8' | 'place9' | 'place10'
  | 'buy4' | 'buy5' | 'buy6' | 'buy8' | 'buy9' | 'buy10'
  | 'lay4' | 'lay5' | 'lay6' | 'lay8' | 'lay9' | 'lay10'
  | 'come4' | 'come5' | 'come6' | 'come8' | 'come9' | 'come10'
  | 'dontCome4' | 'dontCome5' | 'dontCome6' | 'dontCome8' | 'dontCome9' | 'dontCome10'
  | 'comeOdds4' | 'comeOdds5' | 'comeOdds6' | 'comeOdds8' | 'comeOdds9' | 'comeOdds10'
  | 'dontComeOdds4' | 'dontComeOdds5' | 'dontComeOdds6' | 'dontComeOdds8' | 'dontComeOdds9' | 'dontComeOdds10'
  | 'hard4' | 'hard6' | 'hard8' | 'hard10'
  | 'anySeven' | 'anyCraps' | 'aceDeuce' | 'yo11' | 'aces' | 'twelve'
  | 'c' | 'e' | 'big6' | 'big8' | 'horn';

export interface ActiveBets {
  [key: string]: number; // BetType keys mapping to amount
}

export interface GameState {
  point: number | null; // null = OFF (Come Out roll)
  dice: [number, number];
  puckPosition: number | null; // null = OFF position, number = Box Number
  balance: number;
  bets: ActiveBets;
  lastRollText: string;
}
