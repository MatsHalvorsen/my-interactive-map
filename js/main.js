const map = L.map('map').setView([20, 0], 2);

const searchLayers = new L.LayerGroup();

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

fetch("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
  .then(response => response.json())
  .then(data => {
    const geoJsonLayer = L.geoJSON(data, {
      style: {
        color: "#000",
        weight: 1,
        fillOpacity: 0.7
      },
      onEachFeature: onEachFeature
    }).addTo(map);
    map.addControl(new L.Control.Search({
        layer: searchLayers,
        propertyName: 'name', // Change this line
        initial: false,
        autoCollapse: true,
        autoType: true,
        minLength: 1,
        zoom: 5,
        position: 'topleft',
        buildTip: function (text, val) {
          const type = val.layer.feature.properties.name.common;
          return '<a href="#" class="search-tip">' + type + '</a>';
        },
        filterData: function (text, records) {
          let ret = {};
      
          for (let i in records) {
            const props = records[i].layer.feature.properties;
      
            if (props.name.common.toLowerCase().indexOf(text.toLowerCase()) !== -1) {
              ret[i] = records[i];
            }
          }
      
          return ret;
        },
      }));
      
      
      
      
  });

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: (e) => {
        highlightFeature(e.target);
        layer.openPopup();
      },
      mouseout: (e) => {
        resetHighlight(e.target);
        layer.closePopup();
      }
    });
    layer.on('mouseover', async (e) => {
        const countryInfo = await getCountryInfo(feature.properties.name);
        layer.bindPopup(countryInfo).openPopup();
        searchLayers.addLayer(layer);

      });
      
  }
  
  function highlightFeature(layer) {
    layer.setStyle({
      weight: 3,
      color: "#666",
      fillOpacity: 0.9
    });
  }
  
  function resetHighlight(layer) {
    layer.setStyle({
      weight: 1,
      color: "#000",
      fillOpacity: 0.7
    });
  }
  
  async function getCountryInfo(countryName) {
    const apiUrl = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;
  
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      if (!response.ok) {
        console.error('Error fetching country data:', response.status, data);
        return 'Error fetching country data';
      }
  
      const country = data[0];
  
      const countryInfo = `
        <strong>Country:</strong> ${country.name.common}<br>
        <strong>Capital:</strong> ${country.capital}<br>
        <strong>Population:</strong> ${country.population}<br>
        <strong>Area:</strong> ${country.area} km²<br>
        <strong>Currencies:</strong> ${Object.values(country.currencies).map(currency => `${currency.name} (${currency.symbol})`).join(', ')}<br>
        <strong>Languages:</strong> ${Object.values(country.languages).join(', ')}
      `;
  
      return countryInfo;
    } catch (error) {
      console.error('Error fetching country data:', error);
      return 'Error fetching country data';
    }
  }
  
  
  
  