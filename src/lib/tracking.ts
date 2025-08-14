/**
 * Utilities for generating tracking scripts
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
 * Validates a Facebook Pixel ID
 * @param pixelId - The pixel ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidFacebookPixelId(pixelId: string): boolean {
  const cleanPixelId = pixelId.replace(/[^0-9]/g, '')
  return cleanPixelId.length >= 10 && cleanPixelId.length <= 20
}