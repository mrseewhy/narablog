import * as z from "zod";

export function safeContentUrl(value: string): boolean {
  try {
    return ["https:", "http:", "mailto:"].includes(new URL(value).protocol);
  } catch {
    return (
      value.startsWith("/") &&
      !value.startsWith("//") &&
      !/[\\\u0000-\u0020]/.test(value)
    );
  }
}
export function safeMediaUrl(value: string): boolean {
  return (
    safeContentUrl(value) && !value.trim().toLowerCase().startsWith("mailto:")
  );
}
const styles = z.object({
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
  strike: z.boolean().optional(),
  code: z.boolean().optional(),
  textColor: z.string().max(50).optional(),
  backgroundColor: z.string().max(50).optional(),
});
const text = z.object({
  type: z.literal("text"),
  text: z.string(),
  styles: styles.optional(),
});
const inline = z.union([
  text,
  z.object({
    type: z.literal("link"),
    href: z.string().max(2048).refine(safeContentUrl, "Use a safe link URL."),
    content: z.array(text),
  }),
]);
export type PostBlock = {
  id?: string;
  type: string;
  props?: Record<string, string | number | boolean>;
  content?:
    | z.infer<typeof inline>[]
    | {
        type: "tableContent";
        rows: {
          cells: (
            | z.infer<typeof inline>[]
            | {
                type: "tableCell";
                content: z.infer<typeof inline>[];
                props?: Record<string, unknown>;
              }
          )[];
        }[];
        columnWidths?: (number | null)[];
        headerRows?: number;
        headerCols?: number;
      };
  children?: PostBlock[];
};
const block: z.ZodType<PostBlock> = z.lazy(() =>
  z
    .object({
      id: z.string().max(128).optional(),
      type: z.enum([
        "paragraph",
        "heading",
        "bulletListItem",
        "numberedListItem",
        "checkListItem",
        "toggleListItem",
        "quote",
        "codeBlock",
        "divider",
        "table",
        "image",
        "video",
        "audio",
        "file",
      ]),
      props: z
        .record(
          z.string(),
          z.union([z.string().max(2048), z.number().finite(), z.boolean()]),
        )
        .optional(),
      content: z
        .union([
          z.array(inline),
          z.object({
            type: z.literal("tableContent"),
            rows: z
              .array(
                z.object({
                  cells: z
                    .array(
                      z.union([
                        z.array(inline),
                        z.object({
                          type: z.literal("tableCell"),
                          content: z.array(inline),
                          props: z.record(z.string(), z.unknown()).optional(),
                        }),
                      ]),
                    )
                    .max(100),
                }),
              )
              .max(100),
            columnWidths: z.array(z.number().nullable()).optional(),
            headerRows: z.number().optional(),
            headerCols: z.number().optional(),
          }),
        ])
        .optional(),
      children: z.array(block).max(1000).optional(),
    })
    .superRefine((value, ctx) => {
      if (
        value.props?.url &&
        (typeof value.props.url !== "string" || !safeMediaUrl(value.props.url))
      )
        ctx.addIssue({ code: "custom", message: "Use a safe media URL." });
      if (
        value.type === "table" &&
        value.content &&
        Array.isArray(value.content)
      )
        ctx.addIssue({ code: "custom", message: "Invalid table content." });
      if (
        value.type !== "table" &&
        value.content &&
        !Array.isArray(value.content)
      )
        ctx.addIssue({ code: "custom", message: "Invalid block content." });
    }),
);
// Bound nesting and size before recursive parsing, including direct action calls.
function boundedDocument(value: unknown): boolean {
  try {
    if (JSON.stringify(value).length > 200000) return false;
    const walk = (node: unknown, depth: number): boolean =>
      depth <= 20 &&
      (!node ||
        typeof node !== "object" ||
        Object.values(node).every((v) => walk(v, depth + 1)));
    return walk(value, 0);
  } catch {
    return false;
  }
}
export const postSchema = z
  .object({
    id: z.uuid().optional(),
    title: z
      .string()
      .trim()
      .min(3, "Title must have at least 3 characters.")
      .max(200),
    categoryId: z.uuid("Select a category."),
    authorId: z
      .string()
      .max(128)
      .optional()
      .transform((value) => value || undefined),
    status: z.enum(["Draft", "Published"]),
    content: z
      .unknown()
      .refine(boundedDocument, "Post content is too large or deeply nested.")
      .pipe(z.array(block).min(1).max(1000)),
  })
  .superRefine((value, ctx) => {
    if (value.status === "Published" && !documentText(value.content).trim())
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: "Add article text before publishing.",
      });
  });
export function documentText(value: unknown): string {
  if (Array.isArray(value)) return value.map(documentText).join(" ");
  if (!value || typeof value !== "object") return "";
  const node = value as Record<string, unknown>;
  if (typeof node.text === "string") return node.text;
  return [
    documentText(node.content),
    documentText(node.children),
    documentText(node.rows),
    documentText(node.cells),
  ]
    .join(" ")
    .trim();
}
