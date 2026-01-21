
export type QuestionType = 'TEXT' | 'PARAGRAPH' | 'RADIO' | 'CHECKBOX' | 'DROPDOWN' | 'SCALE' | 'DATE' | 'TIME';

export interface ScaleDetails {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

export interface FormItem {
  title: string;
  helpText: string | null;
  type: QuestionType;
  isRequired: boolean;
  options: string[] | null;
  scaleDetails: ScaleDetails | null;
}

export interface FormStructure {
  formTitle: string;
  formDescription: string;
  items: FormItem[];
}

export interface AppState {
  proposal: string;
  isGenerating: boolean;
  error: string | null;
  generatedForm: FormStructure | null;
}
