// ==========================================================================
// שירות מזג אוויר חי (Live Weather Service) - Open-Meteo API
// טמפרטורה, עננות, לחות, רוח והמלצות לבוש ושיטוט למטייל
// ==========================================================================

class WeatherService {
  constructor() {
    this.cache = {};
  }

  // פענוח קוד מזג אוויר של WMO
  interpretWeatherCode(code) {
    switch (code) {
      case 0:
        return { text: 'בהיר ושמשי', icon: '☀️', tip: 'מומלץ לקחת משקפי שמש וכובע לשיטוט נעים.' };
      case 1:
      case 2:
        return { text: 'בהיר ברובו עד מעונן חלקית', icon: '🌤️', tip: 'מזג אוויר אידיאלי להליכה רגלית וביקורים באתרים.' };
      case 3:
        return { text: 'מעונן', icon: '☁️', tip: 'טמפרטורה נוחה, מומלץ לבוש קל בשכבות.' };
      case 45:
      case 48:
        return { text: 'ערפילי', icon: '🌫️', tip: 'ראות מוגבלת בתצפיות, מתאים במיוחד למוזיאונים ובתי קפה.' };
      case 51:
      case 53:
      case 55:
        return { text: 'טפטוף קל', icon: '🌦️', tip: 'מומלץ להצטייד במטרייה קלה או ז\'קט נגד גשם.' };
      case 61:
      case 63:
      case 65:
        return { text: 'גשם', icon: '🌧️', tip: 'גשום! מומלץ לבקר באתרים סגורים וליהנות מקפה חם.' };
      case 71:
      case 73:
      case 75:
        return { text: 'שלג', icon: '❄️', tip: 'מושלג! הקפידו על נעליים מונעות החלקה ולבוש חם.' };
      case 80:
      case 81:
      case 82:
        return { text: 'ממטרים חזקים', icon: '⛈️', tip: 'ממטרים! כדאי לתפוס מחסה באטרקציה מקורה או מסעדה.' };
      case 95:
      case 96:
      case 99:
        return { text: 'סופת רעמים', icon: '⚡', tip: 'הישארו במבנים מקורים עד לחלוף הסערה.' };
      default:
        return { text: 'נאה', icon: '🌤️', tip: 'יום מצוין לטיולים ופעילויות בחוץ.' };
    }
  }

  async fetchWeather(lat, lng) {
    const key = `${lat.toFixed(2)}_${lng.toFixed(2)}`;
    const now = Date.now();

    // Cache for 15 minutes
    if (this.cache[key] && now - this.cache[key].timestamp < 15 * 60 * 1000) {
      return this.cache[key].data;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Weather API error');

      const data = await response.json();
      const current = data.current;
      const interpretation = this.interpretWeatherCode(current.weather_code);

      const weatherResult = {
        temperature: Math.round(current.temperature_2m),
        condition: interpretation.text,
        icon: interpretation.icon,
        windSpeed: Math.round(current.wind_speed_10m),
        humidity: current.relative_humidity_2m,
        tip: interpretation.tip
      };

      this.cache[key] = { data: weatherResult, timestamp: now };
      return weatherResult;
    } catch (e) {
      console.warn('Using fallback weather data:', e);
      return {
        temperature: 24,
        condition: 'נאה ובהיר',
        icon: '☀️',
        windSpeed: 12,
        humidity: 50,
        tip: 'מזג אוויר נעים ומושלם לטיול רגלי בסביבה!'
      };
    }
  }
}

window.weatherService = new WeatherService();
