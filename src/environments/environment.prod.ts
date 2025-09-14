export const environment = {
  production: true,
  weatherApi: {
    baseUrl: 'https://api.openweathermap.org/data/2.5/weather',
    forecastUrl: 'https://api.openweathermap.org/data/2.5/forecast',
    airQualityUrl: 'https://api.openweathermap.org/data/2.5/air_pollution',
    apiKey: process.env['weather'],
    units: 'metric',
  },
};
