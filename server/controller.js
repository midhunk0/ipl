// @ts-nocheck
const Admin=require("./model");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");

const JWT_SECRET=process.env.JWT;

async function registerAdmin(req, res){
    try{
        const { username, email, password }=req.body;
        if(!username || !email || !password){
            return res.status(400).json({ message: "All properties are required" });
        }
        const adminExists=await Admin.findOne();
        if(adminExists){
            return res.status(409).json({ message: "Admin exists" });
        }
        const hashedPassword=await bcrypt.hash(password, bcrypt.genSaltSync(12));
        const admin=new Admin({ username, email, password: hashedPassword, ipl: [] });
        await admin.save();
        const token=jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: "1d" });
        res.cookie("auth", token, { httpOnly: true, secure: true, sameSite: "None", maxAge: 24*60*60*1000 });
        return res.status(200).json({ message: "Admin registered" });
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
};

async function loginAdmin(req, res){
    try{
        const { credential, password }=req.body;
        if(!credential){
            return res.status(400).json({ message: "Email or username is required" });
        }
        if(!password){
            return res.status(400).json({ message: "Password is required" });
        }
        const admin=await Admin.findOne({ $or: [{ email: credential }, { username: credential }]});
        if(!admin){
            return res.status(400).json({ message: "Invalid credential" });
        }
        const isPasswordCorrect=await bcrypt.compare(password, admin.password);
        if(!isPasswordCorrect){
            return res.status(400).json({ message: "Invalid password" });
        }
        const token=jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: "1d" });
        res.cookie("auth", token, { httpOnly: true, secure: true, sameSite: "None", maxAge: 24*60*60*1000 });
        return res.status(200).json({ message: "Admin logged in" });
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
};

async function logoutAdmin(req ,res){
    res.clearCookie("auth", { httpOnly: true, secure: true, sameSite: "Strict" });
    return res.status(200).json({ message: "Logged out" });
}

function checkAuth(req, res){
    const token=req.cookies.auth;
    if(!token){
        return res.status(401).json({ message: "Unauthorized" });
    }

    try{
        const decoded=jwt.verify(token, JWT_SECRET);
        return res.status(200).json({ admin: { id: decoded.id, username: decoded.username }});
    }
    catch(error){
        return res.status(400).json({ message: "Invalid token" });
    }
}

async function addSeason(req, res){
    try{
        const currentYear=new Date().getFullYear();
        const { year }=req.body;
        if(!year){
            return res.status(400).json({ message: "Year is required" });
        }
        if(year>currentYear || year<2008){
            return res.status(400).json({ message: "Year not applicable" });
        }
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(404).json({ message: "Admin not found" });
        }
        const seasonExists=admin.ipl.some(season=>season.year===Number(year));
        if(seasonExists){
            return res.status(400).json({ message: "Cannot add duplicate seasons" });
        }
        const season={ 
            year, 
            teams: [], 
            stats: {} 
        };
        admin.ipl.push(season);
        await admin.save();
        return res.status(200).json({ message: "New season added" });
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
};

async function fetchSeasons(req, res){
    try{
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(400).json({ message: "Admin not found" });
        }
        const seasons=admin.ipl
            .map(season=>({
                year: season.year,
                champion: season.stats?.champion || "Season ongoing",
                runnerUp: season.stats?.runnerUp || "Season ongoing" 
            }))
            .sort((a, b)=>b.year - a.year);
        return res.status(200).json({ message: "Seasons details fetched", seasons });
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
};

async function fetchSeason(req, res){
    try{
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(404).json({ message: "Admin not found" });
        }
        const { year }=req.params;
        const season=admin.ipl.find(season=>season.year===new Date(year).getFullYear());
        if(!season){
            return res.status(400).json({ message: "Season dont exists" });
        }
        season.teams.sort((a, b)=>{
            if(b.points!==a.points){
                return b.points - a.points; 
            }
            return b.netRunRate - a.netRunRate; 
        });
        season.teams.forEach(team => {
            team.matches.sort((a, b) => new Date(a.date) - new Date(b.date));
        });
        season.matches.sort((a, b)=> new Date(a.date) - new Date(b.date));
        return res.status(200).json({ message: "Season details fetched", season });
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
};

async function deleteSeason(req, res){
    try{
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(404).json({ message: "Admin not found" });
        }
        const { year }=req.params;
        const seasonIndex=admin.ipl.findIndex(season=>season.year===new Date(year).getFullYear());
        if(seasonIndex===-1){
            return res.status(400).json({ message: "Season dont exists" });
        }
        admin.ipl.splice(seasonIndex, 1);
        await admin.save();
        return res.status(200).json({ message: "Season deleted" });
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
};

async function addTeam(req, res){
    try{
        const { name, short, home }=req.body;
        if(!name || !short || !home){
            return res.status(400).json({ message: "Team details are required" });
        }
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(404).json({ message: "Admin not found" });
        }
        const { year }=req.body;
        const season=admin.ipl.find(season=>season.year===Number(year));
        if(!season){
            return res.status(400).json({ message: "Season dont exists" });
        }
        const teamExists=season.teams.some(team=>team.short===short);
        if(teamExists){
            return res.status(400).json({ message: "Cannot add duplicate teams" });
        }
        const homeArray=Array.isArray(home) ? home : [home];
        const team={ 
            name, 
            short, 
            position: 0,
            points: 0,
            home: homeArray,
            matches: [] 
        };
        season.teams.push(team);
        await admin.save();
        return res.status(200).json({ message: `Team added to ${year} season` });
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
};

