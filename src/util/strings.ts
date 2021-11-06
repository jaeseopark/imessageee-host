export const fill = (template: string, params: { [keyword: string]: string }) => template.replace(/%\w+%/g, (keyword) => params[keyword] || keyword);
