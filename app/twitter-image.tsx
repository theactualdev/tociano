import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Tociano Boutique - Premium Nigerian Fashion';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ marginBottom: '20px', fontSize: '64px', fontWeight: 'bold' }}>
          Tociano Boutique
        </div>
        <div style={{ fontSize: '32px' }}>
          Premium Nigerian Fashion
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
} 