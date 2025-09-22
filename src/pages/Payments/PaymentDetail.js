import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getPaymentById } from '../../api/payments';
import { findServiceByCode } from '../../constants/services';
import { useParams } from 'react-router-dom';

export default function PaymentDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    getPaymentById(id).then(res => setItem(res.data));
  }, [id]);

  if (!item) return <MainLayout><div>Loading...</div></MainLayout>;

  const serviceDef = findServiceByCode(item.serviceCode);
  const currency = item.priceCurrency || 'USD';

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Payment</h2>
      <div>Client: {item.clientId?.name || item.clientId || '-'}</div>
      <div>Service: {serviceDef ? serviceDef.name : (item.serviceType || '-')}</div>
      <div>Type: {item.type}</div>
      <div>Amount: {item.amount} {currency}</div>
      <div>Method: {item.method || '-'}</div>
      <div>Description: {item.description || '-'}</div>
      <div>Date: {item.date ? new Date(item.date).toLocaleDateString() : '-'}</div>
    </MainLayout>
  );
}
