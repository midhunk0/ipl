import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Register } from "./pages/auth/register/Register";
import { Login } from "./pages/auth/login/Login";
import { Home } from "./pages/user/home/Home";
import { Matches } from "./pages/user/matches/Matches";
import { Match } from "./pages/user/match/Match";
import { Team } from "./pages/user/team/Team";
import { Stats } from "./pages/user/stats/Stats";
import { SeasonProvider, YearProvider } from "./context/seasonContext";
import { Dashboard as AdminDashboard } from "./pages/admin/Dashboard";
import { ProtectedRoute } from "./ProtectedRoute";
import { Home as AdminHome } from "./pages/admin/home/Home";
import { Season } from "./pages/admin/season/Season";
import { Team as AdminTeam } from "./pages/admin/team/Team";
import { Matches as AdminMatches } from "./pages/admin/matches/Matches";
import { Match as AdminMatch } from "./pages/admin/match/Match";
import { Dashboard } from "./pages/user/Dashboard";
import { ToastContainer } from "react-toastify";

function App(){
    return(
        <YearProvider>
            <SeasonProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Dashboard/>}>
                            <Route path="" element={<Home/>}/>
                            <Route path="home" element={<Home/>}/>
                            <Route path="team" element={<Team/>}/>
                            <Route path="matches" element={<Matches/>}/>
                            <Route path="match" element={<Match/>}/>
                            <Route path="stats" element={<Stats/>}/>
                        </Route>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/admin" element={
                            <ProtectedRoute>
                                <AdminDashboard/>
                            </ProtectedRoute>
                        }>
                            <Route path="" element={<AdminHome/>}/>
                            <Route path="season" element={<Season/>}/>
                            <Route path="team" element={<AdminTeam/>}/>
                            <Route path="matches" element={<AdminMatches/>}/>
                            <Route path="match" element={<AdminMatch/>}/>
                        </Route>
                    </Routes>
                    <ToastContainer/>
                </Router>
            </SeasonProvider>
        </YearProvider>

    )
}

export default App;