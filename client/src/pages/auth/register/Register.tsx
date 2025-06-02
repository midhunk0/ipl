import { useState } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../../../hooks/useTheme";
import type { RegisterDataType } from "../../../types/type";

const initialRegisterData: RegisterDataType={
    username: "",
    email: "",
    password: ""
}

export function Register(){
    const navigate=useNavigate();

    const apiUrl=import.meta.env.MODE==="development"
        ? import.meta.env.VITE_APP_DEV_URL 
        : import.meta.env.VITE_APP_PROD_URL

    const [registerData, setRegisterData]=useState<RegisterDataType>(initialRegisterData);
    const [show, setShow]=useState<boolean>(false);

    const { theme }=useTheme();

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>){
        setRegisterData({
            ...registerData,
            [e.target.name]: e.target.value
        });
    };

    async function handleRegister(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        try{
            const response=await fetch(`${apiUrl}/registerAdmin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registerData),
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                navigate("/admin");
                toast.success(result.message);
            }
            else{
                setRegisterData(initialRegisterData);
                toast.error(result.message);
            }
        }
        catch(error){
            console.log(error);
        }
    };

    return(
        <div className="register">
            <form className="register-form" onSubmit={handleRegister} method="POST">
                <h1>admin register</h1>
                <div className="input-container">
                    <label htmlFor="username">username</label>
                    <input type="text" name="username" id="username" value={registerData.username} onChange={handleInputChange}/>
                </div>
                <div className="input-container">
                    <label htmlFor="email">email</label>
                    <input type="email" name="email" id="email" value={registerData.email} onChange={handleInputChange}/>
                </div>
                <div className="input-container">
                    <label htmlFor="password">password</label>
                    <div className="password-container">
                        <input className="register-input" type={show ? "text" : "password"} name="password" id="password" value={registerData.password} onChange={handleInputChange}/>
                        <button type="button" className={`${show ? "green-button": "red-button"}`} onClick={()=>setShow(prev=>!prev)}>
                            {show ? 
                                <img src={theme==="dark" ? "/icons/eye-white.png" : "/icons/eye-black.png"} alt="visible" className="icon eye"/> 
                            : 
                                <img src={theme==="dark" ? "/icons/eye-crossed-white.png" : "/icons/eye-crossed-black.png"} alt="visible-off" className="icon eye-crossed"/>
                            }
                        </button>
                    </div>
                </div>
                <button className="register-button" type="submit">register</button>
                <p>Already registered? <a href="/login">login</a></p>
            </form>
        </div>
    )
}