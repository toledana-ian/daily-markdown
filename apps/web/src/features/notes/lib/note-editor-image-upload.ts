import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FileIcon, defaultStyles } from 'react-file-icon';

const DEFAULT_BUCKET = import.meta.env.VITE_SUPABASE_NOTE_IMAGES_BUCKET ?? 'note-images';

type StorageBucketClient = {
  upload: (
    path: string,
    file: File,
    options: {
      cacheControl: string;
      contentType: string;
      upsert: boolean;
    },
  ) => Promise<{ error: Error | null }>;
  getPublicUrl: (path: string) => {
    data: {
      publicUrl: string;
    };
  };
};

type SupabaseStorageClient = {
  storage: {
    from: (bucket: string) => StorageBucketClient;
  };
};

type UploadNoteImageParams = {
  bucket?: string;
  file: File;
  now?: () => Date;
  randomId?: () => string;
  supabase: SupabaseStorageClient;
  userId: string;
};

type UploadNoteFileResult = {
  alt: string;
  isImage: boolean;
  markdown: string;
  path: string;
  publicUrl: string;
};

const sanitizeSegment = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getFileExtension = (fileName: string) => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.at(-1)?.toLowerCase() ?? 'png' : 'png';
};

const getAltText = (fileName: string) => {
  const baseName = fileName.replace(/\.[^.]+$/, '').trim();
  return baseName || 'Image';
};

const isImageFile = (file: File) => file.type.startsWith('image/');

const escapeSvgText = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const encodeSvgDataUrl = (svg: string) => {
  if (typeof globalThis.btoa === 'function') {
    const utf8Bytes = new TextEncoder().encode(svg);
    const binary = Array.from(utf8Bytes, (byte) => String.fromCharCode(byte)).join('');
    return `data:image/svg+xml;base64,${globalThis.btoa(binary)}`;
  }

  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
};

const getFileIconLabel = (extension: string) => extension.slice(0, 4).toUpperCase() || 'FILE';

const getFileIconMarkup = (extension: string) => {
  const icon = renderToStaticMarkup(
    createElement(FileIcon, {
      extension: getFileIconLabel(extension),
      ...(defaultStyles[extension as keyof typeof defaultStyles] ?? {}),
    }),
  );

  return icon
    .replace(' width="100%"', '')
    .replace(' style="max-width:100%"', '')
    .replace('<svg ', '<svg x="34" y="26" width="88" height="106" aria-hidden="true" ');
};

const formatTimestamp = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, '0');

  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    '-',
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
  ].join('');
};

export const createImageMarkdown = (alt: string, url: string) => `![${alt}](${url})`;

const estimateSvgTextWidth = (value: string, fontSize: number, letterSpacing = 0) => {
  const averageCharacterWidth = Array.from(value).reduce((total, character) => {
    if ('WM@#%&'.includes(character)) {
      return total + 0.92;
    }

    if ('ABCDEFGHKNOPQRSTUVXYZ0123456789'.includes(character)) {
      return total + 0.72;
    }

    if ('abcdefghnopquxy'.includes(character)) {
      return total + 0.62;
    }

    if ('ijlI1|.,:;!\'` '.includes(character)) {
      return total + 0.32;
    }

    return total + 0.52;
  }, 0);

  const trackingWidth = Math.max(value.length - 1, 0) * letterSpacing;
  return averageCharacterWidth * fontSize * 1.05 + trackingWidth;
};

const createFileThumbnailDataUrl = (label: string, extension: string) => {
  const rawTitle = label.trim() || 'Attachment';
  const title = escapeSvgText(rawTitle);
  const fileTypeLabel = getFileIconLabel(extension);
  const iconSvg = getFileIconMarkup(extension);
  const cardMinWidth = 320;
  const cardHeight = 160;
  const outerPadding = 20;
  const textStartX = 144;
  const rightPadding = 20;
  const contentWidth = Math.max(
    estimateSvgTextWidth(fileTypeLabel, 14, 1.4),
    estimateSvgTextWidth(rawTitle, 18),
    estimateSvgTextWidth('Open attachment', 14),
  );
  const cardWidth = Math.max(cardMinWidth, Math.ceil(textStartX + contentWidth + rightPadding));
  const innerCardWidth = cardWidth - outerPadding * 2;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" role="img" aria-label="${title}">
  <rect width="${cardWidth}" height="${cardHeight}" rx="20" fill="#f8fafc"/>
  <rect x="${outerPadding}" y="${outerPadding}" width="${innerCardWidth}" height="120" rx="16" fill="#e2e8f0"/>
  ${iconSvg}
  <text x="${textStartX}" y="70" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#475569" letter-spacing="1.4">${fileTypeLabel}</text>
  <text x="${textStartX}" y="96" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="#0f172a">${title}</text>
  <text x="${textStartX}" y="120" font-family="Arial, sans-serif" font-size="14" fill="#64748b">Open attachment</text>
</svg>`.trim();

  return encodeSvgDataUrl(svg);
};

export const createFileMarkdown = (label: string, url: string, extension: string) => {
  const thumbnail = createFileThumbnailDataUrl(label, extension);
  return `[![${extension.toUpperCase() || 'FILE'} file](${thumbnail})](${url})`;
};

export const createUploadingImageMarkdown = (alt: string, token: string) =>
  createImageMarkdown(`Uploading image: ${alt}`, `uploading://${token}`);

export const createUploadingFileMarkdown = (label: string, token: string, file: File) => {
  if (isImageFile(file)) {
    return createUploadingImageMarkdown(label, token);
  }

  const extension = getFileExtension(file.name);
  return createFileMarkdown(`Uploading ${label}`, `uploading://${token}`, extension);
};

export const replaceImagePlaceholder = (
  content: string,
  placeholder: string,
  nextMarkdown: string,
) => content.replace(placeholder, nextMarkdown);

export const uploadNoteImage = async ({
  bucket = DEFAULT_BUCKET,
  file,
  now = () => new Date(),
  randomId = () => crypto.randomUUID().slice(0, 8),
  supabase,
  userId,
}: UploadNoteImageParams) => {
  const result = await uploadNoteFile({
    bucket,
    file,
    now,
    randomId,
    supabase,
    userId,
  });

  return {
    alt: result.alt,
    markdown: result.markdown,
    path: result.path,
    publicUrl: result.publicUrl,
  };
};

export const uploadNoteFile = async ({
  bucket = DEFAULT_BUCKET,
  file,
  now = () => new Date(),
  randomId = () => crypto.randomUUID().slice(0, 8),
  supabase,
  userId,
}: UploadNoteImageParams): Promise<UploadNoteFileResult> => {
  const alt = getAltText(file.name);
  const extension = getFileExtension(file.name);
  const safeBaseName = sanitizeSegment(alt) || 'file';
  const path = `${userId}/${formatTimestamp(now())}-${randomId()}-${safeBaseName}.${extension}`;
  const storage = supabase.storage.from(bucket);
  const { error } = await storage.upload(path, file, {
    cacheControl: '3600',
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = storage.getPublicUrl(path);

  return {
    alt,
    isImage: isImageFile(file),
    markdown: isImageFile(file)
      ? createImageMarkdown(alt, publicUrl)
      : createFileMarkdown(alt, publicUrl, extension),
    path,
    publicUrl,
  };
};

export const noteEditorImageUpload = {
  bucket: DEFAULT_BUCKET,
};

export const noteEditorFileUpload = noteEditorImageUpload;
