// ─── Info Page Loading ────────────────────────────────────────
export default function InfoLoading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '32px',
      padding: '64px 32px',
      minHeight: '100vh',
    }}>
      <div style={{ width: '60%', height: '24px', background: '#f0f0f0', borderRadius: '2px' }} />
      <div style={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} style={{
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            background: '#f0f0f0',
          }} />
        ))}
      </div>
    </div>
  );
}