import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#dc2626',
          borderRadius: 36,
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: -2, lineHeight: 1 }}>CG</div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 2, marginTop: 6 }}>FILE</div>
      </div>
    ),
    { ...size }
  );
}
