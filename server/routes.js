const express=require("express");
const { registerAdmin, loginAdmin, addTeam, addSeason, addMatch, fetchSeason, fetchSeasons, deleteSeason, fetchTeam, fetchMatches, deleteTeam, deleteMatch, addResult, logoutAdmin, checkAuth } = require("./controller");
const router=express.Router();

router.post("/registerAdmin", registerAdmin);
router.post("/loginAdmin", loginAdmin);
router.post("/logoutAdmin", logoutAdmin);
router.get("/checkAuth", checkAuth);
router.post("/addSeason", addSeason);
router.get("/fetchSeasons", fetchSeasons);
router.get("/fetchSeason/:year", fetchSeason);
router.delete("/deleteSeason/:year", deleteSeason);
router.post("/addTeam", addTeam);
router.get("/fetchTeam/:year/:teamId", fetchTeam);
router.delete("/deleteTeam/:year/:teamId", deleteTeam);
router.post("/addMatch", addMatch);
router.get("/fetchMatches/:year/:teamId", fetchMatches);
router.delete("/deleteMatch/:year/:matchId", deleteMatch);
router.put("/addResult/:year/:matchId", addResult);

module.exports=router;