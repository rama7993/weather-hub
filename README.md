# 🌤️ Weather Pro - Advanced Weather Dashboard

A modern, feature-rich weather application built with Angular 18, featuring real-time weather data, interactive maps, charts, and a beautiful glassmorphism UI design.

![Weather Pro](https://img.shields.io/badge/Angular-18-red?style=for-the-badge&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![OpenWeatherMap](https://img.shields.io/badge/API-OpenWeatherMap-green?style=for-the-badge)
![Responsive](https://img.shields.io/badge/Design-Responsive-purple?style=for-the-badge)

## ✨ Features

### 🌟 Core Features
- **Real-time Weather Data** - Current conditions, forecasts, and detailed metrics
- **Interactive Weather Map** - Full-screen map with weather overlays
- **5-Day Forecast** - Detailed weather predictions with charts
- **Hourly Forecast** - 24-hour weather timeline
- **Air Quality Index** - Real-time air quality monitoring
- **Weather Alerts** - Important weather warnings and notifications

### 🎨 UI/UX Features
- **Glassmorphism Design** - Modern glass-like interface with backdrop blur
- **Dynamic Backgrounds** - Animated gradients and particle effects
- **Dark/Light Theme** - Toggle between themes with persistent settings
- **Responsive Design** - Optimized for all screen sizes (320px to 4K)
- **Smooth Animations** - Fluid transitions and micro-interactions
- **Touch-Friendly** - Mobile-optimized interface

### 📊 Advanced Features
- **Temperature Charts** - Interactive line and bar charts
- **Weather Insights** - AI-powered weather analysis and recommendations
- **Location Services** - GPS-based weather detection
- **Search Functionality** - Find weather for any city worldwide
- **Share Weather** - Share current conditions via Web Share API
- **Weather History** - Track weather patterns over time

### 🔧 Technical Features
- **OpenWeatherMap API** - Reliable weather data source
- **PWA Ready** - Progressive Web App capabilities
- **Offline Support** - Cached data for offline viewing
- **Performance Optimized** - Fast loading and smooth interactions
- **Accessibility** - WCAG compliant design
- **SEO Friendly** - Server-side rendering support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+ or yarn 1.22+
- Angular CLI 18+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd weather-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   ```
   
   Edit `src/environments/environment.ts` and add your OpenWeatherMap API key:
   ```typescript
   export const environment = {
     production: false,
     apiKey: 'YOUR_OPENWEATHERMAP_API_KEY',
     baseUrl: 'https://api.openweathermap.org/data/2.5',
     forecastUrl: 'https://api.openweathermap.org/data/2.5/forecast',
     airQualityUrl: 'https://api.openweathermap.org/data/2.5/air_pollution',
     units: 'metric'
   };
   ```

4. **Start development server**
   ```bash
   ng serve
   # or
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:4200`

## 🔑 API Setup

### OpenWeatherMap API Key

1. **Sign up** at [OpenWeatherMap](https://openweathermap.org/api)
2. **Get your API key** from the dashboard
3. **Add the key** to your environment files
4. **Choose a plan**:
   - **Free**: 1,000 calls/day, 60 calls/minute
   - **Paid**: Higher limits and additional features

### Required API Endpoints
- Current Weather API
- 5-Day Weather Forecast API
- Air Pollution API
- Geocoding API (for city search)

## 📱 Responsive Design

### Breakpoints
- **Desktop**: 1024px+ (Full layout)
- **Tablet**: 768px-1024px (Optimized layout)
- **Mobile Large**: 600px-768px (Enhanced mobile)
- **Mobile Medium**: 480px-600px (Standard mobile)
- **Mobile Small**: 320px-480px (Compact mobile)
- **Mobile Extra Small**: <320px (Ultra-compact)

### Mobile Features
- Touch-optimized interface
- Swipe gestures for navigation
- Responsive charts and maps
- Optimized loading performance
- Offline data caching

## 🎨 Customization

### Themes
The app supports both light and dark themes with automatic system detection:

```typescript
// Toggle theme programmatically
this.toggleTheme();

// Check current theme
const isDark = this.isDarkTheme;
```

### Colors
Customize the color scheme by modifying CSS variables:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #f093fb;
  --background-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Animations
Control animation preferences:

```typescript
// Disable animations for better performance
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

## 🛠️ Development

### Project Structure
```
src/
├── app/
│   ├── components/          # Reusable components
│   ├── services/           # API and utility services
│   ├── models/             # TypeScript interfaces
│   ├── pipes/              # Custom pipes
│   └── guards/             # Route guards
├── assets/                 # Static assets
├── environments/           # Environment configurations
└── styles/                 # Global styles
```

### Available Scripts

```bash
# Development
ng serve                    # Start dev server
ng build                    # Build for production
ng test                     # Run unit tests
ng e2e                      # Run e2e tests

# Code Quality
ng lint                     # Run ESLint
ng format                   # Format code
ng generate component        # Generate new component
ng generate service         # Generate new service
```

### Building for Production

```bash
# Build with optimizations
ng build --configuration production

# Build with AOT compilation
ng build --aot

# Build with source maps
ng build --source-map
```

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on every push

### Netlify
1. **Build the project**: `ng build --configuration production`
2. **Deploy the `dist/weather-pro` folder**
3. **Set up redirects** for SPA routing

### GitHub Pages
1. **Install angular-cli-ghpages**: `npm install -g angular-cli-ghpages`
2. **Build and deploy**: `ng build --configuration production --base-href="/weather-pro/"`
3. **Deploy**: `ngh --dir=dist/weather-pro`

### Docker
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/weather-pro /usr/share/nginx/html
EXPOSE 80
```

## 📊 Performance

### Optimization Features
- **Lazy Loading** - Components loaded on demand
- **Tree Shaking** - Unused code eliminated
- **Code Splitting** - Optimized bundle sizes
- **Image Optimization** - Compressed and responsive images
- **Caching Strategy** - Intelligent data caching
- **Service Workers** - Offline functionality

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Bundle Size**: < 500KB gzipped

## 🔒 Security

### Security Features
- **API Key Protection** - Environment-based configuration
- **Input Sanitization** - XSS prevention
- **HTTPS Only** - Secure data transmission
- **Content Security Policy** - XSS protection
- **Rate Limiting** - API abuse prevention

### Best Practices
- Never commit API keys to version control
- Use environment variables for sensitive data
- Implement proper error handling
- Validate all user inputs
- Keep dependencies updated

## 🧪 Testing

### Test Coverage
- **Unit Tests** - Component and service testing
- **Integration Tests** - API integration testing
- **E2E Tests** - Full user journey testing
- **Visual Regression** - UI consistency testing

### Running Tests
```bash
# Unit tests
ng test

# E2E tests
ng e2e

# Test coverage
ng test --code-coverage

# Watch mode
ng test --watch
```

## 🤝 Contributing

### Development Workflow
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `ng test`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Style
- Follow Angular style guide
- Use TypeScript strict mode
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenWeatherMap** - Weather data API
- **Angular Team** - Amazing framework
- **Font Awesome** - Beautiful icons
- **Community** - Feedback and contributions

## 📞 Support

- **Documentation**: [Project Wiki](wiki-url)
- **Issues**: [GitHub Issues](issues-url)
- **Discussions**: [GitHub Discussions](discussions-url)
- **Email**: support@weatherpro.com

## 🔮 Roadmap

### Upcoming Features
- [ ] Weather notifications
- [ ] Historical weather data
- [ ] Weather widgets
- [ ] Social sharing
- [ ] Weather camera integration
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Voice commands

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added interactive maps and charts
- **v1.2.0** - Enhanced mobile responsiveness
- **v1.3.0** - Added air quality and alerts
- **v2.0.0** - Complete UI redesign with glassmorphism

---

**Made with ❤️ and Angular 18**

*Weather Pro - Your personal weather companion* 🌤️