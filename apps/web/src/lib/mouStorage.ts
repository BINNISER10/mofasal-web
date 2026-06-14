import { MOU_META, MOU_PARTIES } from '@/data/mouContent';

export type MouPartyDraft = {
  id: number;
  name: string;
  role: string;
  idLabel: string;
  idNumber: string;
};

export type MouDraft = {
  company: string;
  project: string;
  date: string;
  parties: MouPartyDraft[];
};

const STORAGE_KEY = 'mofasal-mou-draft';

export const DEFAULT_MOU_DRAFT: MouDraft = {
  company: MOU_META.company,
  project: MOU_META.project,
  date: MOU_META.datePlaceholder,
  parties: MOU_PARTIES.map((p) => ({
    id: p.id,
    name: p.name,
    role: p.role,
    idLabel: p.idLabel,
    idNumber: '',
  })),
};

export function loadMouDraft(): MouDraft {
  if (typeof window === 'undefined') return DEFAULT_MOU_DRAFT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MOU_DRAFT;
    const parsed = JSON.parse(raw) as MouDraft;
    return {
      ...DEFAULT_MOU_DRAFT,
      ...parsed,
      parties: DEFAULT_MOU_DRAFT.parties.map((def) => {
        const saved = parsed.parties?.find((p) => p.id === def.id);
        return saved ? { ...def, ...saved } : def;
      }),
    };
  } catch {
    return DEFAULT_MOU_DRAFT;
  }
}

export function saveMouDraft(draft: MouDraft) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function resetMouDraft(): MouDraft {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_MOU_DRAFT, parties: DEFAULT_MOU_DRAFT.parties.map((p) => ({ ...p })) };
}

/** استبدال أسماء الشركاء الافتراضية في نص البنود */
export function applyPartyNames(text: string, parties: MouPartyDraft[]): string {
  let result = text;
  MOU_PARTIES.forEach((def, i) => {
    const current = parties[i];
    if (current?.name && def.name !== current.name) {
      result = result.split(def.name).join(current.name);
    }
  });
  return result;
}
