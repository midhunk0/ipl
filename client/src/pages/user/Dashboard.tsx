import { useState } from "react";
import "./Dashboard.css";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

export function Dashboard(){
    const navigate=useNavigate();
    const [show, setShow]=useState<boolean>(false);
    const location=useLocation();
    const active=location.pathname.split("/").filter(Boolean).pop() || "";
    const { theme, toggleTheme }=useTheme();
    const [hover, setHover]=useState<string>("");

    let icon="";
    icon=show ? 
        theme==="dark" 
            ? hover==="menu" ? "/icons/cross-black.png" : "/icons/cross-white.png"
            : hover==="menu" ? "/icons/cross-white.png" : "/icons/cross-black.png" 
        : 
        theme==="dark" 
            ? hover==="menu" ? "/icons/menu-black.png" : "/icons/menu-white.png"
            : hover==="menu" ? "/icons/menu-white.png" : "/icons/menu-black.png" 
           
    return(
        <>
            <div className="topbar">
                <img src={theme==="dark" ? "/icons/helmet-white.png" : "/icons/helmet-black.png"} alt="logo" onClick={()=>navigate("/")} className="topbar-image"/>
                <ul className="topbar-items">
                    <li className={`topbar-item ${active==="" || active==="point-table" || active==="team" ? "active" : ""}`} onClick={()=>navigate("/")}>point table</li>
                    <li className={`topbar-item ${location.pathname.startsWith("/matches") ? "active" : ""}`} onClick={()=>navigate("/matches")}>matches</li>
                    <li className={`topbar-item ${active==="playoffs" ? "active" : ""}`} onClick={()=>navigate("/playoffs")}>playoffs</li>
                    <li className={`topbar-item ${active==="results" ? "active" : ""}`} onClick={()=>navigate("/results")}>results</li>
                    <li className={`topbar-item ${active==="stats" ? "active" : ""}`} onClick={()=>navigate("/stats")}>stats</li>
                    <li className={`topbar-item ${theme}`} onClick={toggleTheme} onMouseEnter={()=>setHover("theme")} onMouseLeave={()=>setHover("")}>
                        {theme==="light" && <img src={hover==="theme" ? "/icons/light.png" : "/icons/light-black.png"} alt="light" className="icon"/>}
                        switch
                        {theme==="dark" && <img src="/icons/dark.png" alt="dark" className="icon"/>}
                    </li>
                </ul>
                <div className="topbar-menu">
                    <img src={icon} alt={show ? "menu" : "close"} onMouseEnter={()=>setHover("menu")} onMouseLeave={()=>setHover("")} className={`topbar-icon ${show ? "close" : "menu"}`} onClick={()=>setShow(prev=>!prev)}/>
                    {show && 
                        <ul className="topbar-menu-items">
                            <li className={`topbar-menu-item ${active==="" || active==="point-table" || active==="team" ? "active" : ""}`} onClick={()=>{ navigate("/"); setShow(prev=>!prev) }}>home</li>
                            <li className={`topbar-menu-item ${location.pathname.startsWith("/matches") ? "active" : ""}`} onClick={()=>{ navigate("/matches"); setShow(prev=>!prev) }}>matches</li>
                            <li className={`topbar-menu-item ${active==="playoffs" ? "active" : ""}`} onClick={()=>{ navigate("/playoffs"); setShow(prev=>!prev)}}>playoffs</li>
                            <li className={`topbar-menu-item ${active==="results" ? "active" : ""}`} onClick={()=>{ navigate("/results"); setShow(prev=>!prev)}}>results</li>
                            <li className={`topbar-menu-item ${active==="stats" ? "active" : ""}`} onClick={()=>{ navigate("/stats"); setShow(prev=>!prev) }}>stats</li>
                            <li className="topbar-menu-item" onClick={toggleTheme}>switch</li>
                        </ul>
                    }
                </div>
            </div>
            <div className="outlet">
                <Outlet/>
            </div>
        </>
    )
}