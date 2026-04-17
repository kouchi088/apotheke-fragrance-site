export const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.megurid.com';
export const siteName = 'MEGURID';
export const defaultDescription =
  'meguridは、モルタルとコンクリートでつくる静かな日用品ブランドです。トレイ、コースター、インセンスホルダーなど、空間に静けさを添える道具を届けます。';

export function buildAbsoluteUrl(path = '/') {
  return new URL(path, siteUrl).toString();
}

export const defaultOgImage = buildAbsoluteUrl('/og-image.jpg');

function normalizeImageInput(image: string) {
  const normalizedImage = image.trim().replace(/^hhttps?:\/\//i, 'https://');

  if (/^\/https?:\/\//i.test(normalizedImage)) {
    return normalizedImage.slice(1);
  }

  const normalizedSiteUrl = siteUrl.replace(/\/+$/, '');
  if (
    normalizedImage.startsWith(`${normalizedSiteUrl}https://`) ||
    normalizedImage.startsWith(`${normalizedSiteUrl}http://`)
  ) {
    return normalizedImage.slice(normalizedSiteUrl.length);
  }

  return normalizedImage;
}

export function buildImageUrl(image?: string | null) {
  if (!image) return null;

  const normalizedImage = normalizeImageInput(image);
  if (!normalizedImage) return null;

  if (
    normalizedImage.startsWith('http://') ||
    normalizedImage.startsWith('https://') ||
    normalizedImage.startsWith('data:')
  ) {
    return normalizedImage;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '');

  if (normalizedImage.startsWith('/storage/v1/object/public/')) {
    return supabaseUrl ? `${supabaseUrl}${normalizedImage}` : buildAbsoluteUrl(normalizedImage);
  }

  if (normalizedImage.startsWith('/')) {
    return buildAbsoluteUrl(normalizedImage);
  }

  if (!supabaseUrl) return normalizedImage;

  return `${supabaseUrl}/storage/v1/object/public/${normalizedImage.replace(/^\/+/, '')}`;
}

export function createBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: buildAbsoluteUrl(item.path),
    })),
  };
}

export function formatJapaneseDate(dateString: string) {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}
