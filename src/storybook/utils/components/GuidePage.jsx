import { Markdown } from "@storybook/addon-docs/blocks";

import pkg from "../../../../package.json";

// Repository web root, from package.json "bugs.url" (".../smartcommon/-/issues").
const REPO_URL = (pkg.bugs?.url ?? "").replace(/\/-\/issues\/?$/, "");
const REPO_BRANCH = "1.0";

// Storybook id of a guide page: its title is "Guides/<file name>".
const guideDocsHref = (name, hash = "") => `./?path=/docs/guides-${name.toLowerCase()}--documentation${hash}`;

// Resolves "../src/lib/x.js" (relative to docs/) to "src/lib/x.js".
const resolveFromDocs = (href) => {
    const parts = ["docs"];
    for (const part of href.split("/")) {
        if (part === "..") parts.pop();
        else if (part !== "." && part !== "") parts.push(part);
    }
    return parts.join("/");
};

/**
 * Link of a guide rendered in Storybook. The guides link each other as
 * "offline.md" and the sources as "../src/...": both are relative to the
 * docs/ folder, which does not exist on the published site. A guide link
 * opens the guide page; a source link opens the file on the forge.
 */
export const GuideLink = ({ href = "", children, ...rest }) => {
    const guide = href.match(/^(?:\.\/)?([\w-]+)\.md(#.*)?$/);
    if (guide) {
        return <a {...rest} href={guideDocsHref(guide[1], guide[2] ?? "")} target="_top">{children}</a>;
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("#")) {
        return <a {...rest} href={href}>{children}</a>;
    }
    const [path, hash = ""] = href.split("#");
    const target = `${REPO_URL}/-/blob/${REPO_BRANCH}/${resolveFromDocs(path)}${hash ? `#${hash}` : ""}`;
    return <a {...rest} href={target} target="_blank" rel="noreferrer">{children}</a>;
};

/**
 * A guide of docs/ shown as a Storybook page. The guide stays a single
 * Markdown file in docs/: the page imports its text (`?raw`) and renders it.
 *
 * @param {object} props
 * @param {string} props.content Markdown text of the guide
 * @param {string} props.file    File name in docs/, shown as the source
 */
export const GuidePage = ({ content, file }) => (
    <div className="sc-guide">
        <Markdown options={{ overrides: { a: { component: GuideLink } } }}>
            {content}
        </Markdown>
        {file && (
            <p className="sc-guide-source">
                Source : <a href={`${REPO_URL}/-/blob/${REPO_BRANCH}/docs/${file}`} target="_blank" rel="noreferrer">{`docs/${file}`}</a>
            </p>
        )}
    </div>
);
