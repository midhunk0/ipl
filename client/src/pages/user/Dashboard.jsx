import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export function Dashboard(){
    const navigate=useNavigate();
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
            </div>
            <div className="outlet">
                <Outlet/>
            </div>
        </>
    )
}