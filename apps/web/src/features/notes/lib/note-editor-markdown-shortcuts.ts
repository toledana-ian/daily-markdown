export type SelectionRange = {
  from: number;
  to: number;
};

export type MarkdownShortcutResult = {
  content: string;
  selection: SelectionRange;
};

export const toggleMarkdownWrap = (
  content: string,
  selection: SelectionRange,
  marker: string,
): MarkdownShortcutResult | null => {
  if (selection.from === selection.to) {
    return null;
  }

  const hasWrappedSelection =
    selection.from >= marker.length &&
    selection.to + marker.length <= content.length &&
    content.slice(selection.from - marker.length, selection.from) === marker &&
    content.slice(selection.to, selection.to + marker.length) === marker;

  if (hasWrappedSelection) {
    const nextContent =
      content.slice(0, selection.from - marker.length) +
      content.slice(selection.from, selection.to) +
      content.slice(selection.to + marker.length);

    return {
      content: nextContent,
      selection: {
        from: selection.from - marker.length,
        to: selection.to - marker.length,
      },
    };
  }

  const nextContent =
    content.slice(0, selection.from) +
    marker +
    content.slice(selection.from, selection.to) +
    marker +
    content.slice(selection.to);

  return {
    content: nextContent,
    selection: {
      from: selection.from + marker.length,
      to: selection.to + marker.length,
    },
  };
};
