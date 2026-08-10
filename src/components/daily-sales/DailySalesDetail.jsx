import { X } from "lucide-react";

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

export default function DailySalesDetail({ open, detail, loading, error, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="daily-sales-modal daily-sales-detail-modal" role="dialog" aria-modal="true" aria-labelledby="daily-sales-detail-title">
        <header className="daily-sales-modal-header">
          <div>
            <span className="daily-sales-eyebrow">BRANCH OPERATIONS</span>
            <h2 id="daily-sales-detail-title">Sales Detail</h2>
            <p>Ringkasan penjualan bunga harian.</p>
          </div>
          <button className="daily-sales-close" type="button" onClick={onClose} aria-label="Tutup Sales Detail"><X size={20} /></button>
        </header>
        <div className="daily-sales-modal-body">
          {loading && <div className="daily-sales-state">Memuat detail...</div>}
          {!loading && error && <div className="daily-sales-error" role="alert">{error}</div>}
          {!loading && !error && detail && (
            <>
              <div className="daily-sales-detail-date"><span>TANGGAL SALES</span><strong>{formatDate(detail.salesDate)}</strong></div>
              <div className="daily-sales-detail-table-wrap">
                <table className="daily-sales-detail-table">
                  <thead><tr><th>Flower</th><th>Sold Qty</th><th>Damaged Qty</th></tr></thead>
                  <tbody>
                    {(detail.items || []).map((item, index) => (
                      <tr key={item.id || `${item.flowerId}-${index}`}>
                        <td>{item.flower?.name || item.flowerName || "-"}</td>
                        <td>{item.soldQuantity ?? "-"}</td>
                        <td>{item.damagedQuantity ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        <footer className="daily-sales-modal-footer"><button className="daily-sales-secondary-button" type="button" onClick={onClose}>Tutup</button></footer>
      </section>
    </div>
  );
}
