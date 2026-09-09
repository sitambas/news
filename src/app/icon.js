import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/** CGFILE brand favicon — red tile with CG */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#dc2626',
          borderRadius: 6,
          color: 'white',
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: -0.5,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        CG
      </div>
    ),
    { ...size }
  );
}
