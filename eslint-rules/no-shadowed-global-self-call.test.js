/**
 * Tests for the custom ESLint rule `no-shadowed-global-self-call`.
 *
 * Uses ESLint's RuleTester (the official, version-stable API for rule
 * authors) to feed valid + invalid snippets and assert the rule fires
 * where and only where it should.
 */

import { RuleTester } from "eslint";

import rule from "./no-shadowed-global-self-call.js";

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parserOptions: {
            ecmaFeatures: { jsx: true },
        },
    },
});

// RuleTester.run calls describe()+it() itself, so we invoke it at
// the top level (vitest disallows nesting suites inside test bodies).
ruleTester.run("no-shadowed-global-self-call", rule, {
            valid: [
                // No shadowing: calling Boolean inside a non-Boolean function.
                {
                    code: `
                        function helper(x) {
                            return Boolean(x);
                        }
                    `,
                },
                // The component uses !!x instead of Boolean(x): allowed.
                {
                    code: `
                        export const Boolean = (props) => {
                            return !!props.value;
                        };
                    `,
                },
                // The component uses globalThis.Boolean(x): allowed (member access).
                {
                    code: `
                        export const Boolean = (props) => {
                            return globalThis.Boolean(props.value);
                        };
                    `,
                },
                // Calling a different name from the global list inside the function: allowed.
                {
                    code: `
                        export const Boolean = (props) => {
                            return Number(props.value);
                        };
                    `,
                },
                // Function whose name is NOT in the watched globals list: allowed,
                // even when re-invoking itself (different bug, out of scope).
                {
                    code: `
                        export const MyHelper = (props) => {
                            return MyHelper(props);
                        };
                    `,
                },
                // Member-access call on the component name does not trigger.
                {
                    code: `
                        export const Boolean = (props) => {
                            return obj.Boolean(props.value);
                        };
                    `,
                },
            ],
            invalid: [
                // The exact pattern of the original Boolean bug.
                {
                    code: `
                        export const Boolean = (props) => {
                            return Boolean(props.value);
                        };
                    `,
                    errors: [{ messageId: "shadowedSelfCall", data: { name: "Boolean" } }],
                },
                // Multiple call sites: one error per occurrence.
                {
                    code: `
                        export const Boolean = (props) => {
                            const a = Boolean(props.x);
                            const b = Boolean(props.y);
                            return a && b;
                        };
                    `,
                    errors: [
                        { messageId: "shadowedSelfCall" },
                        { messageId: "shadowedSelfCall" },
                    ],
                },
                // Same trap for Number, Array, etc.
                {
                    code: `
                        export const Number = (props) => {
                            return Number(props.value);
                        };
                    `,
                    errors: [{ messageId: "shadowedSelfCall" }],
                },
                {
                    code: `
                        export const Array = (props) => {
                            return Array(props.value);
                        };
                    `,
                    errors: [{ messageId: "shadowedSelfCall" }],
                },
                // function declaration form too.
                {
                    code: `
                        function Boolean(x) {
                            return Boolean(x);
                        }
                    `,
                    errors: [{ messageId: "shadowedSelfCall" }],
                },
                // export default function.
                {
                    code: `
                        export default function Boolean(x) {
                            return Boolean(x);
                        }
                    `,
                    errors: [{ messageId: "shadowedSelfCall" }],
                },
                // Nested arrow inside the shadowing function: still flagged.
                {
                    code: `
                        export const Boolean = (props) => {
                            const f = () => Boolean(props.value);
                            return f();
                        };
                    `,
                    errors: [{ messageId: "shadowedSelfCall" }],
                },
            ],
});
