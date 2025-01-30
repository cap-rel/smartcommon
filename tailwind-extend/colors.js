import hexToRgba from "hex-to-rgba";
import { hexToRgb } from "../src/globals/functions";
import hexRgb from "hex-rgb";

export const appColors = {
    "light"          : "#fff",
    "light-soft"     : "#f1f5f9",
    "light-border"   : "#e2e8f0",
    "light-soft-text": "#94a3b8",
    "light-text"     : "#0f172a",

    "dark"           : "#0f172a",
    "dark-soft"      : "#1e293b",
    "dark-border"    : "#334155",
    "dark-soft-text" : "#94a3b8",
    "dark-text"      : "#fff",

    "primary"        : "#f16c6d",
    "secondary"      : "#000",
    "success"        : "#22c55e",
    "error"          : "#ef4444",
    "warning"        : "#eab308",
};

export let colors = appColors;

for (let i = 0; i < 10; i++) {
    colors = { 
        ...colors,
        [`white-${i * 10}`]          : `rgba(255, 255, 255, ${i / 10})`,
        [`black-${i * 10}`]          : `rgba(0, 0, 0, ${i / 10})`,
        [`light-${i * 10}`]          : `rgba(var(--light-color-rgb), ${i / 10})`,
        [`light-soft-${i * 10}`]     : `rgba(var(--light-soft-color-rgb), ${i / 10})`,
        [`light-border-${i * 10}`]   : `rgba(var(--light-border-color-rgb), ${i / 10})`,
        [`light-soft-text-${i * 10}`]: `rgba(var(--light-soft-text-color-rgb), ${i / 10})`,
        [`light-text-${i * 10}`]     : `rgba(var(--light-text-color-rgb), ${i / 10})`,
        [`dark-${i * 10}`]           : `rgba(var(--dark-color-rgb), ${i / 10})`,
        [`dark-soft-${i * 10}`]      : `rgba(var(--dark-soft-color-rgb), ${i / 10})`,
        [`dark-border-${i * 10}`]    : `rgba(var(--dark-border-color-rgb), ${i / 10})`,
        [`dark-soft-text-${i * 10}`] : `rgba(var(--dark-soft-text--color-rgb), ${i / 10})`,
        [`dark-text-${i * 10}`]      : `rgba(var(--dark-text-color-rgb), ${i / 10})`,
        [`primary-${i * 10}`]        : `rgba(var(--primary-color-rgb), ${i / 10})`,
        [`secondary-${i * 10}`]      : `rgba(var(--secondary-color-rgb), ${i / 10})`,
        [`success-${i * 10}`]        : `rgba(var(--success-color-rgb), ${i / 10})`,
        [`error-${i * 10}`]          : `rgba(var(--error-color-rgb), ${i / 10})`,
        [`warning-${i * 10}`]        : `rgba(var(--warning-color-rgb), ${i / 10})`,

    }
}