import Image from "next/image";
import { Fragment, type ReactNode } from "react";
import {
  safeContentUrl,
  safeMediaUrl,
} from "@/lib/data/validation/post.validate";

type Node = Record<string, unknown>;
function object(value: unknown): Node {
  return value && typeof value === "object" ? (value as Node) : {};
}
function inline(value: unknown): ReactNode {
  if (!Array.isArray(value)) return null;
  return value.map((item, index) => {
    const node = object(item);
    if (node.type === "link") {
      const content = inline(node.content);
      return typeof node.href === "string" && safeContentUrl(node.href) ? (
        <a
          key={index}
          href={node.href}
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          {content}
        </a>
      ) : (
        <Fragment key={index}>{content}</Fragment>
      );
    }
    if (typeof node.text !== "string") return null;
    const styles = object(node.styles);
    let text: ReactNode = node.text;
    if (styles.bold) text = <strong>{text}</strong>;
    if (styles.italic) text = <em>{text}</em>;
    if (styles.underline) text = <u>{text}</u>;
    if (styles.strike) text = <s>{text}</s>;
    if (styles.code)
      text = <code className="rounded bg-muted px-1 font-mono">{text}</code>;
    return <Fragment key={index}>{text}</Fragment>;
  });
}
function blocks(value: unknown): ReactNode {
  if (!Array.isArray(value)) return null;
  const result: ReactNode[] = [];
  for (let index = 0; index < value.length; index++) {
    const node = object(value[index]);
    const props = object(node.props);
    const content = inline(node.content);
    const children = blocks(node.children);
    const key = index;
    if (node.type === "bulletListItem" || node.type === "numberedListItem") {
      const list = [];
      const type = node.type;
      do {
        const item = object(value[index]);
        list.push(
          <li key={index} className="pl-1">
            {inline(item.content)}
            {blocks(item.children)}
          </li>,
        );
        index++;
      } while (index < value.length && object(value[index]).type === type);
      index--;
      result.push(
        type === "bulletListItem" ? (
          <ul key={key} className="list-disc space-y-2 pl-6">
            {list}
          </ul>
        ) : (
          <ol
            key={key}
            className="list-decimal space-y-2 pl-6"
            start={typeof props.start === "number" ? props.start : undefined}
          >
            {list}
          </ol>
        ),
      );
      continue;
    }
    let body: ReactNode;
    switch (node.type) {
      case "heading": {
        const Tag = props.level === 1 ? "h2" : props.level === 2 ? "h3" : "h4";
        body = (
          <Tag className="mt-8 font-sans text-2xl font-bold">{content}</Tag>
        );
        break;
      }
      case "quote":
        body = (
          <blockquote className="border-l-4 pl-5 italic">{content}</blockquote>
        );
        break;
      case "codeBlock":
        body = (
          <pre className="overflow-x-auto rounded bg-muted p-4 text-sm">
            <code>
              {Array.isArray(node.content)
                ? node.content
                    .map((item) => String(object(item).text ?? ""))
                    .join("")
                : ""}
            </code>
          </pre>
        );
        break;
      case "divider":
        body = <hr />;
        break;
      case "checkListItem":
        body = (
          <p>
            <span aria-label={props.checked ? "Checked" : "Unchecked"}>
              {props.checked ? "☑" : "☐"}
            </span>{" "}
            {content}
          </p>
        );
        break;
      case "toggleListItem":
        body = (
          <details>
            <summary>{content}</summary>
            {children}
          </details>
        );
        break;
      case "table": {
        const table = object(node.content);
        body = (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                {Array.isArray(table.rows) &&
                  table.rows.map((row, i) => (
                    <tr key={i}>
                      {Array.isArray(object(row).cells) &&
                        (object(row).cells as unknown[]).map((cell, j) => (
                          <td key={j} className="border px-3 py-2">
                            {inline(
                              Array.isArray(cell) ? cell : object(cell).content,
                            )}
                          </td>
                        ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        );
        break;
      }
      case "image":
      case "video":
      case "audio":
      case "file": {
        const url =
          typeof props.url === "string" && safeMediaUrl(props.url)
            ? props.url
            : undefined;
        const caption = typeof props.caption === "string" ? props.caption : "";
        body = url ? (
          <figure>
            {/* External media is stored as a validated URL, never HTML. */}
            {node.type === "image" ? (
              <Image
                unoptimized
                src={url}
                alt={caption || String(props.name || "Article image")}
                width={1200}
                height={800}
                className="h-auto max-w-full rounded-lg"
              />
            ) : node.type === "video" ? (
              <video
                controls
                preload="metadata"
                src={url}
                className="max-w-full"
              />
            ) : node.type === "audio" ? (
              <audio controls preload="metadata" src={url} />
            ) : (
              <a
                href={url}
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {String(props.name || "Download file")}
              </a>
            )}
            {caption && (
              <figcaption className="text-sm text-muted-foreground">
                {caption}
              </figcaption>
            )}
          </figure>
        ) : null;
        break;
      }
      default:
        body = <p className="whitespace-pre-wrap">{content}</p>;
    }
    result.push(
      <Fragment key={key}>
        {body}
        {node.type !== "toggleListItem" && children}
      </Fragment>,
    );
  }
  return <div className="space-y-5">{result}</div>;
}
export function ArticleContent({ content }: { content: unknown[] }) {
  return blocks(content);
}
