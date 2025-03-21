import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export function Dashboard(){
    const navigate=useNavigate();
    const [show, setShow]=useState(false);
    const location=useLocation();
    const active=location.pathname.split("/").filter(Boolean).pop() || "";

    return(
        <>
            <div className="topbar">
                <img src="/logos/logo.jpg" alt="logo" onClick={()=>navigate("/")} className="topbar-image"/>
                <ul className="topbar-items">
                    <li className={`topbar-item ${active==="" || active==="home" || active==="team" ? "active" : ""}`} onClick={()=>navigate("/")}>home</li>
                    <li className={`topbar-item ${active==="matches" || active==="match" ? "active" : ""}`} onClick={()=>navigate("/matches")}>matches</li>
                    <li className={`topbar-item ${active==="stats" ? "active" : ""}`} onClick={()=>navigate("/stats")}>stats</li>
                </ul>
                <div className="topbar-menu">
                    <img src={show ? "/icons/close.png" : "/icons/menu.png"} alt={show ? "menu" : "close"} className="topbar-icon" onClick={()=>setShow(prev=>!prev)}/>
                    {show && 
                        <ul className="topbar-menu-items">
                            <li className="topbar-menu-item" onClick={()=>{ navigate("/"); setShow(prev=>!prev) }}>home</li>
                            <li className="topbar-menu-item" onClick={()=>{ navigate("/matches"); setShow(prev=>!prev) }}>matches</li>
                            <li className="topbar-menu-item" onClick={()=>{ navigate("/stats"); setShow(prev=>!prev) }}>stats</li>
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