import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FileIcon, defaultStyles } from 'react-file-icon';

const DEFAULT_BUCKET = import.meta.env.VITE_SUPABASE_NOTE_IMAGES_BUCKET ?? 'note-images';
export const DEFAULT_MAX_FILE_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

type StorageBucketClient = {
  upload: (
    path: string,
    file: File | Blob,
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
    .replace('<svg ', '<svg x="14" y="6" width="88" height="106" aria-hidden="true" ');
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

const formatFileSize = (bytes: number) => {
  const megabytes = bytes / (1024 * 1024);

  if (Number.isInteger(megabytes)) {
    return `${megabytes} MB`;
  }

  return `${megabytes.toFixed(1)} MB`;
};

export const getMaxFileUploadSizeBytes = (
  envValue = import.meta.env.VITE_MAX_FILE_UPLOAD_SIZE_BYTES,
) => {
  const parsedValue = Number(envValue);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return DEFAULT_MAX_FILE_UPLOAD_SIZE_BYTES;
  }

  return Math.floor(parsedValue);
};

export const validateFileUploadSize = (file: File, maxBytes = getMaxFileUploadSizeBytes()) => {
  if (file.size <= maxBytes) {
    return null;
  }

  return `Files larger than ${formatFileSize(maxBytes)} cannot be uploaded.`;
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

const createFileThumbnailSvg = (label: string, extension: string) => {
  const rawTitle = label.trim() || 'Attachment';
  const title = escapeSvgText(rawTitle);
  const fileTypeLabel = getFileIconLabel(extension);
  const iconSvg = getFileIconMarkup(extension);
  const cardMinWidth = 320;
  const cardHeight = 120;
  const outerPadding = 0;
  const textStartX = 124;
  const rightPadding = 0;
  const contentWidth = Math.max(
    estimateSvgTextWidth(fileTypeLabel, 14, 1.4),
    estimateSvgTextWidth(rawTitle, 18),
    estimateSvgTextWidth('Open attachment', 14),
  );
  const cardWidth = Math.max(cardMinWidth, Math.ceil(textStartX + contentWidth + rightPadding));
  const innerCardWidth = cardWidth - outerPadding * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" role="img" aria-label="${title}">
  <rect x="${outerPadding}" y="${outerPadding}" width="${innerCardWidth}" height="120" rx="16" fill="#e2e8f0"/>
  ${iconSvg}
  <text x="${textStartX}" y="50" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#475569" letter-spacing="1.4">${fileTypeLabel}</text>
  <text x="${textStartX}" y="76" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="#0f172a">${title}</text>
  <text x="${textStartX}" y="100" font-family="Arial, sans-serif" font-size="14" fill="#64748b">Open attachment</text>
</svg>`;
};

export const createFileMarkdown = (url: string, extension: string, thumbnailUrl?: string) => {
  return `[![${extension.toUpperCase() || 'FILE'} file](${thumbnailUrl})](${url})`;
};

export const createUploadingImageMarkdown = (alt: string, token: string) =>
  createImageMarkdown(`Uploading image: ${alt}`, `uploading://${token}`);

export const createUploadingFileMarkdown = (label: string, token: string, file: File) => {
  if (isImageFile(file)) {
    return createUploadingImageMarkdown(label, token);
  }

  const extension = getFileExtension(file.name);
  return `[![${extension.toUpperCase() || 'FILE'}](Preparing preview...)](Uploading ${label}...)`;
};

export const replaceImagePlaceholder = (
  content: string,
  placeholder: string,
  nextMarkdown: string,
) => content.replace(placeholder, nextMarkdown);

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

  let thumbnailUrl: string | undefined;
  if (!isImageFile(file)) {
    const svgContent = createFileThumbnailSvg(alt, extension);
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const thumbnailPath = `${userId}/${formatTimestamp(now())}-${randomId()}-${safeBaseName}-thumbnail.svg`;
    const { error: thumbnailError } = await storage.upload(thumbnailPath, svgBlob, {
      cacheControl: '3600',
      contentType: 'image/svg+xml',
      upsert: false,
    });
    if (!thumbnailError) {
      thumbnailUrl = storage.getPublicUrl(thumbnailPath).data.publicUrl;
    }else {
      throw new Error('Failed to upload.');
    }
  }

  if (isImageFile(file)){
    return {
      alt,
      isImage: true,
      markdown: createImageMarkdown(alt, publicUrl),
      path,
      publicUrl,
    };
  }

  return {
    alt,
    isImage: false,
    markdown: createFileMarkdown(publicUrl, extension, thumbnailUrl),
    path,
    publicUrl,
  };
};
