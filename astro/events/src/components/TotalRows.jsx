import React from 'react';
import { money, totalRows } from '../utils/tickets';

/** The order summary: subtotal, tax and fees, total. The hosted checkout shows the final amounts. */
export default function TotalRows({ invoice }) {
  return (
    <dl className="totals">
      {totalRows(invoice).map((row) => (
        <div key={row.label} className={row.total ? 'totals-row total' : 'totals-row'}>
          <dt>{row.label}</dt>
          <dd>{money(row.amount)}</dd>
        </div>
      ))}
    </dl>
  );
}
