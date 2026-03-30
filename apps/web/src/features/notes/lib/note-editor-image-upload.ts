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

export const createUploadingImageMarkdown = (alt: string, token: string) =>
  createImageMarkdown(`Uploading image: ${alt}`, `uploading://${token}`);

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
  const alt = getAltText(file.name);
  const extension = getFileExtension(file.name);
  const safeBaseName = sanitizeSegment(alt) || 'image';
  const path = `${userId}/${formatTimestamp(now())}-${randomId()}-${safeBaseName}.${extension}`;
  const storage = supabase.storage.from(bucket);
  const { error } = await storage.upload(path, file, {
    cacheControl: '3600',
    contentType: file.type || `image/${extension}`,
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
    markdown: createImageMarkdown(alt, publicUrl),
    path,
    publicUrl,
  };
};

export const noteEditorImageUpload = {
  bucket: DEFAULT_BUCKET,
};
