import { supabase } from './supabase';

// Targets a knowledge upload can be assigned to.
export const KNOWLEDGE_TARGETS = [
  { value: 'bylaws', label: 'Bylaws Browser' },
  { value: 'advisor', label: 'Policy Advisor' },
  { value: 'vendor', label: 'Vendor Assessment Rubrics' },
  { value: 'quick-reference', label: 'Quick Reference' },
  { value: 'all', label: 'Across the board (all tools)' },
  { value: 'ai-decide', label: 'Let AI decide where it fits' },
];

export const TARGET_LABELS = Object.fromEntries(
  KNOWLEDGE_TARGETS.map((t) => [t.value, t.label])
);

// Fetch every uploaded knowledge document.
export async function fetchAllKnowledge() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('knowledge_uploads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('[knowledge] fetch failed:', error.message);
    return [];
  }
  return data || [];
}

// Fetch documents relevant to a given tool. Always includes documents marked
// "all" (across the board) and "ai-decide" (AI figures out where they apply),
// so any tool sees them and can use its own judgement.
export async function fetchKnowledgeFor(target) {
  const all = await fetchAllKnowledge();
  return all.filter(
    (d) => d.target === target || d.target === 'all' || d.target === 'ai-decide'
  );
}

// Build a plain-text block to append to an AI system prompt.
export function knowledgeToPromptText(docs) {
  if (!docs || !docs.length) return '';
  const blocks = docs.map((d) => {
    const note =
      d.target === 'ai-decide'
        ? ' (uploaded without a fixed category — apply it wherever it is genuinely relevant)'
        : '';
    return `--- Supplemental document: ${d.title}${note} ---\n${d.content}`;
  });
  return (
    '\n\nADDITIONAL SUPPLEMENTAL KNOWLEDGE (uploaded by Branson administrators; ' +
    'treat as authoritative context alongside the bylaws):\n\n' +
    blocks.join('\n\n')
  );
}

export async function addKnowledge({ title, content, target, filename }) {
  if (!supabase) throw new Error('Storage is not configured.');
  const { data, error } = await supabase
    .from('knowledge_uploads')
    .insert([{ title, content, target, filename: filename || null }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteKnowledge(id) {
  if (!supabase) throw new Error('Storage is not configured.');
  const { error } = await supabase.from('knowledge_uploads').delete().eq('id', id);
  if (error) throw error;
}
