const fs = require('fs').promises;
const path = require('path');
const { Payment } = require('../models');

function formatReadableDate(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function logBalanceMismatchCSV({
  store_id,
  total_in,
  total_out,
  total_refund,
  live_balance,
  shopify_order_id,
  shopify_order_number,
  store_earned,
  store_refunded,
  store_paid,
  store_outstanding,
  context,
  amount
}) {
  try {
    const baseCsvPath = process.env.BALANCE_MISMATCH_CSV_PATH;
    if (!baseCsvPath) {
      console.warn('logBalanceMismatchCSV: BALANCE_MISMATCH_CSV_PATH environment variable is not defined.');
      return;
    }

    const dir = path.dirname(baseCsvPath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (e) {
      // Ignore if dir already exists
    }

    // Fetch all committed payments for this store
    const payments = await Payment.findAll({
      where: { store_id },
      order: [['id', 'DESC']]
    });

    // Create a unique file for this specific mismatch event to avoid mixing transactions of different events
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestampStr = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    const eventCsvPath = path.join(dir, `mismatch_store_${store_id}_${timestampStr}.csv`);

    let csvContent = '';

    // 1. Write Mismatch Summary metadata block
    csvContent += '--- MISMATCH SUMMARY ---\n';
    csvContent += `Timestamp,${formatReadableDate(new Date())}\n`;
    csvContent += `Store ID,${store_id || ''}\n`;
    csvContent += `Context,"${(context || '').replace(/"/g, '""')}"\n`;
    csvContent += `Problematic Shopify Order ID,${shopify_order_id || 'N/A'}\n`;
    csvContent += `Problematic Shopify Order Number,${shopify_order_number || 'N/A'}\n`;
    csvContent += `Store Earned Column,${store_earned !== undefined && store_earned !== null ? parseFloat(store_earned).toFixed(2) : '0.00'}\n`;
    csvContent += `Store Refunded Column,${store_refunded !== undefined && store_refunded !== null ? parseFloat(store_refunded).toFixed(2) : '0.00'}\n`;
    csvContent += `Store Paid Column,${store_paid !== undefined && store_paid !== null ? parseFloat(store_paid).toFixed(2) : '0.00'}\n`;
    csvContent += `Store Outstanding Column,${store_outstanding !== undefined && store_outstanding !== null ? parseFloat(store_outstanding).toFixed(2) : '0.00'}\n`;
    csvContent += `Payments SUM(IN),${total_in !== undefined && total_in !== null ? parseFloat(total_in).toFixed(2) : '0.00'}\n`;
    csvContent += `Payments SUM(OUT),${total_out !== undefined && total_out !== null ? parseFloat(total_out).toFixed(2) : '0.00'}\n`;
    csvContent += `Payments SUM(REFUND),${total_refund !== undefined && total_refund !== null ? parseFloat(total_refund).toFixed(2) : '0.00'}\n`;
    csvContent += `Payments Live Balance (SUM),${live_balance !== undefined && live_balance !== null ? parseFloat(live_balance).toFixed(2) : '0.00'}\n\n`;

    // 2. Write Payments Audit Trail Table
    csvContent += '--- STORE PAYMENTS AUDIT TRAIL ---\n';
    const headers = [
      'Payment ID',
      'Direction',
      'Shopify Order ID',
      'Shopify Order Number',
      'Amount',
      'Currency',
      'Balance After',
      'Created At',
      'Is Problematic?'
    ];

    const formatCSVRow = (arr) => arr.map(val => {
      const str = String(val === null || val === undefined ? '' : val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',');

    csvContent += formatCSVRow(headers) + '\n';

    const orderFound = payments.some(payment =>
      shopify_order_id && String(payment.shopify_order_id) === String(shopify_order_id)
    );

    if (shopify_order_id && !orderFound) {
      const inferredDirection =
        (context.includes('makeRefundPayment') || context.includes('REFUND')) ? 'REFUND' :
        (context.includes('InPayment') || context.includes('handleOrderCreate')) ? 'IN' :
        'OUT';

      const row = [
        'ROLLEDBACK_ATTEMPT',
        inferredDirection,
        shopify_order_id,
        shopify_order_number || 'N/A',
        amount !== undefined && amount !== null ? parseFloat(amount).toFixed(2) : '0.00',
        'USD',
        live_balance !== undefined && live_balance !== null ? parseFloat(live_balance).toFixed(2) : '0.00',
        formatReadableDate(new Date()),
        'YES (TRIGGERING ATTEMPT)'
      ];
      csvContent += formatCSVRow(row) + '\n';
    }

    for (const payment of payments) {
      const matchesProblematic = (shopify_order_id && String(payment.shopify_order_id) === String(shopify_order_id));
      const isProblematic = matchesProblematic ? 'YES' : 'NO';

      const row = [
        payment.id,
        payment.direction,
        payment.shopify_order_id,
        payment.shopify_order_number,
        payment.amount !== null ? parseFloat(payment.amount).toFixed(2) : '0.00',
        payment.currency,
        payment.balance_after !== null ? parseFloat(payment.balance_after).toFixed(2) : '0.00',
        payment.createdAt ? formatReadableDate(payment.createdAt) : '',
        isProblematic
      ];
      csvContent += formatCSVRow(row) + '\n';
    }

    await fs.writeFile(eventCsvPath, csvContent, 'utf8');
    console.log(`Successfully logged detailed mismatch and transactions to: ${eventCsvPath}`);
  } catch (error) {
    console.error('Error writing balance mismatch to CSV:', error);
  }
}

module.exports = {
  logBalanceMismatchCSV
};
