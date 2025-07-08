import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
class EmailTemplates {
    static async loadTemplate(templateName, replacements) {
        try {
            const templatePath = join(__dirname, '..', 'views', 'emails', `${templateName}.html`);
            let template = await fs.readFile(templatePath, 'utf8');
            Object.keys(replacements).forEach(key => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                template = template.replace(regex, replacements[key]);
            });
            return template;
        }
        catch (error) {
            console.error('Error loading email template:', error);
            throw error;
        }
    }
}
export default EmailTemplates;
