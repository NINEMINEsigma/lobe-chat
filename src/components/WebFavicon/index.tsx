import Image from 'next/image';

interface WebFaviconProps {
  alt?: string;
  size?: number;
  title?: string;
  url: string;
}

const WebFavicon = ({ url, title, alt, size = 14 }: WebFaviconProps) => {
  // const urlObj = new URL(url);
  // const host = urlObj.hostname;

  return (
    <Image
      alt={alt || title || url}
      height={size}
      src="/favicon-32x32.ico"
      style={{ borderRadius: 4 }}
      unoptimized
      width={size}
    />
  );
};

export default WebFavicon;
