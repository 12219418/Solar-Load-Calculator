import { motion } from 'framer-motion';
import {
  FileSpreadsheet, Download, RotateCcw, User, Hash, Bolt,
  Plug, Calendar, TrendingUp, Sun, PanelTop, Loader
} from 'lucide-react';
import './ResultsPanel.css';

export default function ResultsPanel({ data, onDownload, excelLoading, onReset }) {
  if (!data) return null;

  const monthlyData = data.monthly_data || [];
  const unitsList = monthlyData.filter(e => e.units > 0).map(e => e.units);
  const avgUnits = unitsList.length
    ? (unitsList.reduce((a, b) => a + b, 0) / unitsList.length).toFixed(0)
    : 0;
  const kwValue = avgUnits > 0 ? (avgUnits / 150).toFixed(2) : 0;
  const panelWatt = 600;
  const solarCapacity = kwValue > 0 ? (Math.ceil((kwValue * 1000 / panelWatt) * 10) / 10).toFixed(1) : 0;
  const numPanels = solarCapacity > 0 ? Math.ceil((solarCapacity * 1000) / panelWatt) : 0;

  const infoItems = [
    { icon: User, label: 'Consumer', value: data.consumer_name || 'N/A' },
    { icon: Hash, label: 'Consumer No', value: data.consumer_no || 'N/A' },
    { icon: Bolt, label: 'Sanctioned Load', value: `${data.sanctioned_load_kw || '-'} KW` },
    { icon: Plug, label: 'Connection', value: data.connection_type || 'N/A' },
  ];

  const solarMetrics = [
    { label: 'Avg. Monthly Units', value: avgUnits, unit: 'kWh', color: '#3b82f6' },
    { label: 'Required Capacity', value: kwValue, unit: 'KW', color: '#6abf2a' },
    { label: 'Solar Capacity', value: solarCapacity, unit: 'KW', color: '#f59e0b' },
    { label: 'Panels Needed', value: numPanels, unit: `× ${panelWatt}W`, color: '#ef4444' },
  ];

  return (
    <div className="results-panel">
      {/* Header */}
      <div className="results-panel__header">
        <div className="results-panel__header-left">
          <Sun size={20} className="results-panel__header-icon" />
          <h3>Solar Analysis Report</h3>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={onReset}>
          <RotateCcw size={14} />
          New
        </button>
      </div>

      {/* Consumer info */}
      <div className="results-info">
        {infoItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="results-info__item">
              <Icon size={15} className="results-info__icon" />
              <span className="results-info__label">{item.label}</span>
              <span className="results-info__value">{item.value}</span>
            </div>
          );
        })}
      </div>

      {/* Solar metrics cards */}
      <div className="solar-metrics">
        {solarMetrics.map((m, i) => (
          <motion.div
            key={m.label}
            className="solar-metric"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <span className="solar-metric__value" style={{ color: m.color }}>
              {m.value}
            </span>
            <span className="solar-metric__unit">{m.unit}</span>
            <span className="solar-metric__label">{m.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Monthly data table */}
      {monthlyData.length > 0 && (
        <div className="results-table-wrap">
          <div className="results-table-header">
            <Calendar size={15} />
            <span>Monthly Consumption ({monthlyData.length} months)</span>
          </div>
          <div className="results-table-scroll">
            <table className="results-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Month</th>
                  <th>Units</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((entry, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{entry.month}</td>
                    <td className="results-table__units">{entry.units}</td>
                    <td>
                      {entry.bill_amount != null
                        ? `₹${entry.bill_amount.toLocaleString()}`
                        : '—'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Download button */}
      <button
        className="btn btn--success btn--lg"
        onClick={onDownload}
        disabled={excelLoading}
        id="download-excel-btn"
      >
        {excelLoading ? (
          <>
            <Loader size={18} className="spin" />
            Generating...
          </>
        ) : (
          <>
            <Download size={18} />
            Download Excel Report
          </>
        )}
      </button>
    </div>
  );
}
