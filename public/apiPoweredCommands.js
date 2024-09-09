async function getWeatherForecast(city) {
    const apiKey = 'b0434118644cb59a4699bb892b2a7945';
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    
  const weatherIcons = {
  'Clear': '☀️',
  'Clouds': '☁️',
  'Rain': '🌧️',
  'Snow': '❄️',
  'Thunderstorm': '⛈️',
  'Drizzle': '🌦️',
  'Mist': '🌫️'
};

const icon = weatherIcons[data.weather[0].main] || '🌈';

return `
  <div class="weather-widget">
    <div class="weather-header">
      <span class="weather-icon">${icon}</span>
      <span class="weather-city">${data.name}</span>
    </div>
    <div class="weather-details">
      <div class="weather-temp">${Math.round(data.main.temp)}°C</div>
      <div class="weather-desc">${data.weather[0].description}</div>
    </div>
    <div class="weather-info">
      <div class="weather-info-item">
        <span class="weather-info-label">Humidity:</span>
        <span class="weather-info-value">${data.main.humidity}%</span>
      </div>
      <div class="weather-info-item">
        <span class="weather-info-label">Wind:</span>
        <span class="weather-info-value">${data.wind.speed} m/s</span>
      </div>
    </div>
  </div>
`;
}



// Find out local attractions near you
async function getLocalAttractions(city) {
    const apiKey = '5ae2e3f221c38a28845f05b695c4452f0006e15d06ad13595dad9fed';
    const response = await fetch(`https://api.opentripmap.com/0.1/en/places/geoname?name=${city}&apikey=${apiKey}`);
    const cityData = await response.json();

    const attractionsResponse = await fetch(`https://api.opentripmap.com/0.1/en/places/radius?radius=1000&lon=${cityData.lon}&lat=${cityData.lat}&kinds=interesting_places&format=json&apikey=${apiKey}`);
    const attractionsData = await attractionsResponse.json();
    

    const attractionsList = attractionsData.slice(0, 5).map(attraction => `
    <a href="https://www.google.com/search?q=${encodeURIComponent(attraction.name + ' ' + city)}" target="_blank" class="attraction-item">
        <span class="attraction-icon">🏛️</span>
        <span class="attraction-name">${attraction.name}</span>
    </a>
    `).join('');

    return `
    <div class="attractions-widget">
        <div class="attractions-header">
        <span class="attractions-icon">🌆</span>
        <span class="attractions-title">Discover ${city}</span>
        </div>
        <div class="attractions-list">
        ${attractionsList}
        </div>
    </div>
    `;
}


async function getNewsHeadlines(country = 'us') {
    const apiKey = 'eb9f0854fed742a1bbae61bd45bae754';
    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${apiKey}`);
    const data = await response.json();
  
  
  const headlines = data.articles.slice(0, 5).map((article, index) => `
      <a href="${article.url}" target="_blank" class="news-item" data-index="${index + 1}">
        <div class="news-content">
          <h3 class="news-title">${article.title}</h3>
          <p class="news-description">${article.description || ''}</p>
          <span class="news-source">${article.source.name}</span>
        </div>
      </a>
    `).join('');
  
    return `
      <div class="news-widget">
        <div class="news-header">
          <span class="news-icon">📰</span>
          <span>Latest Headlines</span>
        </div>
        <div class="news-list">
          ${headlines}
        </div>
      </div>
    `;
  }