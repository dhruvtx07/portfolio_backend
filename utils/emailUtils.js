const nodemailer = require('nodemailer');

const sendErrorEmail = async (subject, error) => {
  try {
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_API_KEY,
        },
      });

      if (subject.includes('app.js')) {
        error = {
          ...error,
          error_code: error.error_code || 'DB_CONNECTION_ERROR or Server Error',
          request_path: error.request_path || 'Server or Database Error',
          device: error.device || 'Server',
          ip_address: error.ip_address || process.env.HOST_IP || '127.0.0.1',
          user_agent: error.user_agent || 'Server/Database',
          error_message: error.error_message || error.message || 'Database Connection Failed',
          error_stack: error.error_stack || error.stack || 'No stack trace available'
        };
      }

      await transporter.sendMail({
        from: process.env.SENDGRID_ADMIN_EMAIL_FROM || 'your_email@example.com',
        to: process.env.ERROR_EMAIL_TO || 'admin_email@example.com',
        subject: subject,
        html: `    
          <div style="${subject?.includes('app.js') ? 'background-color: #fff; border: 2px solid #ffeeba;' : 'background-color: #f8f9fa; border: 1px solid #ddd;'} border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: ${subject?.includes('app.js') ? '#cc0000' : '#333333'}; 
                      background-color: ${subject?.includes('app.js') ? '#ffe8e8' : '#e9ecef'}; 
                      padding: 15px; 
                      border-radius: 5px 5px 0 0; 
                      text-align: center; 
                      margin: 0;
                      font-weight: bold;
                      border-bottom: ${subject?.includes('app.js') ? '2px solid #ff0000' : '1px solid #ddd'};
                      text-transform: uppercase;">
              ${subject?.includes('app.js') ? '⚠️ ' : ''}Error Report${subject?.includes('app.js') ? ' - App.js Error ⚠️' : ''}
            </h2>
            <div style="font-family: Arial, sans-serif; padding: 20px;">


                <div style="font-family: Arial, sans-serif; padding: 20px;">
                  <h3>Basic Information</h3>
                  <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
                    <tr>
                      <td style="padding: 8px; border: 1px solid #ddd;"><strong>Timestamp:</strong></td>
                      <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toISOString()}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; border: 1px solid #ddd;"><strong>User ID:</strong></td>
                      <td style="padding: 8px; border: 1px solid #ddd;">${error.user_id || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; border: 1px solid #ddd;"><strong>Error Code:</strong></td>
                      <td style="padding: 8px; border: 1px solid #ddd;">${error.error_code || error.code || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; border: 1px solid #ddd;"><strong>Request Path:</strong></td>
                      <td style="padding: 8px; border: 1px solid #ddd;">${error.request_path || 'N/A'}</td>
                    </tr>
                  </table>

                  <h3>Error Details</h3>
                  <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p><strong>Message:</strong> ${error.error_message || error.message || 'Unknown Error'}</p>
                    <p><strong>Name:</strong> ${error.name || 'N/A'}</p>
                    ${error.errors ? `<p><strong>Validation Errors:</strong> ${JSON.stringify(error.errors, null, 2)}</p>` : ''}
                  </div>

                  <h3>Stack Trace</h3>
                  <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; white-space: pre-wrap;">${error.error_stack || error.stack || 'No stack trace available'}</pre>

                  <h3>Client Information</h3>
                  <table style="border-collapse: collapse; width: 100%;">
                    <tr>
                      <td style="padding: 8px; border: 1px solid #ddd;"><strong>IP Address:</strong></td>
                      <td style="padding: 8px; border: 1px solid #ddd;">${error.ip_address || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; border: 1px solid #ddd;"><strong>Device:</strong></td>
                      <td style="padding: 8px; border: 1px solid #ddd;">${error.device || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; border: 1px solid #ddd;"><strong>User Agent:</strong></td>
                      <td style="padding: 8px; border: 1px solid #ddd;">${error.user_agent || 'N/A'}</td>
                    </tr>
                  </table>
                </div>
        `,
        text: `Error Report
        Timestamp: ${new Date().toISOString()}
        User ID: ${error.user_id || 'N/A'}
        Error Code: ${error.error_code || error.code || 'N/A'}
        Request Path: ${error.request_path || 'N/A'}

        Error Details:
        Message: ${error.error_message || error.message || 'Unknown Error'}
        Name: ${error.name || 'N/A'}
        ${error.errors ? `Validation Errors: ${JSON.stringify(error.errors, null, 2)}` : ''}

        Stack Trace:
        ${error.error_stack || error.stack || 'No stack trace available'}

        Client Information:
        IP Address: ${error.ip_address || 'N/A'}
        Device: ${error.device || 'N/A'}
        User Agent: ${error.user_agent || 'N/A'}`
        });
        console.log(`Error email sent successfully to admin at ${process.env.ERROR_EMAIL_TO}`);
      } catch (error) {
        console.error('Error sending error email:', error);
      }
};

  const sendResetPasswordEmail = async (to, subject, html) => {
    try {
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_API_KEY,
        },
      });
      console.log("EmailUtils - inside sendResetPasswordEmail, ", {
        from: process.env.SENDGRID_ADMIN_EMAIL_FROM,
        to,
        subject,
        html
      });

      await transporter.sendMail({
        from: process.env.SENDGRID_ADMIN_EMAIL_FROM,
        to,
        subject,
        html,
        headers: {
          'X-SMTPAPI': JSON.stringify({
            filters: {
              clicktrack: { settings: { enable: 0 } },
              opentrack: { settings: { enable: 0 } }
            }
          })
        }
      });

      console.log(`Reset password email sent to ${to}`);
    } catch (error) {
      console.error('Error sending reset password email:', error);
      throw error;
    }
  };

  const sendStoreSignupEmail = async (to, subject, html) => {
    try {
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_API_KEY,
        },
      });

      console.log("EmailUtils - inside sendStoreSignupEmail, ", {
        from: process.env.SENDGRID_ADMIN_EMAIL_FROM,
        to,
        subject,
        html
      });

      await transporter.sendMail({
        from: process.env.SENDGRID_ADMIN_EMAIL_FROM,
        to,
        subject,
        html,
        headers: {
          'X-SMTPAPI': JSON.stringify({
            filters: {
              clicktrack: { settings: { enable: 0 } },
              opentrack: { settings: { enable: 0 } }
            }
          })
        }
      });

      console.log(`signup email sent to ${to}`);
    } catch (error) {
      console.error('Error sending registration email:', error);
      throw error;
    }
  };

  const sendStoreStatusChangeEmail = async (to, subject, html) => {
    try {
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_API_KEY,
        },
      });
      console.log("EmailUtils - inside sendStoreStatusChangeEmail, ", {
        from: process.env.SENDGRID_ADMIN_EMAIL_FROM,
        to,
        subject,
        html
      });

      await transporter.sendMail({
        from: process.env.SENDGRID_ADMIN_EMAIL_FROM,
        to,
        subject,
        html,
        headers: {
          'X-SMTPAPI': JSON.stringify({
            filters: {
              clicktrack: { settings: { enable: 0 } },
              opentrack: { settings: { enable: 0 } }
            }
          })
        }
      });

      console.log(`status change confirmation email sent to ${to}`);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw error;
    }
  };


