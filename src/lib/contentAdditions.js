import { supabase } from './supabase';

// Published, structured additions that render on the site (not just AI context).

export async function fetchAdditions(target) {
  if (!supabase) return [];
  let q = supabase.from('content_additions').select('*').order('created_at', { ascending: true });
  if (target) q = q.eq('target', target);
  const { data, error } = await q;
  if (error) {
    console.warn('[additions] fetch failed:', error.message);
    return [];
  }
  return data || [];
}

export async function addAddition({ target, data, source_title }) {
  if (!supabase) throw new Error('Storage is not configured.');
  const { data: row, error } = await supabase
    .from('content_additions')
    .insert([{ target, data, source_title: source_title || null }])
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function deleteAddition(id) {
  if (!supabase) throw new Error('Storage is not configured.');
  const { error } = await supabase.from('content_additions').delete().eq('id', id);
  if (error) throw error;
}

// Merge published bylaws additions into the static bylaws structure so the
// Bylaws Browser (and the Policy Advisor's context) render them inline,
// indistinguishable from native sections.
export function mergeBylawsAdditions(base, additionRows) {
  if (!additionRows || !additionRows.length) return base;
  const articles = base.articles.map((a) => ({ ...a, sections: [...a.sections] }));
  const byNumber = new Map(articles.map((a) => [String(a.number), a]));
  const newArticlesByTitle = new Map();

  for (const row of additionRows) {
    const d = row.data || {};
    const section = {
      number: d.number || '',
      title: d.title || 'Untitled',
      technical: d.technical || d.standard || '',
      standard: d.standard || d.technical || '',
      simplePlain: d.simplePlain || d.standard || d.technical || '',
    };

    if (d.placement === 'new-article') {
      const key = (d.newArticleTitle || 'Additional Provisions').trim();
      let art = newArticlesByTitle.get(key);
      if (!art) {
        art = { number: d.newArticleNumber || key, title: key, sections: [] };
        newArticlesByTitle.set(key, art);
        articles.push(art);
      }
      art.sections.push(section);
    } else {
      // append to an existing article
      const art = byNumber.get(String(d.articleNumber));
      if (art) art.sections.push(section);
      else {
        // fall back to a catch-all article if the target article is missing
        const key = d.articleTitle || 'Additional Provisions';
        let extra = newArticlesByTitle.get(key);
        if (!extra) {
          extra = { number: d.articleNumber || key, title: key, sections: [] };
          newArticlesByTitle.set(key, extra);
          articles.push(extra);
        }
        extra.sections.push(section);
      }
    }
  }

  return { ...base, articles };
}
