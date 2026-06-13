import './loading.scss';

export default function FashionLoading() {
  return (
    <div className="store-loading">
      <div className="store-loading__sidebar" />
      <div className="store-loading__cards">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="store-loading__card">
            <div className="store-loading__card-image skeleton" />
            <div className="store-loading__card-title skeleton" />
            <div className="store-loading__card-price skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}