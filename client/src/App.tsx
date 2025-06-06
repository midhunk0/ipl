import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./providers/ThemeProvider";
import { YearProvider } from "./providers/YearProvider";
import { SeasonProvider } from "./providers/SeasonProvider";
import { Register } from "./pages/auth/register/Register";
import { Login } from "./pages/auth/login/Login";
import { Home } from "./pages/user/home/Home";
import { Matches } from "./pages/user/matches/Matches";
import { Match } from "./pages/user/match/Match";
import { Team } from "./pages/user/team/Team";
import { Stats } from "./pages/user/stats/Stats";
import { Dashboard as AdminDashboard } from "./pages/admin/Dashboard";
import { ProtectedRoute } from "./ProtectedRoute";
import { Season } from "./pages/admin/season/Season";
import { Home as AdminHome } from "./pages/admin/home/Home";
import { Team as AdminTeam } from "./pages/admin/team/Team";
import { Matches as AdminMatches } from "./pages/admin/matches/Matches";
import { Match as AdminMatch } from "./pages/admin/match/Match";
import { Stats as AdminStats } from "./pages/admin/stats/Stats";
import { Playoffs as AdminPlayoffs } from "./pages/admin/playoffs/Playoffs";
import { Dashboard } from "./pages/user/Dashboard";
import { ToastContainer } from "react-toastify";
import { Results as AdminResults} from "./pages/admin/results/Results";
import { Results } from "./pages/user/results/Results";
import { Playoffs } from "./pages/user/playoffs/Playoffs";

function App() {
    return(
        <ThemeProvider>
            <YearProvider>
                <SeasonProvider>
                    <Router>
                        <Routes>
                            <Route path="/" element={<Dashboard/>}>
                                <Route path="" element={<Home/>}/>
                                <Route path="point-table" element={<Home/>}/>
                                <Route path="team" element={<Team/>}/>
                                <Route path="matches" element={<Matches/>}/>
                                <Route path="matches/:matchId" element={<Match/>}/>
                                <Route path="playoffs" element={<Playoffs/>}/>
                                <Route path="results" element={<Results/>}/>
                                <Route path="stats" element={<Stats/>}/>
                            </Route>
                            <Route path="/register" element={<Register/>}/>
                            <Route path="/login" element={<Login/>}/>
                            <Route path="/admin" element={
                                <ProtectedRoute>
                                    <AdminDashboard/>
                                </ProtectedRoute>
                            }>
                                <Route path="" element={<Season/>}/>
                                <Route path="point-table" element={<AdminHome/>}/>
                                <Route path="team" element={<AdminTeam/>}/>
                                <Route path="matches" element={<AdminMatches/>}/>
                                <Route path="matches/:matchId" element={<AdminMatch/>}/>
                                <Route path="playoffs" element={<AdminPlayoffs/>}/>
                                <Route path="results" element={<AdminResults/>}/>
                                <Route path="stats" element={<AdminStats/>}/>
                            </Route>
                        </Routes>
                        <ToastContainer position="bottom-right"/>
                    </Router>
                </SeasonProvider>
            </YearProvider>
        </ThemeProvider>
    )
}

export default App
