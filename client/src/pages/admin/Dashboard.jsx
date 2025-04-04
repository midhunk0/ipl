import React, { useState } from "react";
import "./Dashboard.css";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export function Dashboard(){
    const navigate=useNavigate();
    const [show, setShow]=useState(false);
    const location=useLocation();
    const active=location.pathname.split("/").filter(Boolean).pop() || "";

    return(
        <>
            <div className="topbar">
                <img src="/logos/logo.jpg" alt="logo" onClick={()=>navigate("/admin")} className="topbar-image"/>
                <ul className="topbar-items">
                    <li className={`topbar-item ${active==="admin" ? "active" : ""}`} onClick={()=>navigate("/admin")}>home</li>
                    <li className={`topbar-item ${active==="point-table" || active==="team" ? "active" : ""}`} onClick={()=>navigate("/admin/point-table")}>point table</li>
                    <li className={`topbar-item ${location.pathname.startsWith("/admin/matches") ? "active" : ""}`} onClick={()=>navigate("/admin/matches")}>matches</li>
                    <li className={`topbar-item ${active==="stats" ? "active" : ""}`} onClick={()=>navigate("/admin/stats")}>stats</li>
                </ul>
                <div className="topbar-menu">
                    <div className="topbar-menu-icons">
                        <img src={show ? `/icons/cross-black.png` : `/icons/menu-black.png`} alt={show ? "close" : "menu"} className={`topbar-icon ${show ? "close" : "menu"}`} onClick={()=>setShow(prev=>!prev)}/>
                    </div>
                    {show && 
                        <ul className="topbar-menu-items">
                            <li className={`topbar-menu-item ${active==="admin" ? "active" : ""}`} onClick={()=>{ navigate("/admin"); setShow(prev=>!prev) }}>home</li>
                            <li className={`topbar-menu-item ${active==="point-table" || active==="team" ? "active" : ""}`} onClick={()=>{ navigate("/admin/point-table"); setShow(prev=>!prev) }}>point table</li>
                            <li className={`topbar-menu-item ${location.pathname.startsWith("/admin/matches") ? "active" : ""}`} onClick={()=>{ navigate("/admin/matches"); setShow(prev=>!prev) }}>matches</li>
                            <li className={`topbar-item ${active==="stats" ? "active" : ""}`} onClick={()=>navigate("/admin/stats")}>stats</li>
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