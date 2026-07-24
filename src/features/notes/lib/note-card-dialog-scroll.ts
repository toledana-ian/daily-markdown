export type DialogScrollOffsets = {
  edit: number;
  view: number;
};

export const resolveEditorScrollTopOnOpen = (
  mode: 'closed' | 'view' | 'edit',
  scrollOffsets: DialogScrollOffsets,
): number => {
  if (mode === 'view') {
    return scrollOffsets.view;
  }

  return scrollOffsets.edit;
};

export const resolveViewScrollTopOnEditorClose = (
  previousMode: 'closed' | 'view' | 'edit',
  scrollOffsets: DialogScrollOffsets,
): number | null => {
  if (previousMode !== 'view') {
    return null;
  }

  return scrollOffsets.edit;
};
