import { createContext } from "react";

type ThemeContentType={
    theme: string;
    toggleTheme: ()=>void;
}

export const ThemeContext=createContext<ThemeContentType>({ 
    theme: "light", 
    toggleTheme: ()=>{} 
});