async function fetchTeam(req, res){
    try{
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(404).json({ message: "Admin not found" });
        }
        const { year, teamId }=req.params;
        const season=admin.ipl.find(season=>season.year===new Date(year).getFullYear());
        if(!season){
            return res.status(400).json({ message: "Season dont exists" });
        }
        const team=season.teams.find(team=>team._id.toString()===teamId);
        if(!team){
            return res.status(400).json({ message: "Team not exists" });
        }
        return res.status(200).json({ message: "Team fetched", team });
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
};

async function deleteTeam(req, res){
    try{
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(404).json({ message: "Admin not found" });
        }
        const { year, teamId }=req.params;
        const season=admin.ipl.find(season=>season.year===new Date(year).getFullYear());
        if(!season){
            return res.status(400).json({ message: "Season dont exists" });
        }
        const teamIndex=season.teams.findIndex(team=>team._id.toString()===teamId);
        if(teamIndex===-1){
            return res.status(400).json({ message: "Team not exists" });
        }
        season.teams.splice(teamIndex, 1);
        await admin.save();
        return res.status(200).json({ message: "Team deleted", season });
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
};

async function addMatch(req, res){
    try{
        const { teamShort, opponentShort, venue, date, time, year }=req.body;
        if(!teamShort || !opponentShort || !venue || !date || !time){
            return res.status(400).json({ message: "Match details are required" });
        }
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(400).json({ message: "Admin not found" });
        }
        const season=admin.ipl.find(season=>season.year===Number(year));
        if(!season){
            return res.status(400).json({ message: "Season dont exists" });
        }
        const team=season.teams.find(team=>team.short===teamShort);
        if(!team){
            return res.status(400).json({ message: "Team not exists" });
        }
        const opponent=season.teams.find(team=>team.short===opponentShort);
        if(!opponent){
            return res.status(400).json({ message: "Opponent team not exists" });
        }
        const matchExists=season.matches.some(match=>new Date(match.date).getDate()===new Date(date).getDate() && match.team?.short===teamShort && match.opponent?.short===opponentShort);
        if(matchExists){
            return res.status(400).json({ message: "Match exists" });
        }
        season.matches.push({
            team: { name: team.name, short: teamShort },
            opponent: { name: opponent.name, short: opponentShort },
            date,
            time, 
            venue
        })
        await admin.save();
        const matchId=season.matches[season.matches.length-1]._id;
        team.matches.push({ matchId: matchId.toString(), date });
        opponent.matches.push({ matchId: matchId.toString(), date });
        await admin.save()
        return res.status(200).json({ message: "Match added" })
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
};

async function fetchMatches(req, res){
    try{
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(400).json({ message: "Admin not found" });
        }
        const { year, teamId }=req.params;
        const season=admin.ipl.find(season=>season.year===new Date(year).getFullYear());
        if(!season){
            return res.status(400).json({ message: "Season dont exists" });
        }
        const team=season.teams.find(team=>team._id.toString()===teamId);
        if(!team){
            return res.status(400).json({ message: "Team not found" });
        }
        const matches=season.matches
            .filter(match=>match.team?.short===team.short || match.opponent?.short===team.short)
            .sort((a, b)=> new Date(a.date).getDate() - new Date(b.date).getDate());
        return res.status(200).json({ message: "Team matches fetched", matches })
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
};

async function deleteMatch(req, res){
    try {
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(400).json({ message: "Admin not found" });
        }
        const { year, matchId }=req.params;
        const season=admin.ipl.find(season=>season.year===new Date(year).getFullYear());
        if(!season){
            return res.status(400).json({ message: "Season doesn't exist" });
        }
        const matchIndex=season.matches.findIndex(match=>match._id.toString()===matchId);
        if(matchIndex===-1){
            return res.status(400).json({ message: "Match not found" });
        }
        const match=season.matches[matchIndex];
        if(!match){
            return res.status(400).json({ message: "Match undefined" });
        }
        if(match.team?.short){
            const team=season.teams.find(team=>team.short===match.team.short);
            if(team){
                team.matches=team.matches.filter(match=>match.matchId!==matchId);
                if(match.result.won.short===team.short){
                    team.points-=2;
                }
                team.totalRunsScored-=match.result.score.team.runs;
                team.totalOversFaced-=match.result.score.team.overs;
                team.totalRunsConceded-=match.result.score.opponent.runs;
                team.totalOversBowled-=match.result.score.opponent.overs;
                if(team.totalOversFaced>0&&team.totalOversBowled>0){
                    team.netRunRate=(team.totalRunsScored/team.totalOversFaced)-(team.totalRunsConceded/team.totalOversBowled);
                    team.netRunRate=team.netRunRate.toFixed(2);
                }
                else{
                    team.netRunRate=0; 
                }
            }
        }
        if(match.opponent?.short){
            const opponent=season.teams.find(opponent=>opponent.short===match.opponent.short);
            if(opponent){
                opponent.matches=opponent.matches.filter(match=>match.matchId!==matchId);
                if(match.result.won.short===opponent.short){
                    opponent.points-=2;
                }
                opponent.totalRunsScored-=match.result.score.opponent.runs;
                opponent.totalOversFaced-=match.result.score.opponent.overs;
                opponent.totalRunsConceded-=match.result.score.team.runs;
                opponent.totalOversBowled-=match.result.score.team.overs;
                if(opponent.totalOversFaced>0&&opponent.totalOversBowled>0){
                    opponent.netRunRate=(opponent.totalRunsScored/opponent.totalOversFaced)-(opponent.totalRunsConceded/opponent.totalOversBowled);
                    opponent.netRunRate=opponent.netRunRate.toFixed(2);
                }
                else{
                    opponent.netRunRate=0; 
                }
            }
        }
        season.matches.splice(matchIndex, 1);
        admin.markModified("ipl");
        await admin.save();
        return res.status(200).json({ message: "Match deleted", season });
    } 
    catch(error){
        return res.status(500).json({ message: error.message });
    }
}

