import { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../../../hooks/useTheme";
import type { LoginDataType } from "../../../types/type";

const initialLoginData: LoginDataType={
    credential: "",
    password: ""
}

export function Login(){
    const navigate=useNavigate();
    
    const apiUrl=import.meta.env.MODE==="development"
        ? import.meta.env.VITE_APP_DEV_URL 
        : import.meta.env.VITE_APP_PROD_URL

    const [loginData, setLoginData]=useState<LoginDataType>(initialLoginData);
    const [show, setShow]=useState<boolean>(false);

    const { theme }=useTheme();

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>){
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        });
    };

    async function handleLogin(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        try{
            const response=await fetch(`${apiUrl}/loginAdmin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                navigate("/admin");
                toast.success(result.message);
            }
            else{
                setLoginData(initialLoginData);
                toast.error(result.message);
            }
        }
        catch(error){
            console.log(error);
        };
    }
    
    return(
        <div className="login">
            <form className="login-form" onSubmit={handleLogin} method="POST">
                <h1>admin login</h1>
                <div className="input-container">
                    <label htmlFor="credential">email or username</label>
                    <input type="text" name="credential" id="credential" value={loginData.credential} onChange={handleInputChange}/>
                </div>
                <div className="input-container">
                    <label htmlFor="password">password</label>
                    <div className="password-container">
                        <input type={show ? "text" : "password"} name="password" id="password" value={loginData.password} onChange={handleInputChange}/>
                        <button className={`${show ? "green-button" : "red-button"}`} type="button" onClick={()=>setShow(prev=>!prev)}>
                            {show ? 
                                <img src={theme==="dark" ? "/icons/eye-white.png" : "/icons/eye-black.png"} alt="visible" className="icon eye"/> 
                                : 
                                <img src={theme==="dark" ? "/icons/eye-crossed-white.png" : "/icons/eye-crossed-black.png"} alt="visible-off" className="icon eye-crossed"/>
                            }
                        </button>
                    </div>                
                </div>
                <button className="login-button" type="submit">login</button>
                <p>Not registered? <a href="/register">register</a></p>
            </form>
        </div>
    )
};