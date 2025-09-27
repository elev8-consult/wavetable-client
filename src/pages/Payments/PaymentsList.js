import React, { useCallback, useEffect, useMemo, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import SearchFilter from '../../components/SearchFilter';
import { createPayment, getPaymentSummaries, updatePayment } from '../../api/payments';

const STATUS_LABELS = {
  unpaid: 'Unpaid',
  partial: 'Partially Paid',
  paid: 'Paid',
};

const STATUS_COLORS = {
  unpaid: '#ff4d4f',
  partial: '#faad14',
  paid: '#52c41a',
};

function safeDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = safeDate(value);
  return date ? date.toLocaleDateString() : '—';
}

function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined) return '—';
  const num = Number(amount);
  if (!Number.isFinite(num)) return `${amount}`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch (err) {
    return `${num.toFixed(2)} ${currency}`;
  }
}

function PaymentCard({ item, onRefresh, refreshing }) {
  const {
    client,
    service,
    bookingStartDate,
    createdAt,
    totalFee,
    totalPaid,
    balanceDue,
    priceCurrency,
    paymentStatus,
    payments = [],
  } = item;

  const displayDate = bookingStartDate || createdAt;
  const statusColor = STATUS_COLORS[paymentStatus] || '#888';
  const isSettled = (Number(balanceDue) || 0) <= 0.01;

  const [expanded, setExpanded] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addMethod, setAddMethod] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addError, setAddError] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editMethod, setEditMethod] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (expanded && !addAmount && !isSettled) {
      const preset = Number(balanceDue) || 0;
      if (preset > 0) setAddAmount(String(preset));
    }
  }, [expanded, addAmount, balanceDue, isSettled]);

  const resetAddForm = () => {
    setAddAmount('');
    setAddMethod('');
    setAddDescription('');
    setAddError('');
  };

  const resetEditForm = () => {
    setEditingPaymentId(null);
    setEditAmount('');
    setEditMethod('');
    setEditDescription('');
    setEditError('');
  };

  const handleAddPayment = async (event) => {
    event.preventDefault();
    const numericAmount = Number(addAmount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setAddError('Enter a valid payment amount greater than zero.');
      return;
    }
    setAddSaving(true);
    setAddError('');
    try {
      await createPayment({
        bookingId: item.bookingId,
        type: 'income',
        amount: numericAmount,
        method: addMethod || undefined,
        description: addDescription || undefined,
        priceCurrency,
      });
      resetAddForm();
      setExpanded(false);
      if (onRefresh) await onRefresh();
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      setAddError(apiMessage || 'Failed to record payment.');
    } finally {
      setAddSaving(false);
    }
  };

  const handlePaymentClick = (payment) => {
    setEditingPaymentId(payment._id);
    setEditAmount(String(payment.amount ?? ''));
    setEditMethod(payment.method || '');
    setEditDescription(payment.description || '');
    setEditError('');
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    const numericAmount = Number(editAmount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setEditError('Enter a valid payment amount greater than zero.');
      return;
    }
    if (!editingPaymentId) return;
    setEditSaving(true);
    setEditError('');
    try {
      await updatePayment(editingPaymentId, {
        amount: numericAmount,
        method: editMethod || undefined,
        description: editDescription || undefined,
      });
      resetEditForm();
      if (onRefresh) await onRefresh();
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      setEditError(apiMessage || 'Failed to update payment.');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div
      style={{
        border: '1px solid #1f1f1f',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        background: '#0b0b0b',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            {client?.name || 'Unknown client'}
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>
            {service?.name || service?.type || 'Service'} • {formatDate(displayDate)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              background: statusColor,
              color: '#fff',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {STATUS_LABELS[paymentStatus] || paymentStatus || 'Unknown'}
          </span>
          <button
            type="button"
            onClick={() => {
              const next = !expanded;
              setExpanded(next);
              if (!next) {
                resetAddForm();
                resetEditForm();
              }
            }}
            style={{
              background: '#1f1f1f',
              border: '1px solid #2f2f2f',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            {expanded ? 'Close' : 'Manage'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#888' }}>Total Due</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{formatCurrency(totalFee, priceCurrency)}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#888' }}>Paid</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{formatCurrency(totalPaid, priceCurrency)}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#888' }}>Remaining</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{formatCurrency(balanceDue, priceCurrency)}</div>
        </div>
      </div>

      {expanded ? (
        <div>
          {!isSettled ? (
            <form onSubmit={handleAddPayment} style={{ marginBottom: 16, background: '#131313', padding: 12, borderRadius: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Record Payment</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', flexDirection: 'column', flex: '1 1 140px', fontSize: 12, color: '#999' }}>
                  Amount
                  <input
                    type="number"
                    step="0.01"
                    value={addAmount}
                    onChange={e => setAddAmount(e.target.value)}
                    style={{
                      marginTop: 4,
                      padding: '6px 8px',
                      borderRadius: 4,
                      border: '1px solid #2f2f2f',
                      background: '#0b0b0b',
                      color: '#fff',
                    }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', flex: '1 1 140px', fontSize: 12, color: '#999' }}>
                  Method
                  <input
                    value={addMethod}
                    onChange={e => setAddMethod(e.target.value)}
                    placeholder="Cash / Card / Transfer"
                    style={{
                      marginTop: 4,
                      padding: '6px 8px',
                      borderRadius: 4,
                      border: '1px solid #2f2f2f',
                      background: '#0b0b0b',
                      color: '#fff',
                    }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', flex: '1 1 240px', fontSize: 12, color: '#999' }}>
                  Notes
                  <input
                    value={addDescription}
                    onChange={e => setAddDescription(e.target.value)}
                    placeholder="Optional details"
                    style={{
                      marginTop: 4,
                      padding: '6px 8px',
                      borderRadius: 4,
                      border: '1px solid #2f2f2f',
                      background: '#0b0b0b',
                      color: '#fff',
                    }}
                  />
                </label>
              </div>
              {addError ? <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 8 }}>{addError}</div> : null}
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button
                  type="submit"
                  disabled={addSaving || refreshing}
                  style={{
                    background: '#39ff14',
                    color: '#000',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 6,
                    cursor: addSaving || refreshing ? 'not-allowed' : 'pointer',
                    opacity: addSaving || refreshing ? 0.6 : 1,
                  }}
                >
                  {addSaving ? 'Saving...' : 'Add Payment'}
                </button>
                <button
                  type="button"
                  onClick={() => resetAddForm()}
                  style={{
                    background: 'transparent',
                    color: '#bbb',
                    border: '1px solid #2f2f2f',
                    padding: '8px 16px',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              </div>
            </form>
          ) : null}

          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Payment History</div>
          {payments.length === 0 ? (
            <div style={{ fontSize: 14, color: '#bbb' }}>No payments recorded yet.</div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {payments.map(payment => {
                const signedAmount = payment.type === 'expense'
                  ? -Math.abs(payment.amount || 0)
                  : payment.amount;
                const isEditing = editingPaymentId === payment._id;
                return (
                  <li
                    key={payment._id}
                    style={{
                      padding: '6px 0',
                      borderBottom: '1px solid #161616',
                    }}
                  >
                    {isEditing ? (
                      <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <label style={{ display: 'flex', flexDirection: 'column', flex: '1 1 140px', fontSize: 12, color: '#999' }}>
                            Amount
                            <input
                              type="number"
                              step="0.01"
                              value={editAmount}
                              onChange={e => setEditAmount(e.target.value)}
                              style={{
                                marginTop: 4,
                                padding: '6px 8px',
                                borderRadius: 4,
                                border: '1px solid #2f2f2f',
                                background: '#0b0b0b',
                                color: '#fff',
                              }}
                            />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', flex: '1 1 140px', fontSize: 12, color: '#999' }}>
                            Method
                            <input
                              value={editMethod}
                              onChange={e => setEditMethod(e.target.value)}
                              style={{
                                marginTop: 4,
                                padding: '6px 8px',
                                borderRadius: 4,
                                border: '1px solid #2f2f2f',
                                background: '#0b0b0b',
                                color: '#fff',
                              }}
                            />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', flex: '1 1 240px', fontSize: 12, color: '#999' }}>
                            Notes
                            <input
                              value={editDescription}
                              onChange={e => setEditDescription(e.target.value)}
                              style={{
                                marginTop: 4,
                                padding: '6px 8px',
                                borderRadius: 4,
                                border: '1px solid #2f2f2f',
                                background: '#0b0b0b',
                                color: '#fff',
                              }}
                            />
                          </label>
                        </div>
                        {editError ? <div style={{ color: '#ff4d4f', fontSize: 12 }}>{editError}</div> : null}
                        <div style={{ display: 'flex', gap: 12 }}>
                          <button
                            type="submit"
                            disabled={editSaving || refreshing}
                            style={{
                              background: '#39ff14',
                              color: '#000',
                              border: 'none',
                              padding: '6px 14px',
                              borderRadius: 6,
                              cursor: editSaving || refreshing ? 'not-allowed' : 'pointer',
                              opacity: editSaving || refreshing ? 0.6 : 1,
                            }}
                          >
                            {editSaving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => resetEditForm()}
                            style={{
                              background: 'transparent',
                              color: '#bbb',
                              border: '1px solid #2f2f2f',
                              padding: '6px 14px',
                              borderRadius: 6,
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePaymentClick(payment)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          width: '100%',
                          textAlign: 'left',
                          padding: 0,
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: 14 }}>
                          {formatCurrency(signedAmount, payment.priceCurrency || priceCurrency)}
                        </div>
                        <div style={{ fontSize: 12, color: '#777' }}>
                          {formatDate(payment.date)} • {payment.type}{payment.method ? ` • ${payment.method}` : ''}
                        </div>
                        {payment.description ? (
                          <div style={{ fontSize: 12, color: '#999' }}>{payment.description}</div>
                        ) : null}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function PaymentsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummaries = useCallback(async (withSpinner = false) => {
    if (withSpinner) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await getPaymentSummaries();
      setItems(res.data?.items || []);
      setError('');
    } catch (_) {
      setError('Failed to load payment summaries');
    } finally {
      if (withSpinner) setLoading(false);
      else setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSummaries(true);
  }, [fetchSummaries]);

  const filtered = useMemo(() => {
    if (!query) return items;
    const lower = query.toLowerCase();
    return items.filter(item => {
      const clientName = item.client?.name || '';
      const serviceName = item.service?.name || '';
      return `${clientName} ${serviceName}`.toLowerCase().includes(lower);
    });
  }, [items, query]);

  const outstanding = filtered.filter(item => item.paymentStatus !== 'paid');
  const settled = filtered.filter(item => item.paymentStatus === 'paid');

  const outstandingTotal = outstanding.reduce((sum, item) => sum + (Number(item.balanceDue) || 0), 0);
  const defaultCurrency = outstanding[0]?.priceCurrency || settled[0]?.priceCurrency || 'USD';

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Payments</h2>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <>
          <SearchFilter value={query} onChange={setQuery} placeholder="Search by client or service" />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#666' }}>
              {refreshing ? 'Refreshing…' : 'Click a booking to record or edit payments.'}
            </div>
            <button
              type="button"
              onClick={() => fetchSummaries(false)}
              disabled={refreshing}
              style={{
                background: '#1f1f1f',
                border: '1px solid #2f2f2f',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: 6,
                cursor: refreshing ? 'not-allowed' : 'pointer',
                opacity: refreshing ? 0.6 : 1,
              }}
            >
              Refresh
            </button>
          </div>

          <div style={{
            marginBottom: 24,
            padding: 16,
            borderRadius: 8,
            background: '#111',
            border: '1px solid #1f1f1f',
          }}>
            <div style={{ fontSize: 12, color: '#888' }}>Outstanding Balance</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              {formatCurrency(outstandingTotal, defaultCurrency)}
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              {outstanding.length} booking{outstanding.length === 1 ? '' : 's'} awaiting payment.
            </div>
          </div>

          <section style={{ marginBottom: 32 }}>
            <h3 style={{ color: '#fff', marginBottom: 12 }}>Outstanding</h3>
            {outstanding.length === 0 ? (
              <div style={{ color: '#888' }}>No unpaid or partially paid bookings.</div>
            ) : (
              outstanding.map(item => (
                <PaymentCard
                  key={item.bookingId}
                  item={item}
                  onRefresh={() => fetchSummaries(false)}
                  refreshing={refreshing}
                />
              ))
            )}
          </section>

          <section>
            <h3 style={{ color: '#fff', marginBottom: 12 }}>Paid</h3>
            {settled.length === 0 ? (
              <div style={{ color: '#888' }}>No fully paid bookings yet.</div>
            ) : (
              settled.map(item => (
                <PaymentCard
                  key={item.bookingId}
                  item={item}
                  onRefresh={() => fetchSummaries(false)}
                  refreshing={refreshing}
                />
              ))
            )}
          </section>
        </>
      )}
    </MainLayout>
  );
}
