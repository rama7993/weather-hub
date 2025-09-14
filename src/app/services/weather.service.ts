import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { WeatherData, ForecastData } from '../models/weather.model';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private readonly baseUrl = environment.weatherApi.baseUrl;
  private readonly forecastUrl = environment.weatherApi.forecastUrl;
  private readonly airQualityUrl = environment.weatherApi.airQualityUrl;
  private readonly apiKey = environment.weatherApi.apiKey;
  private readonly units = environment.weatherApi.units;

  constructor(private http: HttpClient) {}

  getWeatherData(city: string): Observable<WeatherData> {
    const params = new HttpParams()
      .set('q', city)
      .set('appid', this.apiKey)
      .set('units', this.units);

    return this.http.get<any>(this.baseUrl, { params }).pipe(
      map((response) => this.transformOpenWeatherData(response)),
      catchError((error) => {
        console.error('Error fetching weather data', error);
        return throwError(() => new Error(error));
      })
    );
  }

  getWeatherByCoords(lat: number, lon: number): Observable<WeatherData> {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('appid', this.apiKey)
      .set('units', this.units);

    return this.http.get<any>(this.baseUrl, { params }).pipe(
      map((response) => this.transformOpenWeatherData(response)),
      catchError((error) => {
        console.error('Error fetching weather data by coordinates', error);
        return throwError(() => new Error(error));
      })
    );
  }

  getForecastData(city: string): Observable<ForecastData> {
    const params = new HttpParams()
      .set('q', city)
      .set('appid', this.apiKey)
      .set('units', this.units);

    return this.http.get<any>(this.forecastUrl, { params }).pipe(
      map((response) => this.transformForecastData(response)),
      catchError((error) => {
        console.error('Error fetching forecast data', error);
        return throwError(() => new Error(error));
      })
    );
  }

  getAirQualityData(lat: number, lon: number): Observable<any> {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('appid', this.apiKey);

    return this.http.get<any>(this.airQualityUrl, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching air quality data', error);
        return throwError(() => new Error(error));
      })
    );
  }

  private transformOpenWeatherData(data: any): WeatherData {
    return {
      location: {
        name: data.name,
        region: data.sys.country,
        country: data.sys.country,
        lat: data.coord.lat,
        lon: data.coord.lon,
        tz_id: 'UTC',
        localtime_epoch: Math.floor(Date.now() / 1000),
        localtime: new Date().toISOString(),
      },
      current: {
        last_updated_epoch: data.dt,
        last_updated: new Date(data.dt * 1000).toISOString(),
        temp_c: data.main.temp,
        temp_f: Math.round(((data.main.temp * 9) / 5 + 32) * 100) / 100,
        is_day: data.weather[0].icon.includes('d') ? 1 : 0,
        condition: {
          text: data.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          code: data.weather[0].id,
        },
        wind_mph: Math.round(data.wind.speed * 2.237 * 100) / 100,
        wind_kph: data.wind.speed * 3.6,
        wind_degree: data.wind.deg || 0,
        wind_dir: this.getWindDirection(data.wind.deg || 0),
        pressure_mb: data.main.pressure,
        pressure_in: Math.round(data.main.pressure * 0.03 * 100) / 100,
        precip_mm: data.rain?.['1h'] || 0,
        precip_in: Math.round((data.rain?.['1h'] || 0) * 0.039 * 100) / 100,
        humidity: data.main.humidity,
        cloud: data.clouds.all,
        feelslike_c: data.main.feels_like,
        feelslike_f:
          Math.round(((data.main.feels_like * 9) / 5 + 32) * 100) / 100,
        vis_km: Math.round((data.visibility / 1000) * 1000) / 1000,
        vis_miles: Math.round((data.visibility / 1609.34) * 1000) / 1000,
        uv: 0, // UV not available in basic OpenWeatherMap
        gust_mph: Math.round((data.wind.gust || 0) * 2.237 * 100) / 100,
        gust_kph: (data.wind.gust || 0) * 3.6,
        dewpoint_c: this.calculateDewPoint(data.main.temp, data.main.humidity),
        dewpoint_f:
          Math.round(
            ((this.calculateDewPoint(data.main.temp, data.main.humidity) * 9) /
              5 +
              32) *
              1000
          ) / 1000,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
      },
    };
  }

  private transformForecastData(data: any): ForecastData {
    const forecastDays = data.list
      .filter((item: any, index: number) => index % 8 === 0)
      .slice(0, 5);

    return {
      location: {
        name: data.city.name,
        region: data.city.country,
        country: data.city.country,
        lat: data.city.coord.lat,
        lon: data.city.coord.lon,
        tz_id: 'UTC',
        localtime_epoch: Math.floor(Date.now() / 1000),
        localtime: new Date().toISOString(),
      },
      forecast: {
        forecastday: forecastDays.map((day: any) => ({
          date: day.dt_txt.split(' ')[0],
          date_epoch: day.dt,
          day: {
            maxtemp_c: day.main.temp_max,
            maxtemp_f:
              Math.round(((day.main.temp_max * 9) / 5 + 32) * 100) / 100,
            mintemp_c: day.main.temp_min,
            mintemp_f:
              Math.round(((day.main.temp_min * 9) / 5 + 32) * 100) / 100,
            avgtemp_c: day.main.temp,
            avgtemp_f: Math.round(((day.main.temp * 9) / 5 + 32) * 100) / 100,
            maxwind_mph: Math.round(day.wind.speed * 2.237 * 100) / 100,
            maxwind_kph: day.wind.speed * 3.6,
            totalprecip_mm: day.rain?.['3h'] || 0,
            totalprecip_in:
              Math.round((day.rain?.['3h'] || 0) * 0.039 * 100) / 100,
            totalsnow_cm: 0,
            avgvis_km: Math.round((day.visibility / 1000) * 1000) / 1000,
            avgvis_miles: Math.round((day.visibility / 1609.34) * 1000) / 1000,
            avghumidity: day.main.humidity,
            daily_will_it_rain: day.rain ? 1 : 0,
            daily_chance_of_rain: day.pop * 100,
            daily_will_it_snow: 0,
            daily_chance_of_snow: 0,
            condition: {
              text: day.weather[0].description,
              icon: `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`,
              code: day.weather[0].id,
            },
            uv: 0,
          },
          astro: {
            sunrise: '06:00 AM',
            sunset: '06:00 PM',
            moonrise: '06:00 PM',
            moonset: '06:00 AM',
            moon_phase: 'Waxing Gibbous',
            moon_illumination: 50,
            is_moon_up: 1,
            is_sun_up: 1,
          },
          hour: [], // Simplified for this example
        })),
      },
    };
  }

  private getWindDirection(degrees: number): string {
    const directions = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  private calculateDewPoint(tempC: number, humidity: number): number {
    const a = 17.27;
    const b = 237.7;
    const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100);
    const dewPoint = (b * alpha) / (a - alpha);
    return Math.round(dewPoint * 1000) / 1000;
  }
}
