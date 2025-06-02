import React, { useState } from "react";
import { YearContext } from "../contexts/YearContext";

export function YearProvider({ children } : { children: React.ReactNode }){
    const currentYear=new Date().getFullYear();
    const [year, setYear]=useState<number>(currentYear);

    return(
        <YearContext.Provider value={{ year, setYear }}>
            {children}
        </YearContext.Provider>
    )
}