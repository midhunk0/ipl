import { useState } from "react";
import "./Home.css";
import { PointTable } from "../../../components/pointTable/PointTable";
import { toast } from "react-toastify";
import { WinLoseTable } from "../../../components/winLoseTable/WinLoseTable";
import { useTheme } from "../../../hooks/useTheme";
import { useYear } from "../../../hooks/useYear";
import { useSeason } from "../../../hooks/useSeason";
import type { TeamInputType } from "../../../types/type";

const initialTeamInput={
    name: "",
    short: "",
    home: [""]
}

export function Home(){
    const apiUrl=import.meta.env.MODE==="development"
        ? import.meta.env.VITE_APP_DEV_URL 
        : import.meta.env.VITE_APP_PROD_URL

    const [teamData, setTeamData]=useState<TeamInputType>(initialTeamInput);
    const [showForm, setShowForm]=useState<boolean>(false);
    const [tableSwitch, setTableSwitch]=useState<boolean>(true);
    const [hover, setHover]=useState<string>("");

    const { theme }=useTheme();
    const { year }=useYear();
    const { season, fetchSeason }=useSeason();
    if(!season){
        return;
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>){
        setTeamData({
            ...teamData,
            [e.target.name]: e.target.value
        });
    };

    function handleHomeChange(index: number, home: string){
        const updatedHome=[...teamData.home];
        updatedHome[index]=home;
        setTeamData({
            ...teamData,
            home: updatedHome
        });
    }

    function handleHomeAdd(){
        setTeamData({
            ...teamData,
            home: [ ...teamData.home, "" ]
        })
    };

    function handleHomeRemove(index: number){
        setTeamData((prev)=>{
            const updatedHome=prev.home.filter((_, i)=>i!==index)
            return { ...prev, home: updatedHome};
        })
    }

    async function handleAddTeam(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        try{
            const response=await fetch(`${apiUrl}/addTeam`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...teamData, year }),
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                fetchSeason();
                setShowForm(false);
                setTeamData(initialTeamInput)
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

    return(
        <div className="admin-home">
            <div className="admin-home-header">
                <h1>IPL {season.year}</h1>
                {!showForm && 
                    <div className="admin-home-buttons">
                        <button className="green-button" onClick={()=>setShowForm(prev=>!prev)} onMouseEnter={()=>setHover("add")} onMouseLeave={()=>setHover("")}>
                            <img src={theme==="dark" ? "/icons/plus-white.png" : hover==="add" ? "/icons/plus-white.png" : "/icons/plus-black.png"} alt="add" className="icon"/>
                            <span>add new team</span>
                        </button>
                        <button className="black-button" onClick={()=>setTableSwitch(prev=>!prev)}>switch table</button>
                    </div>
                }
            </div>
            {!showForm ? (
                <div className="admin-home-details">
                    {tableSwitch ? 
                        <PointTable teamDest="/admin/team" matchDest="/admin/matches"/>
                    : 
                        <WinLoseTable teamDest="/admin/team"/>
                    }
                </div>
            ) : (
                <form className="admin-home-add-team-form" onSubmit={handleAddTeam} method="POST">
                    <h2>add new team</h2>
                    <div className="input-container">
                        <label htmlFor="name">name</label>
                        <input type="text" name="name" id="name" value={teamData.name} onChange={handleInputChange}/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="short">short</label>
                        <input type="text" name="short" id="short" value={teamData.short} onChange={handleInputChange}/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="home">home</label>
                        {teamData.home.map((home, index)=>(
                            <div key={index} className="admin-home-input-wrapper">
                                <input type="text" value={home} id="home" onChange={(e)=>handleHomeChange(index, e.target.value)} />
                                {index==0 && (
                                    <button type="button" className="green-button" onClick={handleHomeAdd} onMouseEnter={()=>setHover("add1")} onMouseLeave={()=>setHover("")}>
                                        <img src={theme==="dark" ? "/icons/plus-white.png" : hover==="add1" ? "/icons/plus-white.png" : "/icons/plus-black.png"} alt="add" className="icon"/>
                                    </button>
                                )}
                                {index>0 && (
                                    <button type="button" className="red-button" onClick={()=>handleHomeRemove(index)} onMouseEnter={()=>setHover("remove")} onMouseLeave={()=>setHover("")}>
                                        <img src={hover==="remove" ? "/icons/trash-white.png" : "/icons/trash-red.png"} alt="delete" className="icon"/>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="admin-home-form-buttons">
                        <button className="black-button" type="button" onClick={()=>setShowForm(prev=>!prev)} onMouseEnter={()=>setHover("close")} onMouseLeave={()=>setHover("")}>
                            <img src={theme==="dark" ? hover==="close" ? "/icons/cross-black.png" : "/icons/cross-white.png" : hover==="close" ? "/icons/cross-white.png" : "/icons/cross-black.png"} alt="close" className="icon"/>
                            <span>close</span>
                        </button>
                        <button className="green-button" type="submit" onMouseEnter={()=>setHover("add2")} onMouseLeave={()=>setHover("")}>
                            <img src={theme==="dark" ? "/icons/plus-white.png" : hover==="add2" ? "/icons/plus-white.png" : "/icons/plus-black.png"} alt="add" className="icon"/>
                            <span>add new team</span>
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}