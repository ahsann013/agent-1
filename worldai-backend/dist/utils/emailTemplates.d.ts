declare class EmailTemplates {
    static loadTemplate(templateName: any, replacements: any): Promise<string>;
}
export default EmailTemplates;
