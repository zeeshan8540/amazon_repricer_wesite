import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        pricing: resolve(__dirname, 'src/pricing/index.html'),
        starter: resolve(__dirname, 'src/pricing/starter.html'),
        business: resolve(__dirname, 'src/pricing/business.html'),
        professional: resolve(__dirname, 'src/pricing/professional.html'),
        features: resolve(__dirname, 'src/features/index.html'),
        support: resolve(__dirname, 'src/support/index.html'),
        terms: resolve(__dirname, 'src/legal/terms.html'),
        privacy: resolve(__dirname, 'src/legal/privacy.html'),
        refund: resolve(__dirname, 'src/legal/refund-policy.html'),
        success: resolve(__dirname, 'src/checkout/success.html'),
        error: resolve(__dirname, 'src/checkout/error.html'),
        404: resolve(__dirname, 'src/404.html')
      }
    }
  }
});
