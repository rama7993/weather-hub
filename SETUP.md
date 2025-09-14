# Weather Pro - Setup Guide

## OpenWeatherMap API Setup

This project uses the OpenWeatherMap API to fetch weather data. Follow these steps to set up your API key:

### 1. Get Your API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to the API Keys section in your account dashboard
4. Copy your API key

### 2. Configure the API Key

1. Open `src/environments/environment.ts`
2. Replace `YOUR_OPENWEATHERMAP_API_KEY` with your actual API key:

```typescript
export const environment = {
  production: false,
  weatherApi: {
    baseUrl: 'https://api.openweathermap.org/data/2.5/weather',
    forecastUrl: 'https://api.openweathermap.org/data/2.5/forecast',
    airQualityUrl: 'https://api.openweathermap.org/data/2.5/air_pollution',
    apiKey: 'your-actual-api-key-here', // Replace this
    units: 'metric'
  },
};
```

### 3. Run the Application

```bash
ng serve
```

The app will be available at `http://localhost:4200`

## Features

- 🌤️ Current weather conditions
- 📍 Location-based weather search
- 🌙 Dark/Light theme toggle
- 📱 Fully responsive design
- 🎨 Modern Glassmorphism UI
- ⚡ Real-time weather updates

## API Limits

- Free tier: 1,000 calls/day
- 60 calls/minute
- Perfect for development and small projects

## Troubleshooting

If you encounter issues:

1. **API Key Error**: Make sure your API key is correctly set in the environment file
2. **CORS Issues**: The OpenWeatherMap API supports CORS, so this shouldn't be an issue
3. **Rate Limiting**: If you exceed the free tier limits, you'll need to upgrade your plan

## Production Deployment

For production deployment:

1. Update `src/environments/environment.prod.ts` with your production API key
2. Build the project: `ng build --configuration=production`
3. Deploy the `dist/` folder to your hosting service
