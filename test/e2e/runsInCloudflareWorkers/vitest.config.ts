import { cloudflareTest } from '@cloudflare/vitest-plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: {
        configPath: './test/e2e/runsInCloudflareWorkers/wrangler.jsonc',
      },
    }),
  ],
  test: {
    include: ['test/e2e/runsInCloudflareWorkers/cloudflare.test.js'],
  },
})
