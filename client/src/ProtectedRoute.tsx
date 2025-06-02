// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }){
    const [isAuthenticated, setIsAuthenticated]=useState(null);
    
    const apiUrl=import.meta.env.MODE==="development"
        ? import.meta.env.VITE_APP_DEV_URL 
        : import.meta.env.VITE_APP_PROD_URL
    
    useEffect(()=>{
        async function checkAuth(){
            try {
                const response=await fetch(`${apiUrl}/checkAuth`, { credentials: "include" });
                if(!response.ok){
                    setIsAuthenticated(false);
                    return;
                }
                setIsAuthenticated(true);
            } 
            catch(error){
                console.error("Auth check failed:", error);
                setIsAuthenticated(false);
            }
        }
        checkAuth();
    }, [apiUrl]);

    if(isAuthenticated===null){
        return;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
}
