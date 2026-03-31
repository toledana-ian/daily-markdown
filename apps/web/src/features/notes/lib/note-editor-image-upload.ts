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

const createFileThumbnailDataUrl = (label: string, extension: string) => {
  const badge = escapeSvgText(extension.slice(0, 4).toUpperCase() || 'FILE');
  const title = escapeSvgText(label.slice(0, 24) || 'Attachment');
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180" role="img" aria-label="${title}">
  <rect width="320" height="180" rx="20" fill="#f8fafc"/>
  <rect x="20" y="20" width="280" height="140" rx="16" fill="#e2e8f0"/>
  <rect x="36" y="36" width="84" height="108" rx="14" fill="#ffffff"/>
  <path d="M92 36h16l20 20v88H92z" fill="#dbeafe"/>
  <path d="M108 36v20h20" fill="#bfdbfe"/>
  <rect x="146" y="52" width="126" height="42" rx="12" fill="#1d4ed8"/>
  <text x="209" y="79" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#ffffff" text-anchor="middle">${badge}</text>
  <text x="146" y="122" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="#0f172a">${title}</text>
  <text x="146" y="146" font-family="Arial, sans-serif" font-size="14" fill="#475569">Open attachment</text>
</svg>`.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
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
