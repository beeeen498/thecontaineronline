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
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} style={{
          width: idx === 0 ? '60%' : '130px',
          height: idx === 0 ? '24px' : '130px',
          borderRadius: idx === 0 ? '2px' : '50%',
          background: '#f0f0f0',
        }} />
      ))}
    </div>
  );
}