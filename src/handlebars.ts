import { Handlebars } from "./deps.ts";

Handlebars.registerHelper("replace", function (find, replace, options) {
  // @ts-ignore - mald harder
  const str = options.fn(this);
  return str.replace(new RegExp(find, "g"), replace);
});

Handlebars.registerHelper("ifCond", function (v1, operator, v2, options) {
  switch (operator) {
    case "==":
      // @ts-ignore - mald harder
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case "===":
      // @ts-ignore - mald harder
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    case "!=":
      // @ts-ignore - mald harder
      return v1 != v2 ? options.fn(this) : options.inverse(this);
    case "!==":
      // @ts-ignore - mald harder
      return v1 !== v2 ? options.fn(this) : options.inverse(this);
    case "<":
      // @ts-ignore - mald harder
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    case "<=":
      // @ts-ignore - mald harder
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case ">":
      // @ts-ignore - mald harder
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case ">=":
      // @ts-ignore - mald harder
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    case "&&":
      // @ts-ignore - mald harder
      return v1 && v2 ? options.fn(this) : options.inverse(this);
    case "||":
      // @ts-ignore - mald harder
      return v1 || v2 ? options.fn(this) : options.inverse(this);
    default:
      // @ts-ignore - mald harder
      return options.inverse(this);
  }
});

export function renderPath(path: string, context: unknown): string {
	path = path.replaceAll("%%", "/");
	return Handlebars.compile(path)(context);
}

export function render(content: string, context: unknown): string {
	return Handlebars.compile(content)(context);
}
