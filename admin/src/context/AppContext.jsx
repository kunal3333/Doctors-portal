import { createContext } from "react";

export const AppContext = createContext()

const AppContextProvider = (props) => {


    
      
    const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const slotDateFormat = (slotDate) => {
      if (!slotDate || typeof slotDate !== "string") {
        return "Invalid Date"; // Handle undefined/null cases
      }
    
      const dateArray = slotDate.split("_");
      if (dateArray.length !== 3) {
        return "Invalid Date"; // Handle incorrect format cases
      }
    
      return `${dateArray[0]} ${months[Number(dateArray[1])]} ${dateArray[2]}`;
    };
    
      
    const value = {
        slotDateFormat
    }

return (
    <AppContext. Provider value={value}>
        {props.children}
        </AppContext. Provider>
)
}

export default AppContextProvider