// @ts-nocheck
import { useState } from "react";
import "./Dashboard.css";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

export function Dashboard(){
    const navigate=useNavigate();
    const [show, setShow]=useState(false);
    const location=useLocation();
    const active=location.pathname.split("/").filter(Boolean).pop() || "";
    const { theme, toggleTheme }=useTheme();
    const [hover, setHover]=useState("");

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
            <div className="admin-topbar">
                <img src={theme==="dark" ? "/icons/helmet-white.png" : "/icons/helmet-black.png"} alt="logo" onClick={()=>navigate("/admin")} className="admin-topbar-image"/>
                <ul className="admin-topbar-items">
                    <li className={`admin-topbar-item ${active==="admin" ? "active" : ""}`} onClick={()=>navigate("/admin")}>home</li>
                    <li className={`admin-topbar-item ${active==="point-table" || active==="team" ? "active" : ""}`} onClick={()=>navigate("/admin/point-table")}>point table</li>
                    <li className={`admin-topbar-item ${location.pathname.startsWith("/admin/matches") ? "active" : ""}`} onClick={()=>navigate("/admin/matches")}>matches</li>
                    <li className={`admin-topbar-item ${active==="results" ? "active" : ""}`} onClick={()=>navigate("/admin/results")}>results</li>
                    <li className={`admin-topbar-item ${active==="stats" ? "active" : ""}`} onClick={()=>navigate("/admin/stats")}>stats</li>
                    <li className="admin-topbar-item" onClick={toggleTheme}>toggle</li>
                </ul>
                <div className="admin-topbar-menu">
                    <img src={icon} alt={show ? "menu" : "close"} className={`admin-topbar-icon ${show ? "close" : "menu"}`} onClick={()=>setShow(prev=>!prev)} onMouseEnter={()=>setHover("menu")} onMouseLeave={()=>setHover("")}/>
                    {show && 
                        <ul className="admin-topbar-menu-items">
                            <li className={`admin-topbar-menu-item ${active==="admin" ? "active" : ""}`} onClick={()=>{ navigate("/admin"); setShow(prev=>!prev) }}>home</li>
                            <li className={`admin-topbar-menu-item ${active==="point-table" || active==="team" ? "active" : ""}`} onClick={()=>{ navigate("/admin/point-table"); setShow(prev=>!prev) }}>point table</li>
                            <li className={`admin-topbar-menu-item ${location.pathname.startsWith("/admin/matches") ? "active" : ""}`} onClick={()=>{ navigate("/admin/matches"); setShow(prev=>!prev) }}>matches</li>
                            <li className={`admin-topbar-item ${active==="results" ? "active" : ""}`} onClick={()=>{ navigate("/admin/results"); setShow(prev=>!prev) }}>results</li>
                            <li className={`admin-topbar-item ${active==="stats" ? "active" : ""}`} onClick={()=>{ navigate("/admin/stats"); setShow(prev=>!prev) }}>stats</li>
                            <li className="admin-topbar-item" onClick={toggleTheme}>toggle</li>
                        </ul>
                    }
                </div>
            </div>
            <div className="admin-outlet">
                <Outlet/>
            </div>
        </>
    )
}