import { createContext, type Dispatch, type SetStateAction } from "react";

type YearContextType={
    year: number;
    setYear: Dispatch<SetStateAction<number>>;
}

export const YearContext=createContext<YearContextType>({
    year: new Date().getFullYear(),
    setYear: ()=>{}
});