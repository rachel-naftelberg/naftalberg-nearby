// ==========================================================================
// מודול מזג אוויר בזמן אמת (Live Weather via Open-Meteo API)
// ==========================================================================

class WeatherService {
  constructor() {
    this.cache = new Map();
  }

  getWeatherCondition(wmoCode) {
    const codeMap = {
      0: { text: 'שמשי ובהיר', icon: '☀️', mood: 'sunny' },
      1: { text: 'בהיר ברובו', icon: '🌤️', mood: 'partly-cloudy' },
      2: { text: 'מעונן חלקית', icon: '⛅', mood: 'partly-cloudy' },
      3: { text: 'מעונן', icon: '☁️', mood: 'cloudy' },
      45: { text: 'ערפילי', icon: '🌫️', mood: 'foggy' },
      48: { text: 'ערפל כבד', icon: '🌫️', mood: 'foggy' },
      51: { text: 'טפטוף קל', icon: '🌦️', mood: 'rainy' },
      53: { text: 'גשם קל', icon: '🌧️', mood: 'rainy' },
      55: { text: 'גשם רציף', icon: '🌧️', mood: 'rainy' },
      61: { text: 'גשם מקומי', icon: '🌧️', mood: 'rainy' },
      63: { text: 'גשם בינוני', icon: '🌧️', mood: 'rainy' },
      65: { text: 'גשם עז', icon: '🌧️', mood: 'rainy' },
      71: { text: 'שלג קל', icon: '🌨️', mood: 'snowy' },
      73: { text: 'שלג בינוני', icon: '❄️', mood: 'snowy' },
      75: { text: 'שלג כבד', icon: '❄️', mood: 'snowy' },
      80: { text: 'ממטרים חולפים', icon: '🌦️', mood: 'rainy' },
      81: { text: 'ממטרי גשם', icon: '🌧️', mood: 'rainy' },
      82: { text: 'ממטרים עזים', icon: '⛈️', mood: 'stormy' },
      95: { text: 'סופת רעמים', icon: '⛈️', mood: 'stormy' },
      96: { text: 'סופת רעמים וברד', icon: '⛈️', mood: 'stormy' },
      99: { text: 'סופת ברד כבדה', icon: '⛈️', mood: 'stormy' }
    };
    return codeMap[wmoCode] || { text: 'נאה', icon: '🌤️', mood: 'partly-cloudy' };
  }

  generateTravelerTip(temp, wmoCode, rainProb) {
    if (wmoCode >= 51 || rainProb > 40) {
      return '🌧️ צפוי גשם בשעות הקרובות - כדאי לקחת מטרייה וליהנות ממוזיאונים ובתי קפה נעימים!';
    }
    if (temp < 10) {
      return '🧣 קריר בחוץ - מומלץ להתלבש חם בשכבות ולקחת מעיל וצעיף להליכה ממושכת.';
    }
    if (temp >= 10 && temp <= 19) {
      return '🚶‍♂️ מזג אוויר מושלם להליכה רגלית! ז\'קט קל או עליונית יספיקו בהחלט.';
    }
    if (temp >= 20 && temp <= 27) {
      return '☀️ תנאים אידיאליים לטיול עירוני! לא לשכוח משקפי שמש, כובע ובקבוק מים.';
    }
    return '🥤 יום חם בעיר - מומלץ לתכנן עצירות שתייה תכופות בבתי קפה ולבקר במבנים ממוזגים בצהריים.';
  }

  async fetchWeather(lat, lng) {
    const cacheKey = `${lat.toFixed(2)}_${lng.toFixed(2)}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.timestamp < 10 * 60 * 1000) {
      return cached.data;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,weathercode&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Weather API error');
      const data = await response.json();

      const current = data.current_weather;
      const cond = this.getWeatherCondition(current.weathercode);
      
      // איתור שעת החיזוי הקרובה
      const hourIndex = new Date().getHours();
      const rainProb = data.hourly?.precipitation_probability?.[hourIndex] ?? 10;
      const humidity = data.hourly?.relativehumidity_2m?.[hourIndex] ?? 55;

      const result = {
        temperature: Math.round(current.temperature),
        conditionText: cond.text,
        icon: cond.icon,
        mood: cond.mood,
        windSpeed: Math.round(current.windspeed),
        humidity: Math.round(humidity),
        rainProbability: rainProb,
        tip: this.generateTravelerTip(current.temperature, current.weathercode, rainProb),
        timestamp: now
      };

      this.cache.set(cacheKey, { data: result, timestamp: now });
      return result;
    } catch (e) {
      console.warn('Weather fetch failed, using fallback:', e);
      return {
        temperature: 22,
        conditionText: 'נעים ובהיר',
        icon: '🌤️',
        mood: 'sunny',
        windSpeed: 12,
        humidity: 50,
        rainProbability: 10,
        tip: '☀️ מזג אוויר מצוין לשיטוט בעיר! קחו מים ותיהנו מהדרך.',
        isFallback: true
      };
    }
  }
}

window.weatherService = new WeatherService();
