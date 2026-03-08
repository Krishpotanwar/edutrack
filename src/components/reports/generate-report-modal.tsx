'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, Loader2, CheckCircle } from 'lucide-react';

type ReportType = 'Event Summary' | 'Volunteer Participation' | 'Impact Report' | 'Financial Overview';
type ReportFormat = 'PDF' | 'CSV';

interface GenerateReportModalProps {
  open: boolean;
  onClose: () => void;
}

const reportTypes: ReportType[] = [
  'Event Summary',
  'Volunteer Participation',
  'Impact Report',
  'Financial Overview',
];

const reportFormats: ReportFormat[] = ['PDF', 'CSV'];

export function GenerateReportModal({ open, onClose }: GenerateReportModalProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState<ReportType>('Event Summary');
  const [format, setFormat] = useState<ReportFormat>('PDF');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const resetForm = useCallback(() => {
    setTitle('');
    setStartDate('');
    setEndDate('');
    setReportType('Event Summary');
    setFormat('PDF');
    setStatus('idle');
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    // Reset after animation completes
    setTimeout(resetForm, 300);
  }, [onClose, resetForm]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setStatus('loading');
      setTimeout(() => setStatus('success'), 1500);
    },
    []
  );

  const labelClass = 'block text-sm font-medium text-foreground mb-1.5';
  const inputClass =
    'w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/30 transition-colors';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="glass-card relative z-10 w-full max-w-md !rounded-2xl !p-0 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Generate Report</h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {status === 'success' ? (
                <motion.div
                  className="flex flex-col items-center gap-4 py-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
                    <CheckCircle className="h-7 w-7 text-green-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">Report Generated!</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your &quot;{title || 'Untitled'}&quot; report is ready.
                    </p>
                  </div>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-purple-500 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Download {format}
                  </a>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Report Title */}
                  <div>
                    <label htmlFor="report-title" className={labelClass}>
                      Report Title
                    </label>
                    <input
                      id="report-title"
                      type="text"
                      required
                      placeholder="e.g. Q4 Volunteer Summary"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="report-start" className={labelClass}>
                        Start Date
                      </label>
                      <input
                        id="report-start"
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="report-end" className={labelClass}>
                        End Date
                      </label>
                      <input
                        id="report-end"
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Report Type */}
                  <div>
                    <label htmlFor="report-type" className={labelClass}>
                      Report Type
                    </label>
                    <select
                      id="report-type"
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value as ReportType)}
                      className={inputClass}
                    >
                      {reportTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Format */}
                  <div>
                    <label htmlFor="report-format" className={labelClass}>
                      Format
                    </label>
                    <select
                      id="report-format"
                      value={format}
                      onChange={(e) => setFormat(e.target.value as ReportFormat)}
                      className={inputClass}
                    >
                      {reportFormats.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
