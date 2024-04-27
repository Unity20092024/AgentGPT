/** @type {import("tailwindcss").Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    transparent: "transparent",
    current: "currentColor",
    screens: {
      ...defaultTheme.screens,
      xs: "300px",
      xmd: "850px",
      smH: { raw: "(min-height: 700px)" },
      mdH: { raw: "(min-height: 800px)" },
      lgH: { raw: "(min-height: 1000px)" },
    },
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.900"),
            a: {
              color: theme("colors.blue.500"),
              "&:hover": {
                color: theme("colors.blue.600"),
              },
            },
            h1: {
              color: theme("colors.white"),
            },
            h2: {
              color: theme("colors.white"),
            },
            h3: {
              color: theme("colors.white"),
            },
            h4: {
              color: theme("colors.white"),
            },
            b: {
              color: theme("colors.gray.500"),
            },
          },
        },
      }),
      backgroundImage: {
        gradientRadial: "radial-gradient(var(--tw-gradient-stops))",
      },
      boxShadow: {
        xs: "0px 0px 0px 0.75px rgba(0, 0, 0, 0.05), 0px 2px 4px rgba(0, 0, 0, 0.05)",
        tremorInput: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        tremorCard: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        tremorDropdown: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        darkTremorInput: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        darkTremorCard: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        darkTremorDropdown: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        depth1:
          "0 2px 4px 0 rgba(0, 0, 0, 0.05), 0 0 0 0.75px rgba(0, 0, 0, 0.05), 0 0 12px -2px rgba(0, 0, 0, 0.05)",
        depth2:
          "0 0 0 0.75px rgba(0, 0, 0, 0.05), 0 8px 32px 0 rgba(39, 40, 51, 0.05), 0 4px 16px 0 rgba(39, 40, 51, 0.05)",
        depth3:
          "0 0 0 0.75px rgba(0, 0, 0, 0.05), 0 8px 32px 0 rgba(39, 40, 51, 0.05), 0 4px 16px 0 rgba(39, 40, 51, 0.05), 0 8px 24px -4px rgba(0, 0, 0, 0.20)",
      },
      borderRadius: {
        tremorSmall: "0.375rem",
        tremorDefault: "0.5rem",
        tremorFull: "9999px",
      },
      fontSize: {
        tremorLabel: ["0.75rem"],
        tremorDefault: ["0.875rem", { lineHeight: "1.25rem" }],
        tremorTitle: ["1.125rem", { lineHeight: "1.75rem" }],
        tremorMetric: ["1.875rem", { lineHeight: "2.25rem" }],
      },
      fontFamily: {
        inter: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      aspectRatio: {
        "4/3": "4 / 3",
        "16/9": "16 / 9",
      },
      lineClamp: {
        5: "5",
      },
      colors: {
        // ...
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    "truncate",
    "focus-visible",
  ],
  plugins: [
    require("@tailwindcss/typography")({ important: true }),
    require("@tailwindcss/forms")({ strategy: "class", variants: ["focus-visible"] }),
    require("tailwindcss-radix"),
  ],
};
