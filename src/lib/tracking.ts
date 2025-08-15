/**
 * Utilities for generating tracking scripts for various platforms
 */

/**
 * Generates a Facebook Pixel tracking script
 * @param pixelId - The Facebook Pixel ID (numbers only)
 * @returns Complete Facebook Pixel script with init and PageView tracking
 */
export function generateFacebookPixelScript(pixelId: string): string {
  // Clean the pixel ID - remove any non-numeric characters
  const cleanPixelId = pixelId.replace(/[^0-9]/g, '')
  
  if (!cleanPixelId) {
    throw new Error('Invalid Facebook Pixel ID')
  }

  return `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${cleanPixelId}');
fbq('track', 'PageView');
`.trim()
}

/**
 * Generates a Google Tag Manager script
 * @param containerId - The GTM Container ID (GTM-XXXXXX)
 * @returns Complete GTM script with head and noscript parts
 */
export function generateGTMScript(containerId: string): { head: string; noscript: string } {
  const cleanId = containerId.trim().toUpperCase()
  
  if (!isValidGTMContainerId(cleanId)) {
    throw new Error('Invalid GTM Container ID')
  }

  const head = `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${cleanId}');
`.trim()

  const noscript = `
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${cleanId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
`.trim()

  return { head, noscript }
}

/**
 * Generates a Google Analytics 4 script
 * @param measurementId - The GA4 Measurement ID (G-XXXXXXXXX)
 * @returns Complete GA4 script with gtag configuration
 */
export function generateGA4Script(measurementId: string): string {
  const cleanId = measurementId.trim().toUpperCase()
  
  if (!isValidGA4MeasurementId(cleanId)) {
    throw new Error('Invalid GA4 Measurement ID')
  }

  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${cleanId}');
`.trim()
}

/**
 * Generates a Google Ads Conversion script
 * @param conversionId - The Google Ads Conversion ID (AW-XXXXXXXXX)
 * @param conversionLabel - The conversion label
 * @returns Complete Google Ads conversion tracking script
 */
export function generateGoogleAdsScript(conversionId: string, conversionLabel: string): string {
  const cleanId = conversionId.trim().toUpperCase()
  const cleanLabel = conversionLabel.trim()
  
  if (!isValidGoogleAdsConversionId(cleanId)) {
    throw new Error('Invalid Google Ads Conversion ID')
  }
  
  if (!cleanLabel) {
    throw new Error('Conversion Label is required')
  }

  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${cleanId}');
gtag('event', 'conversion', {
  'send_to': '${cleanId}/${cleanLabel}',
  'value': 1.0,
  'currency': 'USD'
});
`.trim()
}

// Validation functions
export function isValidFacebookPixelId(pixelId: string): boolean {
  const cleanPixelId = pixelId.replace(/[^0-9]/g, '')
  return cleanPixelId.length >= 10 && cleanPixelId.length <= 20
}

export function isValidGTMContainerId(containerId: string): boolean {
  return /^GTM-[A-Z0-9]{6,}$/i.test(containerId.trim())
}

export function isValidGA4MeasurementId(measurementId: string): boolean {
  return /^G-[A-Z0-9]{10}$/i.test(measurementId.trim())
}

export function isValidGoogleAdsConversionId(conversionId: string): boolean {
  return /^AW-[0-9]{10,}$/i.test(conversionId.trim())
}

/**
 * Interface for tracking configuration
 */
export interface TrackingConfig {
  facebookPixelId?: string
  gtmContainerId?: string
  ga4MeasurementId?: string
  googleAdsConversionId?: string
  googleAdsConversionLabel?: string
}

/**
 * Generates all tracking scripts based on configuration
 * @param config - Tracking configuration object
 * @returns Object with all tracking scripts ready for injection
 */
export function generateAllTrackingScripts(config: TrackingConfig): {
  headScripts: string[]
  noscriptElements: string[]
  gtmScripts?: string[]
} {
  const headScripts: string[] = []
  const noscriptElements: string[] = []
  const gtmScripts: string[] = []

  try {
    // Facebook Pixel
    if (config.facebookPixelId && isValidFacebookPixelId(config.facebookPixelId)) {
      headScripts.push(generateFacebookPixelScript(config.facebookPixelId))
    }

    // Google Tag Manager
    if (config.gtmContainerId && isValidGTMContainerId(config.gtmContainerId)) {
      const gtm = generateGTMScript(config.gtmContainerId)
      headScripts.push(gtm.head)
      noscriptElements.push(gtm.noscript)
    }

    // Google Analytics 4 (needs gtag library first)
    if (config.ga4MeasurementId && isValidGA4MeasurementId(config.ga4MeasurementId)) {
      gtmScripts.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${config.ga4MeasurementId}"></script>`)
      headScripts.push(generateGA4Script(config.ga4MeasurementId))
    }

    // Google Ads Conversion
    if (config.googleAdsConversionId && config.googleAdsConversionLabel && 
        isValidGoogleAdsConversionId(config.googleAdsConversionId)) {
      if (!config.ga4MeasurementId) { // Only add gtag if GA4 didn't already add it
        gtmScripts.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${config.googleAdsConversionId}"></script>`)
      }
      headScripts.push(generateGoogleAdsScript(config.googleAdsConversionId, config.googleAdsConversionLabel))
    }
  } catch (error) {
    console.error('Error generating tracking scripts:', error)
  }

  return { headScripts, noscriptElements, gtmScripts }
}