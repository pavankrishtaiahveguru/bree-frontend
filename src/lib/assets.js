/**
 * Image URLs and Brand Assets Configuration
 * Centralized location for all static assets
 * Migration point to future CDN (Cloudinary, S3, etc.)
 */

export const BRAND_ASSETS = {
  // Logo - Used in header, footer, admin panels
  // TODO: Replace with local asset or Cloudinary URL when CDN is set up
  logo: process.env.REACT_APP_LOGO_URL || 
    'https://customer-assets.emergentagent.com/job_bree-daily-ritual/artifacts/9o6pw5yg_a2475dc8-5e69-4671-af95-51ab7af4142f.png',
};

export const PRODUCT_IMAGES = {
  // Default product image - Used as fallback for products
  // TODO: Replace with Cloudinary placeholder when migrating image hosting
  default: process.env.REACT_APP_DEFAULT_PRODUCT_IMAGE ||
    'https://customer-assets.emergentagent.com/job_bree-daily-ritual/artifacts/0cmevfin_bree%CC%81%20FIRE%20wellness%20shot%20bottle.png',
};

export const HERO_ASSETS = {
  // Bottle 3D animated image
  // TODO: Replace with local SVG animation or hosted asset
  bottle3D: process.env.REACT_APP_BOTTLE_3D_IMAGE ||
    'https://customer-assets.emergentagent.com/job_bree-daily-ritual/artifacts/i8m56ish_Amla%2C%20ginger%2C%20turmeric%20health%20shots.png',
};

/**
 * Migration Notes:
 * ================
 * 
 * 1. LOCAL ASSETS:
 *    - Download all brand logos and create SVGs
 *    - Store in: frontend/public/assets/brand/
 *    - Reference: `/assets/brand/logo.svg`
 * 
 * 2. CLOUDINARY INTEGRATION:
 *    - Set up Cloudinary account
 *    - Create upload presets for:
 *      - Admin product uploads
 *      - Testimonial images
 *      - Dynamic banners
 *    - Use Cloudinary URLs for dynamic content
 * 
 * 3. ENVIRONMENT VARIABLES:
 *    Production .env should have:
 *    ```
 *    REACT_APP_LOGO_URL=https://cdn.bree.example.com/logo.png
 *    REACT_APP_DEFAULT_PRODUCT_IMAGE=https://cdn.bree.example.com/default-product.png
 *    REACT_APP_BOTTLE_3D_IMAGE=https://cdn.bree.example.com/bottle-hero.png
 *    ```
 * 
 * 4. BACKEND INTEGRATION:
 *    - For product images: Backend should return Cloudinary URLs
 *    - For testimonials: Admin uploads via multer to Cloudinary
 *    - See: backend/src/config/cloudinary.js
 */
