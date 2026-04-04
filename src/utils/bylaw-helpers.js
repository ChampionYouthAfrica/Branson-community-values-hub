export function getSectionText(section, language = 'technical') {
  const languageMap = {
    technical: 'technical',
    standard: 'standard',
    simplePlain: 'simplePlain',
  };
  return section[languageMap[language]] || section.standard;
}

export function getBylawsAsText(bylaws, language = 'technical') {
  let text = `${bylaws.title}\n\n`;
  bylaws.articles.forEach((article) => {
    text += `ARTICLE ${article.number}. ${article.title}\n\n`;
    article.sections.forEach((section) => {
      text += `Section ${section.number}. ${section.title}\n`;
      text += getSectionText(section, language) + '\n\n';
    });
  });
  return text;
}

export function searchBylaws(query, bylaws, language = 'technical') {
  if (!query.trim()) return [];
  const results = [];
  const lowerQuery = query.toLowerCase();

  bylaws.articles.forEach((article) => {
    article.sections.forEach((section) => {
      const text = [
        section.title,
        section.technical,
        section.standard,
        section.simplePlain,
      ].join(' ').toLowerCase();

      if (text.includes(lowerQuery)) {
        results.push({
          articleNumber: article.number,
          articleTitle: article.title,
          sectionNumber: section.number,
          sectionTitle: section.title,
        });
      }
    });
  });

  return results;
}
