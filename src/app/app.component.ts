import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherData } from './models/weather.model';
import { WeatherService } from './services/weather.service';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'weather-pro';
  city: string = 'Hyderabad';
  dupCity = this.city;
  data?: WeatherData;
  checkCity: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';
  currentTime: Date = new Date();
  isDarkTheme: boolean = false;
  lastSearchedCity: string = '';
  forecastData?: any;
  hourlyData: any[] = [];
  weatherAlerts: any[] = [];
  activeTab: string = 'forecast';
  weatherParticles: any[] = [];
  isMapFullscreen: boolean = false;
  chartType: string = 'line';
  weatherInsights: any[] = [];
  isMapModalOpen: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.updateTime();
    this.loadTheme();
    this.common(this.city);
    this.city = '';

    // Update time every minute
    interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateTime();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(form: any) {
    if (this.city.trim()) {
      this.lastSearchedCity = this.city.trim();
      this.common(this.city.trim());
      this.dupCity = this.city.trim();
      this.city = '';
    }
  }

  onInputChange(): void {
    this.clearError();
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      this.loading = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.getWeatherByCoords(lat, lon);
        },
        (error) => {
          this.loading = false;
          this.errorMessage =
            'Unable to get your location. Please search for a city.';
          console.error('Geolocation error:', error);
        }
      );
    } else {
      this.errorMessage = 'Geolocation is not supported by this browser.';
    }
  }

  private getWeatherByCoords(lat: number, lon: number): void {
    this.weatherService.getWeatherByCoords(lat, lon).subscribe({
      next: (response) => {
        this.data = response;
        this.dupCity = response.location.name;
        this.loading = false;
        this.checkCity = false;
        this.clearError();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Unable to get weather data for your location.';
        console.error(err);
      },
    });
  }

  private common(city: string): void {
    this.loading = true;
    this.clearError();

    // Fetch current weather and forecast data in parallel
    this.weatherService.getWeatherData(city).subscribe({
      next: (response) => {
        this.data = response;
        this.loading = false;
        this.checkCity = false;
        this.clearError();
        console.log(response);

        // Fetch forecast data after current weather loads
        this.getForecastData(city);
        this.generateMockHourlyData();
        this.generateMockAlerts();
        this.generateWeatherParticles();
        this.generateWeatherInsights();

        // Draw chart after data loads
        setTimeout(() => this.drawTemperatureChart(), 200);
      },
      error: (err) => {
        this.loading = false;
        this.checkCity = true;
        this.errorMessage = `City "${city}" not found. Please try a different city.`;
        console.error(err);
      },
      complete: () => {
        console.log('Weather data fetch complete.');
      },
    });
  }

  private getForecastData(city: string): void {
    this.weatherService.getForecastData(city).subscribe({
      next: (response) => {
        this.forecastData = response;
        console.log('Forecast data:', response);
      },
      error: (err) => {
        console.error('Forecast error:', err);
        this.forecastData = null;
      },
    });
  }

  private generateMockHourlyData(): void {
    // Generate mock hourly data for the next 24 hours
    this.hourlyData = [];
    const now = new Date();

    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
      this.hourlyData.push({
        time: hour.toISOString(),
        temp_c: Math.round(15 + Math.sin(i * 0.3) * 10 + Math.random() * 5),
        condition: {
          text: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][
            Math.floor(Math.random() * 4)
          ],
          icon: 'https://openweathermap.org/img/wn/01d@2x.png',
        },
        humidity: Math.round(40 + Math.random() * 40),
        wind_kph: Math.round(5 + Math.random() * 20),
        chance_of_rain:
          Math.random() > 0.7 ? Math.round(Math.random() * 100) : 0,
      });
    }
  }

  private generateMockAlerts(): void {
    // Generate mock weather alerts
    this.weatherAlerts = [
      {
        title: 'Heat Advisory',
        description:
          'High temperatures expected. Stay hydrated and avoid prolonged outdoor activities.',
        severity: 'moderate',
        time: new Date().toISOString(),
      },
      {
        title: 'UV Index Warning',
        description:
          'UV index is very high today. Use sunscreen and protective clothing.',
        severity: 'high',
        time: new Date().toISOString(),
      },
    ];
  }

  private updateTime(): void {
    this.currentTime = new Date();
  }

  clearError(): void {
    this.errorMessage = '';
    this.checkCity = false;
  }

  getAQIClass(aqi: number): string {
    if (aqi <= 1) return 'aqi-good';
    if (aqi <= 2) return 'aqi-moderate';
    if (aqi <= 3) return 'aqi-unhealthy-sensitive';
    if (aqi <= 4) return 'aqi-unhealthy';
    if (aqi <= 5) return 'aqi-very-unhealthy';
    return 'aqi-hazardous';
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.saveTheme();
    this.applyTheme();
  }

  loadTheme(): void {
    const savedTheme = localStorage.getItem('weather-theme');
    this.isDarkTheme = savedTheme === 'dark';
    this.applyTheme();
  }

  saveTheme(): void {
    localStorage.setItem('weather-theme', this.isDarkTheme ? 'dark' : 'light');
  }

  applyTheme(): void {
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  refreshWeather(): void {
    if (this.lastSearchedCity) {
      this.common(this.lastSearchedCity);
    } else if (this.dupCity) {
      this.common(this.dupCity);
    }
  }

  // Helper methods for new features
  getDayName(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
  }

  formatHour(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    });
  }

  formatAlertTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  // Advanced Weather Features
  getWeatherBackgroundClass(): string {
    if (!this.data) return 'default';

    const condition = this.data.current.condition.text.toLowerCase();
    if (condition.includes('rain') || condition.includes('drizzle'))
      return 'rainy';
    if (condition.includes('snow') || condition.includes('blizzard'))
      return 'snowy';
    if (condition.includes('cloud') || condition.includes('overcast'))
      return 'cloudy';
    if (condition.includes('sun') || condition.includes('clear'))
      return 'sunny';
    if (condition.includes('storm') || condition.includes('thunder'))
      return 'stormy';
    if (condition.includes('fog') || condition.includes('mist')) return 'foggy';
    return 'default';
  }

  generateWeatherParticles(): void {
    this.weatherParticles = [];
    const particleCount = 20;
    const condition = this.data?.current.condition.text.toLowerCase() || '';

    for (let i = 0; i < particleCount; i++) {
      let type = 'default';
      if (condition.includes('rain')) type = 'rain';
      else if (condition.includes('snow')) type = 'snow';
      else if (condition.includes('cloud')) type = 'cloud';
      else if (condition.includes('sun')) type = 'sun';

      this.weatherParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        type: type,
      });
    }
  }

  generateWeatherInsights(): void {
    if (!this.data) return;

    this.weatherInsights = [
      {
        icon: 'fas fa-thermometer-half',
        title: 'Temperature Trend',
        description: this.getTemperatureInsight(),
      },
      {
        icon: 'fas fa-wind',
        title: 'Wind Analysis',
        description: this.getWindInsight(),
      },
      {
        icon: 'fas fa-tint',
        title: 'Humidity Level',
        description: this.getHumidityInsight(),
      },
      {
        icon: 'fas fa-eye',
        title: 'Visibility Report',
        description: this.getVisibilityInsight(),
      },
      {
        icon: 'fas fa-sun',
        title: 'UV Index',
        description: this.getUVInsight(),
      },
      {
        icon: 'fas fa-cloud',
        title: 'Cloud Coverage',
        description: this.getCloudInsight(),
      },
    ];
  }

  getTemperatureInsight(): string {
    if (!this.data?.current) return 'No temperature data available.';
    const temp = this.data.current.temp_c;
    if (temp > 30) return 'Hot weather! Stay hydrated and seek shade.';
    if (temp > 20)
      return 'Pleasant temperature, perfect for outdoor activities.';
    if (temp > 10) return 'Cool weather, consider a light jacket.';
    return 'Cold weather! Bundle up and stay warm.';
  }

  getWindInsight(): string {
    if (!this.data?.current) return 'No wind data available.';
    const wind = this.data.current.wind_kph;
    if (wind > 50) return 'Strong winds! Be cautious outdoors.';
    if (wind > 25) return 'Moderate winds, good for flying kites!';
    if (wind > 10) return 'Light breeze, pleasant conditions.';
    return 'Calm conditions with minimal wind.';
  }

  getHumidityInsight(): string {
    if (!this.data?.current) return 'No humidity data available.';
    const humidity = this.data.current.humidity;
    if (humidity > 80) return 'High humidity! Air feels muggy and sticky.';
    if (humidity > 60) return 'Moderate humidity, comfortable conditions.';
    if (humidity > 40) return 'Low humidity, air feels dry.';
    return 'Very dry air, consider using moisturizer.';
  }

  getVisibilityInsight(): string {
    if (!this.data?.current) return 'No visibility data available.';
    const visibility = this.data.current.vis_km;
    if (visibility < 1) return 'Very poor visibility! Drive carefully.';
    if (visibility < 5) return 'Reduced visibility, use caution.';
    if (visibility < 10) return 'Fair visibility conditions.';
    return 'Excellent visibility, clear conditions.';
  }

  getUVInsight(): string {
    if (!this.data?.current) return 'No UV data available.';
    const uv = this.data.current.uv;
    if (uv > 8) return 'Very high UV! Avoid sun exposure, use sunscreen.';
    if (uv > 6) return 'High UV index, protect your skin.';
    if (uv > 3) return 'Moderate UV, some protection needed.';
    return 'Low UV index, minimal protection needed.';
  }

  getCloudInsight(): string {
    if (!this.data?.current) return 'No cloud data available.';
    const cloud = this.data.current.cloud;
    if (cloud > 80) return 'Overcast skies with heavy cloud cover.';
    if (cloud > 50) return 'Partly cloudy with scattered clouds.';
    if (cloud > 20) return 'Mostly clear with few clouds.';
    return 'Clear skies with minimal cloud cover.';
  }

  // Map Functions
  toggleMapView(): void {
    this.isMapFullscreen = !this.isMapFullscreen;
  }

  refreshMap(): void {
    // Simulate map refresh
    console.log('Refreshing weather map...');
  }

  openMapModal(): void {
    this.isMapModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeMapModal(): void {
    this.isMapModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  // New Feature Methods
  shareWeather(): void {
    if (!this.data) return;

    const weatherText = `Current weather in ${this.dupCity}: ${this.data.current.temp_c}°C, ${this.data.current.condition.text}. Check out this weather app!`;

    if (navigator.share) {
      navigator
        .share({
          title: `Weather in ${this.dupCity}`,
          text: weatherText,
          url: window.location.href,
        })
        .catch((err) => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard
        .writeText(weatherText)
        .then(() => {
          alert('Weather data copied to clipboard!');
        })
        .catch(() => {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = weatherText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('Weather data copied to clipboard!');
        });
    }
  }

  previewWeather(): void {
    if (!this.data) return;

    const previewWindow = window.open(
      '',
      '_blank',
      'width=900,height=700,scrollbars=yes,resizable=yes'
    );
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>Weather Preview - ${this.dupCity}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                overflow-x: hidden;
              }
              .preview-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.2);
                overflow: hidden;
              }
              .preview-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
              }
              .preview-header h1 {
                font-size: 32px;
                margin-bottom: 10px;
                font-weight: 700;
              }
              .temperature {
                font-size: 64px;
                font-weight: 300;
                margin: 15px 0;
                line-height: 1;
              }
              .condition {
                font-size: 24px;
                opacity: 0.9;
                margin-bottom: 10px;
                text-transform: capitalize;
              }
              .feels-like {
                font-size: 18px;
                opacity: 0.8;
              }
              .preview-body {
                padding: 30px;
              }
              .stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-top: 20px;
              }
              .stat {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 15px;
                border: 1px solid #e9ecef;
                transition: transform 0.2s ease;
              }
              .stat:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
              }
              .stat-icon {
                font-size: 24px;
                width: 40px;
                text-align: center;
              }
              .stat-content {
                flex: 1;
              }
              .stat-label {
                font-size: 14px;
                color: #666;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
              }
              .stat-value {
                font-size: 18px;
                color: #333;
                font-weight: 600;
              }
              .weather-icon {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                background: rgba(255,255,255,0.2);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
              }
              @media (max-width: 768px) {
                body { padding: 10px; }
                .preview-header { padding: 20px; }
                .preview-header h1 { font-size: 24px; }
                .temperature { font-size: 48px; }
                .condition { font-size: 18px; }
                .preview-body { padding: 20px; }
                .stats { grid-template-columns: 1fr; gap: 15px; }
                .stat { padding: 15px; }
              }
            </style>
          </head>
          <body>
            <div class="preview-container">
              <div class="preview-header">
                <h1>${this.dupCity}</h1>
                <div class="weather-icon">🌤️</div>
                <div class="temperature">${this.data.current.temp_c}°C</div>
                <div class="condition">${this.data.current.condition.text}</div>
                <div class="feels-like">Feels like ${
                  this.data.current.feelslike_c
                }°C</div>
              </div>
              <div class="preview-body">
                <div class="stats">
                  <div class="stat">
                    <div class="stat-icon">💨</div>
                    <div class="stat-content">
                      <div class="stat-label">Wind</div>
                      <div class="stat-value">${
                        Math.round(this.data.current.wind_kph * 100) / 100
                      } km/h ${this.data.current.wind_dir}</div>
                    </div>
                  </div>
                  <div class="stat">
                    <div class="stat-icon">💧</div>
                    <div class="stat-content">
                      <div class="stat-label">Humidity</div>
                      <div class="stat-value">${
                        this.data.current.humidity
                      }%</div>
                    </div>
                  </div>
                  <div class="stat">
                    <div class="stat-icon">👁️</div>
                    <div class="stat-content">
                      <div class="stat-label">Visibility</div>
                      <div class="stat-value">${
                        this.data.current.vis_km
                      } km</div>
                    </div>
                  </div>
                  <div class="stat">
                    <div class="stat-icon">🌡️</div>
                    <div class="stat-content">
                      <div class="stat-label">Pressure</div>
                      <div class="stat-value">${
                        this.data.current.pressure_mb
                      } mb</div>
                    </div>
                  </div>
                  <div class="stat">
                    <div class="stat-icon">🌡️</div>
                    <div class="stat-content">
                      <div class="stat-label">Feels Like</div>
                      <div class="stat-value">${
                        this.data.current.feelslike_c
                      }°C</div>
                    </div>
                  </div>
                  <div class="stat">
                    <div class="stat-icon">🌡️</div>
                    <div class="stat-content">
                      <div class="stat-label">Dew Point</div>
                      <div class="stat-value">${
                        this.data.current.dewpoint_c
                      }°C</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  }

  toggleMapLayers(): void {
    console.log('Toggling map layers...');
    // In a real app, this would toggle different map layers
  }

  onImageError(event: any): void {
    console.error('Weather icon failed to load:', event);
    // You could set a fallback icon here
  }

  // Chart Functions
  toggleChartType(): void {
    this.chartType = this.chartType === 'line' ? 'bar' : 'line';
    setTimeout(() => this.drawTemperatureChart(), 100);
  }

  drawTemperatureChart(): void {
    const canvas = document.querySelector(
      '#temperatureChart'
    ) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Generate sample temperature data for 24 hours
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const temperatures = hours.map((hour) => {
      const baseTemp = this.data?.current?.temp_c || 20;
      const variation = Math.sin(((hour - 6) * Math.PI) / 12) * 8; // Daily temperature curve
      const random = (Math.random() - 0.5) * 4; // Random variation
      return Math.round(baseTemp + variation + random);
    });

    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const stepX = chartWidth / (hours.length - 1);
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    const tempRange = maxTemp - minTemp || 1;
    const stepY = chartHeight / tempRange;

    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i < hours.length; i += 4) {
      const x = padding + stepX * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();
    }

    // Draw temperature values on Y-axis
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const temp = maxTemp - (tempRange / 5) * i;
      const y = padding + (chartHeight / 5) * i + 4;
      ctx.fillText(`${Math.round(temp)}°`, padding - 10, y);
    }

    // Draw hour labels on X-axis
    ctx.textAlign = 'center';
    for (let i = 0; i < hours.length; i += 4) {
      const x = padding + stepX * i;
      const hour = hours[i];
      const timeLabel =
        hour === 0
          ? '12 AM'
          : hour < 12
          ? `${hour} AM`
          : hour === 12
          ? '12 PM'
          : `${hour - 12} PM`;
      ctx.fillText(timeLabel, x, canvas.height - padding + 20);
    }

    if (this.chartType === 'line') {
      this.drawLineChart(
        ctx,
        hours,
        temperatures,
        padding,
        chartWidth,
        chartHeight,
        stepX,
        stepY,
        minTemp
      );
    } else {
      this.drawBarChart(
        ctx,
        hours,
        temperatures,
        padding,
        chartWidth,
        chartHeight,
        stepX,
        stepY,
        minTemp
      );
    }
  }

  private drawLineChart(
    ctx: CanvasRenderingContext2D,
    hours: number[],
    temperatures: number[],
    padding: number,
    chartWidth: number,
    chartHeight: number,
    stepX: number,
    stepY: number,
    minTemp: number
  ): void {
    // Draw line
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let i = 0; i < hours.length; i++) {
      const x = padding + stepX * i;
      const y = padding + chartHeight - (temperatures[i] - minTemp) * stepY;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = '#667eea';
    for (let i = 0; i < hours.length; i++) {
      const x = padding + stepX * i;
      const y = padding + chartHeight - (temperatures[i] - minTemp) * stepY;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  private drawBarChart(
    ctx: CanvasRenderingContext2D,
    hours: number[],
    temperatures: number[],
    padding: number,
    chartWidth: number,
    chartHeight: number,
    stepX: number,
    stepY: number,
    minTemp: number
  ): void {
    const barWidth = stepX * 0.6;

    for (let i = 0; i < hours.length; i++) {
      const x = padding + stepX * i - barWidth / 2;
      const barHeight = (temperatures[i] - minTemp) * stepY;
      const y = padding + chartHeight - barHeight;

      // Create gradient for bars
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Add temperature labels on bars
      if (i % 4 === 0) {
        // Show every 4th bar label to avoid clutter
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${temperatures[i]}°`, x + barWidth / 2, y - 5);
      }
    }
  }

  // Sun/Moon Functions
  formatSunTime(timestamp: number | undefined): string {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  getSunProgress(): number {
    if (!this.data?.current?.sunrise || !this.data?.current?.sunset) return 0;

    const now = new Date();
    const sunrise = new Date(this.data.current.sunrise * 1000);
    const sunset = new Date(this.data.current.sunset * 1000);

    const totalDay = sunset.getTime() - sunrise.getTime();
    const elapsed = now.getTime() - sunrise.getTime();

    if (elapsed < 0) return 0;
    if (elapsed > totalDay) return 100;

    return Math.min(100, Math.max(0, (elapsed / totalDay) * 100));
  }
}
