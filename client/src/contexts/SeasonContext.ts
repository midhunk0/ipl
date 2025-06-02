import { createContext, type Dispatch, type SetStateAction } from "react";
import type { SeasonType } from "../types/type";

type SeasonContextType={
    season: SeasonType | null; 
    fetchSeason: ()=>Promise<void>;
    setSeason: Dispatch<SetStateAction<SeasonType | null>>;
}
export const SeasonContext=createContext<SeasonContextType>({
    season: null,
    fetchSeason: async()=>{},
    setSeason: ()=>{}
});