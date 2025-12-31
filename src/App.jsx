
import WeatherApp from "./components/weatherApp";
import ThemeContextProvider from "./context/ThemeContextProvider";
const App = () => {
   
  return (

   <ThemeContextProvider>
       <WeatherApp></WeatherApp>
   </ThemeContextProvider>
  
    
  );
};

export default App;