async function addResult(req, res){
    try{
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(400).json({ message: "Admin not found" });
        }
        const { year, matchId }=req.params;
        const season=admin.ipl.find(season=>season.year===new Date(year).getFullYear());
        if(!season){
            return res.status(400).json({ message: "Season dont exists" });
        }
        const match=season.matches.find(match=>match._id.toString()===matchId);
        if(!match){
            return res.status(400).json({ message: "Match not found" });
        }
        const { wonShort, wonBy, playerOfTheMatch, score }=req.body;
        if(!wonShort || !wonBy || !playerOfTheMatch || !score){
            return res.status(400).json({ message: "Result details are required" });
        }
        if(!score.team || !score.opponent){
            return res.status(400).json({ message: "Scores of each team is required" });
        }
        if(!score.team.runs || !score.team.wickets || !score.team.overs || !score.opponent.runs || !score.opponent.wickets || !score.opponent.overs){
            return res.status(400).json({ message: "Score details is required for both teams" });
        }
        if(!playerOfTheMatch.name || !playerOfTheMatch.for){
            return res.status(400).json({ message: "Player of the match details are required" })
        }
        let won="";
        const teamShort=match.team?.short;
        const team=season.teams.find(team=>team.short===teamShort);
        if(!team){
            return res.status(400).json({ message: "Team not found" });
        }
        const teamMatch=team.matches.find(match=>match.matchId===matchId);
        if(teamMatch){
            teamMatch.result=wonShort===teamShort ? 2 : 0;
        }
        team.points+=wonShort===teamShort ? 2 : 0;
        team.totalRunsScored+=Number(score.team.runs);
        team.totalOversFaced+=Number(score.team.overs);
        team.totalRunsConceded+=Number(score.opponent.runs);
        team.totalOversBowled+=Number(score.opponent.overs);
        team.netRunRate=(team.totalRunsScored / team.totalOversFaced) - (team.totalRunsConceded / team.totalOversBowled);
        team.netRunRate=team.netRunRate.toFixed(2);
        const opponentShort=match.opponent?.short;
        const opponent=season.teams.find(team=>team.short===opponentShort);
        if(!opponent){
            return res.status(400).json({ message: "Opponent not found" });
        }
        const opponentMatch=opponent.matches.find(match=>match.matchId===matchId);
        if(opponentMatch){
            opponentMatch.result=wonShort===opponentShort ? 2 : 0;
        }
        opponent.points+=wonShort===opponentShort ? 2 : 0;
        opponent.totalRunsScored+=Number(score.opponent.runs);
        opponent.totalOversFaced+=Number(score.opponent.overs);
        opponent.totalRunsConceded+=Number(score.team.runs);
        opponent.totalOversBowled+=Number(score.team.overs);
        opponent.netRunRate=(opponent.totalRunsScored / opponent.totalOversFaced) - (opponent.totalRunsConceded / opponent.totalOversBowled);
        opponent.netRunRate=opponent.netRunRate.toFixed(2);
        won=wonShort===teamShort ? team.name : opponent.name; 
        match.result={
            won: {
                name: won,
                short: wonShort
            },
            wonBy,
            playerOfTheMatch: {
                name: playerOfTheMatch.name,
                for: playerOfTheMatch.for
            },
            score: {
                team: {
                    runs: score.team.runs,
                    wickets: score.team.wickets,
                    overs: score.team.overs
                },
                opponent: {
                    runs: score.opponent.runs,
                    wickets: score.opponent.wickets,
                    overs: score.opponent.overs
                }
            }
        };
        await admin.save();
        return res.status(200).json({ message: "Result added" });
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
}

module.exports={
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    checkAuth,
    addSeason,
    fetchSeasons,
    fetchSeason,
    deleteSeason,
    addTeam,
    fetchTeam,
    deleteTeam,
    addMatch,
    fetchMatches,
    deleteMatch,
    addResult
}