import axios from "axios";
import { useEffect, useState } from "react";

const api_key = process.env.REACT_APP_API_KEY

const Country = ({country}) => {
  const [weather, setWeather] = useState(null);

  useEffect(()=> {
      let url = `https://api.openweathermap.org/data/2.5/weather?q=${country.capital[0]}&units=metric&appid=${api_key}`;
      axios.get(url)
      .then(response => setWeather(response.data)
      )

  }, [])


  const languages = (langDict) => {
    let l = []
    for(let key in langDict){
      l.push(<li key={l.length+1}>{langDict[key]}</li>);
    }
    return l;
  }

  const iconUrl = () => {
    if(weather){
      let iconId = weather.weather[0].icon;
      return `https://openweathermap.org/img/wn/${iconId}@2x.png`
    }
    else{
      return 'https://openweathermap.org/img/wn/01d@2x.png'
    }
    
  }

  return  <div>
    <h1>{country.name.common}</h1>
    <div>capital: {country.capital[0]}</div>
    <div>area: {country.area}</div>

    <h3>languages</h3>
    <ul>{languages(country.languages)}</ul>
    <img src={country.flags.png} alt="flag"/>

    {weather && <div>
            <h2>Weather in {country.capital[0]}</h2>
            <div>temperature {weather.main.temp}Celsius</div>
            <img src={iconUrl()} alt='weather-icon'/>
            <div>wind {weather.wind.speed}m/s</div>
          </div>
    }
  </div>
}

const ListCountries = ({countries, show}) => {
  const selectCountry = (event) => {
      show(event.target.getAttribute('country-name'));
  }
   return countries.map(country => {
        return <div key={`${country.latlng[0]}${country.latlng[1]}`}>
                    {country.name.common}
                    <button country-name={country.name.common} onClick={selectCountry}>show</button>
                </div>
   
      })
}


function App() {
  const [country, setCountry] = useState('');
  const [filterdCountry, setFilterCountry]  = useState([]);
  const [allCountries, setAllCountries]  = useState([]);


  useEffect(() => {
      axios.get('https://restcountries.com/v3.1/all')
      .then(response => {
        setAllCountries(response.data)
      })
  }, [])

  const handleQueryChange = (event) => {
    let query = event.target.value
    setCountry(query);
    setFilterCountry(
      allCountries.filter(country => {
        return (country.name.common).toLowerCase().includes(query.toLowerCase())
      })
      )
  }

  const displayCountry = (countryName) => {
    setFilterCountry(
      allCountries.filter(country => country.name.common === countryName)
      )
  }


  return <div>
        <div>
          find countries <input value={country} onChange={handleQueryChange} />
        </div>
          {filterdCountry.length > 10 ?
            <div>Too many matches, specify another filter</div> : 
            filterdCountry.length === 1 ? 
                      <Country country={filterdCountry[0]} /> : 
                      <ListCountries countries={filterdCountry} show={displayCountry}/>
          }
        
        </div>
}

export default App;
