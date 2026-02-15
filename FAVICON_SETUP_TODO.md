# Favicon & Icon Assets TODO

The code structure for favicon and social media images is now complete. The following asset files need to be created/added to complete the setup:

## Required Files

### Favicon Files (in /public)
- [ ] `favicon.svg` - SVG version of logo (recommended: 64x64 viewBox)
- [ ] `favicon.ico` - ✅ Already exists
- [ ] `og-image.jpg` - Social media preview image (1200x630px)

### Icon Files (in /public/icons/)
Create the `/public/icons/` directory and add:
- [ ] `favicon-16x16.png` - 16x16px PNG
- [ ] `favicon-32x32.png` - 32x32px PNG  
- [ ] `apple-touch-icon.png` - 180x180px PNG (iOS home screen)
- [ ] `icon-192x192.png` - 192x192px PNG (PWA)
- [ ] `icon-512x512.png` - 512x512px PNG (PWA)

## Design Guidelines

All icon files should:
- Use the S&S Messebau logo
- Have transparent or white backgrounds (except og-image.jpg)
- Use the brand color (#3730a3) as primary color
- Be optimized for web (compressed but high quality)

### OG Image Specifications
The `og-image.jpg` should be a professional banner showing:
- S&S Messebau branding
- Tagline: "Professioneller Messebau aus NRW"
- Dimensions: 1200x630px (Facebook/LinkedIn standard)
- File size: < 300KB for fast loading

## References
- Favicon Generator: https://realfavicongenerator.net/
- OG Image Best Practices: https://developers.facebook.com/docs/sharing/webmasters/images/
