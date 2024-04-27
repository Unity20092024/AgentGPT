import nextI18NextConfig from "./next-i18next.config.js";

// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  /* If trying out the experimental appDir, comment the i18n config out
   * @see https://github.com/vercel/next.js/issues/41980 */
  i18n: { ...nextI18NextConfig.i18n, ignoreDevNotFoundWarnings: true },
  webpack: (config, { dev, isServer }) => {
    config.experiments = { asyncWebAssembly: true, layers: true };
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300
    };
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })
    if (dev && !isServer) {
      config.devtool = 'source-map';
    }
    config.output = {
      path: isServer ? __dirname + '/.next' : './dist',
      filename: isServer ? '[name].js' : '[name].[contenthash].js',
      publicPath: '/_next/'
    };
    return config;
  },
  rewrites() {
      return {
          beforeFiles: [
              {
                  source: '/:path*',
                  has: [
                      {
                          type: 'host',
                          value: 'reworkd.ai',
                      },
                  ],
                  destination: '/landing-page',
              },
          ]
      }
  },
  basePath: '/my-app'
};

module.exports = {
  ...config,
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
};
