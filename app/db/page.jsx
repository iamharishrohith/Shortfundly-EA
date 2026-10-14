"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Database,
  Table,
  Search,
  RefreshCw,
  ArrowLeft,
  FileSpreadsheet,
  Download,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  HardDrive
} from "lucide-react";

export default function DatabaseViewerPage() {
  const [currentTable, setCurrentTable] = useState("active_colleges");
  const [tables, setTables] = useState([]);
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dbMeta, setDbMeta] = useState(null);

  const fetchTableData = async (tbl = currentTable, pg = page, lmt = limit, q = search) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/db?table=${encodeURIComponent(tbl)}&page=${pg}&limit=${lmt}&search=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setTables(data.tables || []);
        setColumns(data.columns || []);
        setRows(data.rows || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
        setDbMeta(data.dbMeta || null);
      }
    } catch (e) {
      console.error("Failed to fetch table data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData(currentTable, page, limit, search);
  }, [currentTable, page, limit]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTableData(currentTable, 1, limit, search);
  };

  const handleTableChange = (tbl) => {
    setCurrentTable(tbl);
    setPage(1);
    setSearch("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "24px 32px", fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)" }}>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "12px" }}
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </button>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/images/shortfundly-logo.png?v=2" alt="Shortfundly" style={{ height: "40px", width: "auto" }} />
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                SQLITE LIVE LEDGER EXPLORER
              </div>
              <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Local Database Administration Portal
              </h1>
            </div>
          </div>
        </div>

        {/* Database Engine Telemetry */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {dbMeta && (
            <>
              <span className="chip chip-active" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <HardDrive size={12} />
                <span>WAL MODE: {dbMeta.journalMode.toUpperCase()}</span>
              </span>
              <span className="chip" style={{ background: "#e0f2fe", color: "#0369a1", borderColor: "#bae6fd", display: "flex", alignItems: "center", gap: "4px" }}>
                <ShieldCheck size={12} />
                <span>INTEGRITY: {dbMeta.integrity.toUpperCase()}</span>
              </span>
              <span className="chip" style={{ background: "#f1f5f9", color: "#475569", borderColor: "#e2e8f0" }}>
                SIZE: {dbMeta.fileSizeFormatted}
              </span>
            </>
          )}
          <Link href="/api/colleges/download-master-csv" style={{ textDecoration: "none" }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "12px" }}
            >
              <Download size={13} />
              <span>Master CSV</span>
            </button>
          </Link>
          <Link href="/api/reports/export" style={{ textDecoration: "none" }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "12px" }}
            >
              <FileSpreadsheet size={13} />
              <span>Excel Export</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)", overflow: "hidden" }}>
        {/* Table Selector Tabs */}
        <div style={{ padding: "14px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginRight: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
              <Layers size={13} />
              <span>Tables:</span>
            </span>
            {tables.map((t) => {
              const active = currentTable === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTableChange(t)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: active ? "1px solid #0f172a" : "1px solid #cbd5e1",
                    background: active ? "#0f172a" : "#ffffff",
                    color: active ? "#ffffff" : "#334155",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease"
                  }}
                >
                  <Table size={12} style={{ color: active ? "#e11d48" : "#64748b" }} />
                  <span>{t}</span>
                </button>
              );
            })}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                className="input-text"
                placeholder={`Search ${currentTable}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "32px", fontSize: "12px", height: "34px", width: "220px" }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-secondary"
              style={{ height: "34px", padding: "0 12px", fontSize: "12px" }}
            >
              Filter
            </button>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
                fetchTableData(currentTable, 1, limit, "");
              }}
              className="btn btn-secondary"
              style={{ height: "34px", padding: "0 10px" }}
              title="Refresh Table"
            >
              <RefreshCw size={13} className={loading ? "spin" : ""} />
            </button>
          </form>
        </div>

        {/* Table Stats Bar */}
        <div style={{ padding: "10px 20px", background: "#ffffff", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "#64748b" }}>
          <div>
            Showing <strong>{rows.length}</strong> of <strong>{totalCount.toLocaleString()}</strong> records in <code>{currentTable}</code>
            {search && <span> (filtered by "{search}")</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              style={{ padding: "3px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#334155" }}
            >
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Data Grid Table */}
        <div style={{ overflowX: "auto", minHeight: "360px" }}>
          {loading ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "#64748b" }}>
              <RefreshCw size={24} className="spin" style={{ margin: "0 auto 12px auto", color: "#e11d48" }} />
              <div>Loading records from {currentTable}...</div>
            </div>
          ) : rows.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "#94a3b8" }}>
              <Database size={32} style={{ margin: "0 auto 12px auto", opacity: 0.5 }} />
              <div>No records found in table <strong>{currentTable}</strong>.</div>
            </div>
          ) : (
            <table className="colleges-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  {columns.map((c) => (
                    <th
                      key={c.cid}
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontWeight: 700,
                        color: "#334155",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        whiteSpace: "nowrap"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span>{c.name}</span>
                        {c.pk === 1 && <span style={{ fontSize: "9px", background: "#fee2e2", color: "#b91c1c", padding: "1px 4px", borderRadius: "3px" }}>PK</span>}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr
                    key={row.id || rIdx}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      background: rIdx % 2 === 1 ? "#fafbfd" : "#ffffff"
                    }}
                  >
                    {columns.map((col) => {
                      const val = row[col.name];
                      const valStr = val !== null && val !== undefined ? String(val) : "";
                      const isEmail = col.name.includes("email");
                      const isUrl = col.name.includes("url");
                      const isStatus = col.name.includes("status");

                      return (
                        <td
                          key={col.cid}
                          style={{
                            padding: "10px 14px",
                            color: "#0f172a",
                            maxWidth: "320px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                          title={valStr}
                        >
                          {isEmail && valStr ? (
                            <span style={{ color: "#0284c7", fontWeight: 600 }}>{valStr}</span>
                          ) : isUrl && valStr.startsWith("http") ? (
                            <a
                              href={valStr}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#2563eb", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                            >
                              <span>{valStr.replace(/^https?:\/\//, "")}</span>
                              <ExternalLink size={10} />
                            </a>
                          ) : isStatus && valStr ? (
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "9999px",
                                background: valStr.includes("VERIFIED") || valStr === "SUCCESS" || valStr === "SENT" ? "#dcfce7" : "#fee2e2",
                                color: valStr.includes("VERIFIED") || valStr === "SUCCESS" || valStr === "SENT" ? "#166534" : "#991b1b"
                              }}
                            >
                              {valStr}
                            </span>
                          ) : (
                            <span>{valStr || <em style={{ color: "#cbd5e1" }}>NULL</em>}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div style={{ padding: "12px 20px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="btn btn-secondary"
              style={{ padding: "6px 10px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <ChevronLeft size={13} />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="btn btn-secondary"
              style={{ padding: "6px 10px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