const sendOrderReconciliationEmail = async (to, summary, details) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_API_KEY,
      },
    });

    const fmt = d => new Date(d).toLocaleString('en-GB', { timeZone: 'UTC', hour12: false });
    const badge = (n, colour) =>
      `<span style="background:${colour};color:#fff;padding:2px 8px;border-radius:3px;font-weight:bold;">${n}</span>`;

    const hasIssues = summary.missing_count > 0 || summary.state_mismatch_count > 0 || summary.failed_count > 0;
    const headerColour = summary.failed_count > 0 ? '#c0392b' : hasIssues ? '#e67e22' : '#27ae60';
    const statusText   = summary.failed_count > 0
      ? 'ACTION REQUIRED'
      : hasIssues
        ? (summary.sync_enabled ? 'ISSUES FOUND & AUTO-HEALED' : 'ISSUES FOUND — SYNC DISABLED')
        : 'ALL CLEAR';

    const rowStyle = 'padding:8px 12px;border:1px solid #ddd;';

    // Summary table
    const summaryRows = [
      ['Period',              `${fmt(summary.since)} → ${fmt(summary.now)} (UTC)`],
      ['Sync mode',           summary.sync_enabled ? '✔ Enabled (auto-heal on)' : '✘ Disabled (report only)'],
      ['Shopify orders (24h)', summary.shopify_total],
      ['DB orders (total)',    summary.db_total],
      ['Direct/skipped',       summary.direct_skipped],
      ['Missing store orders', summary.missing_count],
      ['State mismatches',     summary.state_mismatch_count],
      ['Auto-processed',       summary.sync_enabled ? summary.processed_count : 'n/a (sync off)'],
      ['Failed to process',    summary.sync_enabled ? summary.failed_count    : 'n/a (sync off)'],
    ].map(([k, v]) => `<tr><td style="${rowStyle}"><strong>${k}</strong></td><td style="${rowStyle}">${v}</td></tr>`).join('');

    // Missing orders table
    const missingRows = details.missing.length
      ? details.missing.map(m =>
          `<tr>
            <td style="${rowStyle}">${m.shopify_order_id}</td>
            <td style="${rowStyle}">${m.name}</td>
            <td style="${rowStyle}">${m.events.join(', ')}</td>
          </tr>`
        ).join('')
      : `<tr><td colspan="3" style="${rowStyle}font-style:italic;color:#888;">None</td></tr>`;

    // State mismatch table
    const mismatchRows = details.stateMismatch.length
      ? details.stateMismatch.map(m =>
          `<tr>
            <td style="${rowStyle}">${m.shopify_order_id}</td>
            <td style="${rowStyle}">${m.name}</td>
            <td style="${rowStyle}">${m.diffs.join('<br>')}</td>
          </tr>`
        ).join('')
      : `<tr><td colspan="3" style="${rowStyle}font-style:italic;color:#888;">None</td></tr>`;

    // Failures table
    const failureRows = details.failed.length
      ? details.failed.map(f =>
          `<tr>
            <td style="${rowStyle}">${f.shopify_order_id}</td>
            <td style="${rowStyle}">${f.name}</td>
            <td style="${rowStyle};color:#c0392b;">${f.error}</td>
          </tr>`
        ).join('')
      : `<tr><td colspan="3" style="${rowStyle}font-style:italic;color:#888;">None</td></tr>`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:900px;margin:0 auto;">
        <div style="background:${headerColour};color:#fff;padding:20px;border-radius:6px 6px 0 0;text-align:center;">
          <h2 style="margin:0;font-size:20px;">Order Reconciliation Report — ${statusText}</h2>
          <p style="margin:6px 0 0;font-size:13px;">${fmt(summary.now)} UTC</p>
        </div>
        <div style="padding:20px;border:1px solid #ddd;border-top:none;border-radius:0 0 6px 6px;">

          <h3 style="margin-top:0;">Summary</h3>
          <table style="border-collapse:collapse;width:100%;margin-bottom:24px;">${summaryRows}</table>

          <h3>Missing Store Orders <small style="font-weight:normal;color:#888;">(in Shopify, not in DB — auto-processed)</small></h3>
          <table style="border-collapse:collapse;width:100%;margin-bottom:24px;">
            <thead><tr>
              <th style="${rowStyle}background:#f5f5f5;">Shopify Order ID</th>
              <th style="${rowStyle}background:#f5f5f5;">Order Name</th>
              <th style="${rowStyle}background:#f5f5f5;">Events (last 24h)</th>
            </tr></thead>
            <tbody>${missingRows}</tbody>
          </table>

          <h3>State Mismatches <small style="font-weight:normal;color:#888;">(in DB but out of sync — auto-synced)</small></h3>
          <table style="border-collapse:collapse;width:100%;margin-bottom:24px;">
            <thead><tr>
              <th style="${rowStyle}background:#f5f5f5;">Shopify Order ID</th>
              <th style="${rowStyle}background:#f5f5f5;">Order Name</th>
              <th style="${rowStyle}background:#f5f5f5;">Differences</th>
            </tr></thead>
            <tbody>${mismatchRows}</tbody>
          </table>

          <h3 style="color:#c0392b;">Processing Failures <small style="font-weight:normal;color:#888;">(manual action required)</small></h3>
          <table style="border-collapse:collapse;width:100%;margin-bottom:24px;">
            <thead><tr>
              <th style="${rowStyle}background:#fff0f0;">Shopify Order ID</th>
              <th style="${rowStyle}background:#fff0f0;">Order Name</th>
              <th style="${rowStyle}background:#fff0f0;">Error</th>
            </tr></thead>
            <tbody>${failureRows}</tbody>
          </table>

          <p style="font-size:12px;color:#aaa;margin-top:24px;border-top:1px solid #eee;padding-top:12px;">
            Note: Refund commission adjustments for auto-processed orders may need manual verification
            if the order had partial refunds before being recovered.
          </p>
        </div>
      </div>`;

    await transporter.sendMail({
      from: process.env.SENDGRID_ADMIN_EMAIL_FROM || process.env.ERROR_EMAIL_FROM,
      to,
      subject: `[${statusText}] Order Reconciliation Report — ${fmt(summary.now)} UTC`,
      html,
    });

    console.log(`Order reconciliation email sent to ${to}`);
  } catch (error) {
    console.error('Error sending order reconciliation email:', error);
  }
};
/*
const sendBalanceMismatchEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_API_KEY,
      },
    });



    await transporter.sendMail({
      from: process.env.SENDGRID_ADMIN_EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log(`Balance mismatch email sent`);
  } catch (error) {
    console.error('Error sending balance mismatch email:', error);
  }
};
*/
module.exports = {
  sendErrorEmail,
  sendStoreStatusChangeEmail,
  sendResetPasswordEmail,
  sendStoreSignupEmail,
  sendOrderReconciliationEmail,
  //sendBalanceMismatchEmail,
};