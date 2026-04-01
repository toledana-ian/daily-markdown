import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MAX_FILE_UPLOAD_SIZE_BYTES,
  getMaxFileUploadSizeBytes,
  validateFileUploadSize,
} from '@/features/notes/lib/note-editor-file-upload.ts';

describe('getMaxFileUploadSizeBytes', () => {
  it('uses the default 10 MB limit when env is missing', () => {
    expect(getMaxFileUploadSizeBytes(undefined)).toBe(DEFAULT_MAX_FILE_UPLOAD_SIZE_BYTES);
  });

  it('uses the configured byte limit when env is valid', () => {
    expect(getMaxFileUploadSizeBytes('2097152')).toBe(2 * 1024 * 1024);
  });

  it('falls back to the default 10 MB limit when env is invalid', () => {
    expect(getMaxFileUploadSizeBytes('not-a-number')).toBe(DEFAULT_MAX_FILE_UPLOAD_SIZE_BYTES);
    expect(getMaxFileUploadSizeBytes('0')).toBe(DEFAULT_MAX_FILE_UPLOAD_SIZE_BYTES);
  });
});

describe('validateFileUploadSize', () => {
  it('returns an error for files larger than the configured limit', () => {
    const file = new File([new Uint8Array(11 * 1024 * 1024)], 'large.png', {
      type: 'image/png',
    });

    expect(validateFileUploadSize(file, 10 * 1024 * 1024)).toBe(
      'Files larger than 10 MB cannot be uploaded.',
    );
  });

  it('allows files at or below the configured limit', () => {
    const file = new File([new Uint8Array(10 * 1024 * 1024)], 'ok.png', {
      type: 'image/png',
    });

    expect(validateFileUploadSize(file, 10 * 1024 * 1024)).toBeNull();
  });
});
