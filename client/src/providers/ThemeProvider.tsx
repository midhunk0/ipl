import React, { useEffect, useState } from "react";
import { ThemeContext } from "../contexts/ThemeContext";


export function ThemeProvider({ children } : { children: React.ReactNode }){
    const [theme, setTheme]=useState<string>("light");

    useEffect(()=>{
        const savedTheme=localStorage.getItem("theme") || "light";
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
    }, []);

    function toggleTheme(){
        const newTheme=theme==="light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    }

    return(
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}