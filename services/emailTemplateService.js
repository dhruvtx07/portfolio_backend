const { EmailTemplate } = require('../models');
const { sendStoreSignupEmail } = require('../utils/emailUtils');

class EmailTemplateService {

  async getEmailTemplate(templateType) {
    try {
      console.log("EmailTemplateService - inside getEmailTemplate", templateType);
      const emailTemplate = await EmailTemplate.findOne({ where: { type: templateType } });

      if (!emailTemplate) {
        throw Object.assign(new Error(`No page ID found for template: ${templateType}`), { 
          isOperational: true, 
          statusCode: 400 
        });
      }

      const pageId = emailTemplate.shopify_page_id;
      const subject = emailTemplate.subject;

      console.log("EmailTemplateService - fetching pageId", pageId);

      const data = await shopifyApiService.request('GET', `/pages/${pageId}.json`);
      const htmlTemplate = data.page.body_html;
      return {htmlTemplate, subject};
    } catch (error) {
      console.error('Error in getEmailTemplate: ', error);
      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error fetching email template: ' + (error?.message || ''),
        stack: error?.stack || ''
      };
    }
  }

  replacePlaceholders(html, data) {
    return html.replace(/\{\{([\w-]+)\}\}/g, (match, key) => data[key] !== undefined ? data[key] : match);
  }

  async toTitleCase(str) {
    return str
      ?.toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  async sendStoreSignupEmails({ user_email, user_first_name, user_last_name, storename, storeid }) {
    const linkToUser = `${process.env.WEBSITE_URL}/login`;
    const linkToAdmin = `${process.env.WEBSITE_URL}/login`;

    const {htmlTemplate, subject} = await this.getEmailTemplate('storesignup');
    const processedHtml = this.replacePlaceholders(htmlTemplate, {
      fullname: `${await this.toTitleCase(user_first_name)} ${await this.toTitleCase(user_last_name)}`,
      storename: await this.toTitleCase(storename),
      storeid,
      link: linkToUser
    });
    await sendStoreSignupEmail(user_email, subject, processedHtml);

    const {htmlTemplate: htmlTemplateAdmin, subject: subjectAdmin} = await this.getEmailTemplate('storesignupadmin');
    const processedHtmlAdmin = this.replacePlaceholders(htmlTemplateAdmin, {
      storename: await this.toTitleCase(storename),
      storeid,
      link: linkToAdmin
    });
    await sendStoreSignupEmail(process.env.ADMIN_EMAILS, subjectAdmin, processedHtmlAdmin);
  }

}

module.exports = new EmailTemplateService();