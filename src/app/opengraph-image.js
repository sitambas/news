import { ImageResponse } from 'next/og';

export const alt = 'CGFILE - ब्रेकिंग न्यूज़ और ताज़ा खबरें';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 45%, #991b1b 100%)',
          color: 'white',
          padding: 64,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: 'white',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            CG
          </div>
          <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: -1 }}>
            CGFILE
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.2, maxWidth: 980 }}>
            छत्तीसगढ़ और भारत की ब्रेकिंग न्यूज़
          </div>
          <div style={{ fontSize: 28, opacity: 0.9, maxWidth: 900 }}>
            ताज़ा खबरें · गहन विश्लेषण · विश्वसनीय स्रोत
          </div>
        </div>
        <div style={{ fontSize: 22, opacity: 0.85 }}>cgfile.in</div>
      </div>
    ),
    { ...size }
  );
}
