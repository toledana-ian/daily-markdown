const HASHTAG_REGEX = /(^|\s)#([a-z0-9_-]+)/gim;

export const extractTagsFromContent = (content: string): string[] => {
  const tags = new Set<string>();

  for (const match of content.matchAll(HASHTAG_REGEX)) {
    const tag = match[2]?.trim().toLowerCase();

    if (tag) {
      tags.add(tag);
    }
  }

  return [...tags];
};
