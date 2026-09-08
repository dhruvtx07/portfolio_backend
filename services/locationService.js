const maxmind = require('maxmind');
const path = require('path');

let readerInstance = null;

/**
 * Lazy load and cache MaxMind reader instance
 */
async function getMaxMindReader() {
  if (readerInstance) {
    return readerInstance;
  }

  const dbPath = path.join(__dirname, '../storage/maxmind/GeoLite2-City.mmdb');
  try {
    readerInstance = await maxmind.open(dbPath);
    return readerInstance;
  } catch (error) {
    console.error('MaxMind open error:', error.message);
    return null;
  }
}

/**
 * Get client IP address handling proxies and local addresses
 */
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    if (ips[0]) return ips[0];
  }
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
}

/**
 * Lookup Geo details using MaxMind GeoLite2-City database
 */
async function getGeoDetails(ip) {
  try {
    const reader = await getMaxMindReader();
    if (!reader || !ip) {
      return { country: null, city: null, latitude: null, longitude: null };
    }

    // Clean ipv6 prefix if IPv4 mapped
    let lookupIp = ip;
    if (lookupIp.startsWith('::ffff:')) {
      lookupIp = lookupIp.replace('::ffff:', '');
    }

    // Skip internal/loopback IPs
    if (lookupIp === '::1' || lookupIp === '127.0.0.1' || lookupIp.startsWith('192.168.') || lookupIp.startsWith('10.')) {
      return { country: null, city: null, latitude: null, longitude: null };
    }

    const geo = reader.get(lookupIp);
    if (!geo) {
      return { country: null, city: null, latitude: null, longitude: null };
    }

    return {
      country: geo.country?.names?.en || geo.country?.iso_code || null,
      city: geo.city?.names?.en || null,
      latitude: geo.location?.latitude || null,
      longitude: geo.location?.longitude || null
    };
  } catch (error) {
    console.error('Error fetching MaxMind geo details for IP', ip, ':', error.message);
    return { country: null, city: null, latitude: null, longitude: null };
  }
}

/**
 * Lightweight User-Agent parser for device_type, browser, and OS
 */
function parseUserAgent(userAgent) {
  if (!userAgent || typeof userAgent !== 'string') {
    return { deviceType: 'desktop', browser: 'Unknown', os: 'Unknown' };
  }

  // 1. Device Type
  let deviceType = 'desktop';
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(userAgent)) {
    deviceType = 'mobile';
  }

  // 2. Browser
  let browser = 'Other';
  if (/edg([ea]|ios)?\/([\d.]+)/i.test(userAgent)) {
    browser = 'Edge';
  } else if (/opr\/|opera/i.test(userAgent)) {
    browser = 'Opera';
  } else if (/chrome|crios/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/firefox|fxios/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/msie|trident/i.test(userAgent)) {
    browser = 'Internet Explorer';
  }

  // 3. Operating System
  let os = 'Other';
  if (/windows/i.test(userAgent)) {
    os = 'Windows';
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    os = 'macOS';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = 'iOS';
  } else if (/android/i.test(userAgent)) {
    os = 'Android';
  } else if (/linux/i.test(userAgent)) {
    os = 'Linux';
  }

  return { deviceType, browser, os };
}

module.exports = {
  getClientIp,
  getGeoDetails,
  parseUserAgent
};
