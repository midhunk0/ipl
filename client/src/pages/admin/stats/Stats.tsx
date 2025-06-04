import { useState } from "react";
import "./Stats.css";
import { toast } from "react-toastify";
import { SeasonStats } from "../../../components/seasonStats/SeasonStats";
import { useTheme } from "../../../hooks/useTheme";
import { useYear } from "../../../hooks/useYear";
import { useSeason } from "../../../hooks/useSeason";
import type { StatsType } from "../../../types/type";

const initialStats={
    champion: "",
    runnerUp: "",
    fairPlayAward: "",
    orangeCap: { name: "", runs: "", team: "" },
    purpleCap: { name: "", wickets: "", team: "" },
    most6s: { name: "", number: "", team: "" },
    most4s: { name: "", number: "", team: "" },
    mostValuablePlayer: { name: "", for: "", team: "" },
    emergingPlayer: { name: "", for: "", team: "" }
}

export function Stats(){
    const apiUrl=import.meta.env.MODE==="development"
        ? import.meta.env.VITE_APP_DEV_URL 
        : import.meta.env.VITE_APP_PROD_URL

    const [stats, setStats]=useState<StatsType>(initialStats);
    const [hover, setHover]=useState<string>("");
    const [activeDropdown, setActiveDropdown]=useState<string>("");

    const { theme }=useTheme();
    const { year }=useYear();
    const { season }=useSeason();
    if(!season){
        return;
    }
    const seasonStats=season.stats;

    function handleInput(e: React.ChangeEvent<HTMLInputElement>, item: keyof StatsType){
        setStats({
            ...stats,
            [item]: {
                ...(stats[item] as object),
                [e.target.name]: e.target.value
            }
        });
    };

    async function handleAddStats(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        try{
            const response=await fetch(`${apiUrl}/addStats/${year}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(stats),
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                setStats(initialStats);
                toast.success(result.message);
            }
            else{
                toast.error(result.message);
            }
        }
        catch(error){
            console.log(error);
        }
    }

    function ToggleIcon({ item } : { item: string}){
        return(
            <button type="button">
                <img
                    src={
                        theme==="light"
                            ? activeDropdown===item
                                ? "/icons/up-black.png"
                                : "/icons/down-black.png"
                            : activeDropdown===item
                                ? "/icons/up-white.png"
                                : "/icons/down-white.png"
                    }
                    alt="toggle"
                    className="icon"
                />
            </button>
        )
    }

    function formatLabel(text: string){
        return text
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, str=>str.toUpperCase());
    }

    function ItemContainer({ item }: { item: keyof StatsType }){
        return(
            <div className="input-container">
                <h3>{formatLabel(item)}</h3>
                <div className="input selection" onClick={()=>setActiveDropdown(activeDropdown===item ? "" : item)}>
                    <p>{typeof stats[item]==="string" && stats[item]!=="" ? stats[item] : "Choose team"}</p>
                    <ToggleIcon item={item}/>
                    {activeDropdown===item && (
                        <div className="select">
                            {season?.teams.map((team, index)=>(
                                <div
                                    className="input"
                                    key={index}
                                    onClick={(e)=>{
                                        e.stopPropagation();
                                        setStats({ ...stats, [item]: team.name });
                                        setActiveDropdown("");
                                    }}
                                >
                                    <p>{team.name}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    function SubItemContainer({ item }: { item: keyof Pick<StatsType, "orangeCap" | "purpleCap" | "most6s" | "most4s" | "mostValuablePlayer" | "emergingPlayer">}){
        return(
            <div className="input-container">
                <label htmlFor={item}>team</label>
                <div className="input selection" onClick={()=>setActiveDropdown(activeDropdown===item ? "" : item)}>
                    <p>{stats[item].team!=="" ? stats[item].team : "Choose team"}</p>
                    <ToggleIcon item={item}/>
                    {activeDropdown===item && (
                        <div className="select">
                            {season?.teams.map((team, index)=>(
                                <div
                                    className="input"
                                    key={index}
                                    onClick={(e)=>{
                                        e.stopPropagation();
                                        setStats({ 
                                            ...stats, 
                                            [item]: {
                                                ...(stats[item] as object),
                                                team: team.name
                                            }
                                        });
                                        setActiveDropdown("");
                                    }}
                                >
                                    <p>{team.name}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return(
        <div className="admin-stats">
            {seasonStats && seasonStats.orangeCap.name!=="" ? (
                <SeasonStats/>
            ):(
                <form className="admin-stats-form" method="post" onSubmit={handleAddStats}>
                    <h1>IPL {year} season stats</h1>
                    <ItemContainer item="champion"/>
                    <ItemContainer item="runnerUp"/>
                    <ItemContainer item="fairPlayAward"/>
                    
                    <div className="input-container">
                        <h3>orange cap</h3>
                        <div className="admin-stats-expand">
                            <div className="input-container">
                                <label htmlFor="orangeCapName">name</label>
                                <input type="text" name="name" id="orangeCapName" value={stats.orangeCap.name} onChange={(e)=>handleInput(e, "orangeCap")}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="orangeCapRuns">runs</label>
                                <input type="text" name="runs" id="orangeCapRuns" value={stats.orangeCap.runs} onChange={(e)=>handleInput(e, "orangeCap")}/>
                            </div>
                            <SubItemContainer item="orangeCap"/>
                        </div>
                    </div>
                    
                    <div className="input-container">
                        <h3>purple cap</h3>
                        <div className="admin-stats-expand">
                            <div className="input-container">
                                <label htmlFor="purpleCapName">name</label>
                                <input type="text" name="name" id="purpleCapName" value={stats.purpleCap.name} onChange={(e)=>handleInput(e, "purpleCap")}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="purpleCapRuns">wickets</label>
                                <input type="text" name="wickets" id="purpleCapRuns" value={stats.purpleCap.wickets} onChange={(e)=>handleInput(e, "purpleCap")}/>
                            </div>
                            <SubItemContainer item="purpleCap"/>
                        </div>
                    </div>

                    <div className="input-container">
                        <h3>most 6s</h3>
                        <div className="admin-stats-expand">
                            <div className="input-container">
                                <label htmlFor="most6sName">name</label>
                                <input type="text" name="name" id="most6sName" value={stats.most6s.name} onChange={(e)=>handleInput(e, "most6s")}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="most6s">number</label>
                                <input type="text" name="number" id="most6s" value={stats.most6s.number} onChange={(e)=>handleInput(e, "most6s")}/>
                            </div>
                            <SubItemContainer item="most6s"/>
                        </div>
                    </div>

                    <div className="input-container">
                        <h3>most 4s</h3>
                        <div className="admin-stats-expand">
                            <div className="input-container">
                                <label htmlFor="most4sName">name</label>
                                <input type="text" name="name" id="most4sName" value={stats.most4s.name} onChange={(e)=>handleInput(e, "most4s")}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="most4s">number</label>
                                <input type="text" name="number" id="most4s" value={stats.most4s.number} onChange={(e)=>handleInput(e, "most4s")}/>
                            </div>
                            <SubItemContainer item="most4s"/>
                        </div>
                    </div>

                    <div className="input-container">
                        <h3>most valuable player</h3>
                        <div className="admin-stats-expand">
                            <div className="input-container">
                                <label htmlFor="MVPName">name</label>
                                <input type="text" name="name" id="MVPName" value={stats.mostValuablePlayer.name} onChange={(e)=>handleInput(e, "mostValuablePlayer")}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="MVPFor">for</label>
                                <input type="text" name="for" id="MVPFor" value={stats.mostValuablePlayer.for} onChange={(e)=>handleInput(e, "mostValuablePlayer")}/>
                            </div>
                            <SubItemContainer item="mostValuablePlayer"/>
                        </div>
                    </div>

                    <div className="input-container">
                        <h3>emerging player</h3>
                        <div className="admin-stats-expand">
                            <div className="input-container">
                                <label htmlFor="emergingPlayerName">name</label>
                                <input type="text" name="name" id="emergingPlayerName" value={stats.emergingPlayer.name} onChange={(e)=>handleInput(e, "emergingPlayer")}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="emergingPlayerFor">for</label>
                                <input type="text" name="for" id="emergingPlayerFor" value={stats.emergingPlayer.for} onChange={(e)=>handleInput(e, "emergingPlayer")}/>
                            </div>
                            <SubItemContainer item="emergingPlayer"/>
                        </div>
                    </div>

                    <div className="admin-stats-buttons">
                        <button className="black-button" type="button" onClick={()=>setStats(initialStats)} onMouseEnter={()=>setHover("cross")} onMouseLeave={()=>setHover("")}>
                            <img src={theme==="dark"? hover==="cross" ? "/icons/cross-black.png" : "/icons/cross-white.png": hover==="cross" ? "/icons/cross-white.png" : "/icons/cross-black.png"} alt="close" className="icon"/>
                            <span>clear</span>
                        </button>
                        <button className="green-button" type="submit" onMouseEnter={()=>setHover("add")} onMouseLeave={()=>setHover("")}>
                            <img src={theme==="dark"? "/icons/plus-white.png": hover==="add" ? "/icons/plus-white.png" : "/icons/plus-black.png" }alt="add" className="icon"/>
                            <span>add stats</span>
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}