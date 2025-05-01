// @ts-nocheck
const Admin=require("./model");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const xlsx=require("xlsx");

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
        
        return res.status(201).json({ message: "Admin registered" });
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
    res.clearCookie("auth", { httpOnly: true, secure: true, sameSite: "None" });
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
        return res.status(403).json({ message: "Invalid token" });
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
            // teams: [], 
            // stats: {} 
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
            return res.status(404).json({ message: "Admin not found" });
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
        const season=admin.ipl.find(season=>season.year===Number(year));
        if(!season){
            return res.status(400).json({ message: "Season does not exists" });
        }

        season.teams.sort((a, b)=>{
            if(b.points!==a.points){
                return b.points - a.points; 
            }
            return b.netRunRate - a.netRunRate; 
        });

        season.teams.forEach(team=>{
            team.matches.sort((a, b)=> new Date(a.date) - new Date(b.date));
        });

        season.matches.sort((a, b)=>{
            const dateTimeA=new Date(a.date);
            const [hoursA, minutesA]=a.time.split(":").map(Number);
            dateTimeA.setHours(hoursA, minutesA);
        
            const dateTimeB=new Date(b.date);
            const [hoursB, minutesB]=b.time.split(":").map(Number);
            dateTimeB.setHours(hoursB, minutesB);
        
            return dateTimeA - dateTimeB;
        });
        
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
        const seasonIndex=admin.ipl.findIndex(season=>season.year===Number(year));
        if(seasonIndex===-1){
            return res.status(400).json({ message: "Season does not exists" });
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
        const { name, short, home, year }=req.body;
        if(!name || !short || !home){
            return res.status(400).json({ message: "Team details are required" });
        }

        const admin=await Admin.findOne();
        if(!admin){
            return res.status(404).json({ message: "Admin not found" });
        }

        const season=admin.ipl.find(season=>season.year===Number(year));
        if(!season){
            return res.status(400).json({ message: "Season does not exists" });
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
        const season=admin.ipl.find(season=>season.year===Number(year));
        if(!season){
            return res.status(400).json({ message: "Season does not exists" });
        }

        const team=season.teams.find(team=>team._id.toString()===teamId);
        if(!team){
            return res.status(400).json({ message: "Team does not exists" });
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
            return res.status(400).json({ message: "Season does not exists" });
        }
        
        const teamIndex=season.teams.findIndex(team=>team._id.toString()===teamId);
        if(teamIndex===-1){
            return res.status(400).json({ message: "Team does not exists" });
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
        const { teamShort, opponentShort, venue, date, time, year, number }=req.body;
        if(!teamShort || !opponentShort || !venue || !date || !time || !number){
            return res.status(400).json({ message: "Match details are required" });
        }
        
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(400).json({ message: "Admin not found" });
        }

        const season=admin.ipl.find(season=>season.year===Number(year));
        if(!season){
            return res.status(400).json({ message: "Season does not exists" });
        }
        
        const team=season.teams.find(team=>team.short===teamShort);
        if(!team){
            return res.status(400).json({ message: "Team does not exists" });
        }
        
        const opponent=season.teams.find(team=>team.short===opponentShort);
        if(!opponent){
            return res.status(400).json({ message: "Opponent team does not exists" });
        }
        
        const matchExists=season.matches.some(match=>
            new Date(match.date).toISOString().split("T")[0]===new Date(date).toISOString().split("T")[0] && 
            match.team?.short===teamShort && 
            match.opponent?.short===opponentShort
        );
        if(matchExists){
            return res.status(400).json({ message: "Match already exists" });
        }
        
        season.matches.push({
            team: { name: team.name, short: teamShort },
            opponent: { name: opponent.name, short: opponentShort },
            date,
            time, 
            venue,
            number
        })
        await admin.save();
        
        const matchId=season.matches[season.matches.length-1]._id.toString();
        team.matches.push({ matchId, date });
        opponent.matches.push({ matchId, date });
        await admin.save()
        
        return res.status(200).json({ message: "Match added" })
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
};

async function addMatches(req, res){
    try{
        if(!req.file){
            return res.status(400).json({ message: "File is required" });
        }
    
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(400).json({ message: "Admin not found" });
        }
    
        const { year }=req.params;
        const season=admin.ipl.find(season=>season.year===Number(year));
        if(!season){
            return res.status(400).json({ message: "Season does not exist" });
        }
    
        const workBook=xlsx.read(req.file.buffer);
        const workSheet=workBook.Sheets[workBook.SheetNames[0]];
        const jsonData=xlsx.utils.sheet_to_json(workSheet);
    
        for(const match of jsonData){
            const { teamShort, opponentShort, venue, number }=match;
            const rawDate=match.date;
            const rawTime=match.time;
            
            const date=(typeof rawDate==="number") 
                ? new Date((rawDate - 25569)*86400*1000) 
                : new Date(rawDate);
            
            const time=(typeof rawTime==="number") 
                ? new Date((rawTime*86400*1000)).toISOString().split("T")[1].slice(0, 5)
                : rawTime || "19:30";         
    
            if(!teamShort || !opponentShort || !venue || !date || !time || !number){
                continue; 
            }
    
            const team=season.teams.find(t=>t.short===teamShort);
            const opponent=season.teams.find(t=>t.short===opponentShort);
            if(!team || !opponent) continue;
    
            const matchExists=season.matches.some(m=>
                new Date(m.date).toISOString().split("T")[0]===date.toISOString().split("T")[0] &&
                m.team?.short===teamShort &&
                m.opponent?.short===opponentShort
            );
            if(matchExists) continue;
    
            season.matches.push({
                team: { name: team.name, short: teamShort },
                opponent: { name: opponent.name, short: opponentShort },
                date,
                time,
                venue,
                number
            });
    
            const newMatch=season.matches[season.matches.length-1];
            const matchId=newMatch._id.toString();
    
            team.matches.push({ matchId, date });
            opponent.matches.push({ matchId, date });
        }
    
        await admin.save();
        return res.status(200).json({ message: "Matches added successfully" });
    } 
    catch(error){
        console.error("Add Matches Error:", error);
        return res.status(500).json({ message: error.message });
    }
}

async function fetchMatches(req, res){
    try{
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(400).json({ message: "Admin not found" });
        }

        const { year, teamId }=req.params;
        const season=admin.ipl.find(season=>season.year===Number(year));
        if(!season){
            return res.status(400).json({ message: "Season does not exists" });
        }
        
        const team=season.teams.find(team=>team._id.toString()===teamId);
        if(!team){
            return res.status(400).json({ message: "Team does not found" });
        }
        
        const matches=season.matches
            .filter(match=>match.team?.short===team.short || match.opponent?.short===team.short)
            .sort((a, b)=> new Date(a.date) - new Date(b.date));
        
        return res.status(200).json({ message: "Team matches fetched", matches })
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
};

async function editMatch(req, res){
    try{
        const { teamShort, opponentShort, venue, date, time }=req.body;
        const { year, matchId }=req.params;
        if(!teamShort || !opponentShort || !venue || !date || !time){
            return res.status(400).json({ message: "Match details are required" });
        }
        
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(400).json({ message: "Admin not found" });
        }
        
        const season=admin.ipl.find(season=>season.year===Number(year));
        if(!season){
            return res.status(400).json({ message: "Season does not exists" });
        }
        
        const team=season.teams.find(team=>team.short===teamShort);
        if(!team){
            return res.status(400).json({ message: "Team does not exists" });
        }
        
        const opponent=season.teams.find(team=>team.short===opponentShort);
        if(!opponent){
            return res.status(400).json({ message: "Opponent team does not exists" });
        }
        
        const match=season.matches.find(match=>match._id.toString()===matchId);
        if(!match){
            return res.status(400).json({ message: "Match not found" });
        }
        
        match.set({
            team: {
                name: team.name,
                short: teamShort
            },
            opponent: {
                name: opponent.name,
                short: opponentShort
            },
            date,
            time, 
            venue
        });
        await admin.save();
        
        return res.status(200).json({ message: "Match updated" })
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
}

async function deleteMatch(req, res){
    try {
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(400).json({ message: "Admin not found" });
        }
        
        const { year, matchId }=req.params;
        const season=admin.ipl.find(season=>season.year===Number(year));
        if(!season){
            return res.status(400).json({ message: "Season does not exist" });
        }
        
        const matchIndex=season.matches.findIndex(match=>match._id.toString()===matchId);
        if(matchIndex===-1){
            return res.status(400).json({ message: "Match not found" });
        }
        
        const match=season.matches[matchIndex];
        if(!match){
            return res.status(400).json({ message: "Match undefined" });
        }

        const oversToBalls=(overs)=>{
            const fullOvers=Math.floor(overs);
            const balls=Math.round((overs-fullOvers)*10);
            return fullOvers*6+balls;
        };

        const ballstoOvers=(balls)=>{
            const fullOvers=Math.floor(balls/6);
            const remainingBalls=balls%6;
            return parseFloat(`${fullOvers}.${remainingBalls}`);
        }

        const convertOvers=(overs)=>{
            const [fullOvers, balls]=String(overs).split('.').map(Number);
            return fullOvers+Math.fround(balls ? balls/6 : 0);
        };
        
        if(match.team?.short){
            const team=season.teams.find(team=>team.short===match.team.short);
            if(team){
                team.matches=team.matches.filter(match=>match.matchId!==matchId);
                
                if(match.result.won.short===team.short){
                    team.points-=2;
                }
                if(match.result.draw.status){
                    team.points-=1;
                }

                team.totalRunsScored-=match.result.score.team.runs;
                const teamBallsBowled=Number(match.result.score.team.wickets)===10 ? Number(120) : oversToBalls(Number(match.result.score.opponent.overs));
                team.totalBallsBowled-=teamBallsBowled;
                team.totalOversBowled=ballstoOvers(team.totalBallsBowled);
                const teamBallsFaced=Number(match.result.score.team.wickets)===10 ? Number(120) : oversToBalls(Number(match.result.score.team.overs));
                team.totalBallsFaced-=teamBallsFaced;
                team.totalOversFaced=ballstoOvers(team.totalBallsFaced);
                team.totalRunsConceded-=match.result.score.opponent.runs;
                if(team.totalOversFaced>0 && team.totalOversBowled>0){
                    team.netRunRate=(
                        team.totalRunsScored/convertOvers(team.totalOversFaced) - 
                        team.totalRunsConceded/convertOvers(team.totalOversBowled)
                    ).toFixed(3);
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
                if(match.result.draw.status){
                    opponent.points-=1;
                }
                
                opponent.totalRunsScored-=match.result.score.opponent.runs;
                const opponentBallsBowled=Number(match.result.score.team.wickets)===10 ? Number(120) : oversToBalls(Number(match.result.score.team.overs));
                opponent.totalBallsBowled-=opponentBallsBowled;
                opponent.totalOversBowled=convertOvers(opponent.totalBallsBowled);
                const opponentBallsFaced=Number(match.result.score.opponent.wickets)===10 ? Number(120) : oversToBalls(Number(match.result.score.opponent.overs));
                opponent.totalBallsFaced-=opponentBallsFaced;
                opponent.totalOversFaced=convertOvers(opponent.totalBallsFaced);
                opponent.totalRunsConceded-=match.result.score.team.runs;
                if(opponent.totalOversFaced>0 && opponent.totalOversBowled>0){
                    opponent.netRunRate=(
                        opponent.totalRunsScored/convertOvers(opponent.totalOversFaced) - 
                        opponent.totalRunsConceded/convertOvers(opponent.totalOversBowled)
                    ).toFixed(3);
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
            return res.status(400).json({ message: "Season does not exists" });
        }
        
        const match=season.matches.find(match=>match._id.toString()===matchId);
        if(!match){
            return res.status(400).json({ message: "Match not found" });
        }
        
        const { wonShort, wonBy, playerOfTheMatch, score, reason }=req.body;

        const teamShort=match.team?.short;
        const team=season.teams.find(team=>team.short===teamShort);
        if(!team){
            return res.status(400).json({ message: "Team not found" });
        }
        const teamMatch=team.matches.find(match=>match.matchId===matchId);
        
        const opponentShort=match.opponent?.short;
        const opponent=season.teams.find(team=>team.short===opponentShort);
        if(!opponent){
            return res.status(400).json({ message: "Opponent not found" });
        }
        const opponentMatch=opponent.matches.find(match=>match.matchId===matchId);
        
        if(reason!==""){
            if(teamMatch){
                teamMatch.point=1;
            }
            team.points+=1;
            if(opponentMatch){
                opponentMatch.point=1;
            }
            opponent.points+=1;
            
            match.result={
                draw: {
                    status: true, 
                    reason: reason
                }
            }

            await admin.save();
            return res.status(200).json({ message: "Result added" });
        }

        if(!wonShort || !wonBy || !playerOfTheMatch || !score){
            return res.status(400).json({ message: "Result details are required" });
        }
        if(!score.team || !score.opponent){
            return res.status(400).json({ message: "Scores for both team are required" });
        }
        if(score.team.runs===undefined || score.team.wickets===undefined || score.team.overs===undefined || score.opponent.runs===undefined || score.opponent.wickets===undefined || score.opponent.overs===undefined){
            return res.status(400).json({ message: "Complete score details are required"});
        }
        if(!playerOfTheMatch.name || !playerOfTheMatch.for){
            return res.status(400).json({ message: "Player of the match details are required" })
        }

        const oversToBalls=(overs)=>{
            const oversStr=overs.toString();
            const [fullOvers, balls]=oversStr.split(".").map(Number);
            return (fullOvers*6)+(balls||0);
        };

        const ballstoOvers=(balls)=>{
            const fullOvers=Math.floor(balls/6);
            const remainingBalls=balls%6;
            return parseFloat(`${fullOvers}.${remainingBalls}`);
        }

        const convertOvers=(overs)=>{
            const [fullOvers, balls]=String(overs).split('.').map(Number);
            return fullOvers+Math.fround(balls ? balls/6 : 0);
        };
        
        if(teamMatch){
            teamMatch.point=wonShort===teamShort ? 2 : 0;
        }
        team.points+=wonShort===teamShort ? 2 : 0;
        team.totalRunsScored+=Number(score.team.runs);
        const teamBallsFaced=Number(score.team.wickets)===10 ? 120 : oversToBalls(Number(score.team.overs));
        team.totalBallsFaced=(team.totalBallsFaced||0)+teamBallsFaced;
        team.totalOversFaced=ballstoOvers(team.totalBallsFaced);
        team.totalRunsConceded+=Number(score.opponent.runs);
        const teamBallsBowled=Number(score.opponent.wickets)===10 ? 120 : oversToBalls(Number(score.opponent.overs));
        team.totalBallsBowled=(team.totalBallsBowled||0)+teamBallsBowled;
        team.totalOversBowled=ballstoOvers(team.totalBallsBowled);
        team.netRunRate=(team.totalRunsScored / convertOvers(team.totalOversFaced)) - (team.totalRunsConceded / convertOvers(team.totalOversBowled));
        team.netRunRate=team.netRunRate.toFixed(3);
        
        if(opponentMatch){
            opponentMatch.point=wonShort===opponentShort ? 2 : 0;
        }
        opponent.points+=wonShort===opponentShort ? 2 : 0;
        opponent.totalRunsScored+=Number(score.opponent.runs);
        const opponentBallsFaced=Number(score.opponent.wickets)===10 ? 120 : oversToBalls(Number(score.opponent.overs));
        opponent.totalBallsFaced=(opponent.totalBallsFaced||0)+opponentBallsFaced;
        opponent.totalOversFaced=ballstoOvers(opponent.totalBallsFaced);
        opponent.totalRunsConceded+=Number(score.team.runs);
        const opponentBallsBowled=Number(score.team.wickets)===10 ? 120 : oversToBalls(Number(score.team.overs));
        opponent.totalBallsBowled=(opponent.totalBallsBowled||0)+opponentBallsBowled;
        opponent.totalOversBowled=ballstoOvers(opponent.totalBallsBowled);
        opponent.netRunRate=(opponent.totalRunsScored / convertOvers(opponent.totalOversFaced)) - (opponent.totalRunsConceded / convertOvers(opponent.totalOversBowled));
        opponent.netRunRate=opponent.netRunRate.toFixed(3);
        
        match.result={
            won: {
                name: wonShort===teamShort ? team.name : opponent.name,
                short: wonShort
            },
            wonBy,
            playerOfTheMatch,
            score
        };

        await admin.save();
        return res.status(200).json({ message: "Result added" });
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
}

async function addStats(req, res){
    try{
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(400).json({ message: "Admin not found" });
        }
        const { year }=req.params;
        const season=admin.ipl.find(season=>season.year===Number(year));
        if(!season){
            return res.status(400).json({ message: "Season does not exists" });
        }
        const { champion, runnerUp, fairPlayAward, orangeCap, purpleCap, most6s, most4s, highestScore, mostValuablePlayer, emergingPlayer }=req.body;
        if(champion==="" || runnerUp==="" || fairPlayAward==="" || orangeCap==="" || purpleCap==="" || most6s==="" || most4s==="" || highestScore==="" || mostValuablePlayer==="" || emergingPlayer===""){
            return res.status(400).json({ message: "Stats details are required"});
        }
        if(orangeCap.name==="" || orangeCap.runs==="" || orangeCap.team===""){
            return res.status(400).json({ message: "Orange cap details are required" });
        }
        if(purpleCap.name==="" || purpleCap.wickets==="" || purpleCap.team===""){
            return res.status(400).json({ message: "Purple cap details are required" });
        }
        if(most6s.name==="" || most6s.number==="" || most6s.team===""){
            return res.status(400).json({ message: "Most 6s details are required" });
        }
        if(most4s.name==="" || most4s.number==="" || most4s.team===""){
            return res.status(400).json({ message: "Most 4s details are required" });
        }
        if(highestScore.name==="" || highestScore.runs==="" || highestScore.team===""){
            return res.status(400).json({ message: "Highest score details are required" });
        }
        if(mostValuablePlayer.name==="" || mostValuablePlayer.team===""){
            return res.status(400).json({ message: "MVP details are required" });
        }
        if(emergingPlayer.name==="" || emergingPlayer.team===""){
            return res.status(400).json({ message: "Emerging player details are required" });
        }
        season.stats={
            champion, 
            runnerUp,
            fairPlayAward,
            orangeCap:{
                name: orangeCap.name,
                runs: orangeCap.runs, 
                team: orangeCap.team
            },
            purpleCap:{
                name: purpleCap.name,
                wickets: purpleCap.wickets, 
                team: purpleCap.team
            },
            most6s:{
                name: most6s.name,
                number: most6s.number, 
                team: most6s.team
            },
            most4s:{
                name: most4s.name,
                number: most4s.number, 
                team: most4s.team
            },
            highestScore:{
                name: highestScore.name,
                runs: highestScore.runs,
                team: highestScore.team
            },
            mostValuablePlayer:{
                name: mostValuablePlayer.name,
                team: mostValuablePlayer.team
            },
            emergingPlayer:{
                name: emergingPlayer.name,
                team: emergingPlayer.team
            }
        };
        await admin.save();
        return res.status(200).json({ message: "Stats added" });
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
}

async function setPlayoffSchedule(req, res){
    try{
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(400).json({ message: "Admin not found" });
        }
        const { year }=req.params;
        const season=admin.ipl.find(season=>season.year===new Date(year).getFullYear());
        if(!season){
            return res.status(400).json({ message: "Season not found" });
        }
        const totalLeagueMatches=season.matches.length;
        const { qualifier1, eliminator, qualifier2, final }=req.body;
        if(!qualifier1 || !eliminator || !qualifier2 || !final){
            return res.status(400).json({ message: "Playoffs details are required" });
        }
        if(!qualifier1.date || !qualifier1.time || !qualifier1.venue){
            return res.status(400).json({ message: "Date, time and venue for qualifier 1 are required" });
        }
        if(!eliminator.date || !eliminator.time || !eliminator.venue){
            return res.status(400).json({ message: "Date, time and venue for eliminator are required" });
        }
        if(!qualifier2.date || !qualifier2.time || !qualifier2.venue){
            return res.status(400).json({ message: "Date, time and venue for qualifier 2 are required" });
        }
        if(!final.date || !final.time || !final.venue){
            return res.status(400).json({ message: "Date, time and venue for final are required" });
        }

        season.playoffs.qualifier1={ date: qualifier1.date, time: qualifier1.time, venue: qualifier1.venue, number: totalLeagueMatches+1, type: "qualifier1" };
        season.playoffs.eliminator={ date: eliminator.date, time: eliminator.time, venue: eliminator.venue, number: totalLeagueMatches+2, type: "eliminator" };
        season.playoffs.qualifier2={ date: qualifier2.date, time: qualifier2.time, venue: qualifier2.venue, number: totalLeagueMatches+3, type: "qualifier2" };
        season.playoffs.final={ date: final.date, time: final.time, venue: final.venue, number: totalLeagueMatches+4, type: "final" };

        await admin.save();
        return res.status(200).json({ message: "Playoffs scheduled" });
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
}

async function addQ1andEliminator(req, res){
    try{
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(400).json({ message: "Admin not found" });
        }
        const { year }=req.params;
        const season=admin.ipl.find(season=>season.year===new Date(year).getFullYear());
        if(!season){
            return res.status(400).json({ message: "Season not found" });
        }
        const totalLeagueMatches=season.matches.length;
        const totalLeagueMatchesPlayed=season.matches.filter(match=>match.result.won.short || match.result.draw.status).length;
        if(totalLeagueMatchesPlayed<totalLeagueMatches){
            return res.status(400).json({ message: "League not completed" });
        }
        const sortedTeams=[...season.teams].sort((a, b)=>{
            if(b.points===a.points){
                return b.netRunRate - a.netRunRate;
            }
            return b.points - a.points;
        });
        const [first, second, third, fourth]=sortedTeams;

        season.playoffs.qualifier1.team={ name: first.name, short: first.short };
        season.playoffs.qualifier1.opponent={ name: second.name, short: second.short };
        season.playoffs.eliminator.team={ name: third.name, short: third.short };
        season.playoffs.eliminator.opponent={ name: fourth.name, short: fourth.short };

        await admin.save();
        return res.status(200).json({ message: "Qualifier1 and eliminator are set" });
    }   
    catch(error){
        return res.status(500).json({ message: error.message });
    }
}

async function addQ1Result(req, res){
    try{
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(400).json({ message: "Admin not found" });
        }
        const { year }=req.params;
        const season=admin.ipl.find(season=>season.year===new Date(year).getFullYear());
        if(!season){
            return res.status(400).json({ message: "Season not found" });
        }

        const { wonShort, wonBy, playerOfTheMatch, score, reason }=req.body;

        if(!wonShort || !wonBy || !playerOfTheMatch || !score){
            return res.status(400).json({ message: "Result details are required" });
        }
        if(!score.team || !score.opponent){
            return res.status(400).json({ message: "Scores for both team are required" });
        }
        if(score.team.runs===undefined || score.team.wickets===undefined || score.team.overs===undefined || score.opponent.runs===undefined || score.opponent.wickets===undefined || score.opponent.overs===undefined){
            return res.status(400).json({ message: "Complete score details are required"});
        }
        if(!playerOfTheMatch.name || !playerOfTheMatch.for){
            return res.status(400).json({ message: "Player of the match details are required" })
        }
        const q1=season.playoffs.qualifier1;
        q1.result={
            won: {
                name: wonShort===q1.team.short ? q1.team.name : q1.opponent.name,
                short: wonShort
            },
            wonBy,
            playerOfTheMatch,
            score
        };
        let winner, loser;
        if(q1.team.short===wonShort){
            winner=q1.team;
            loser=q1.opponent;
        }
        else{
            winner=q1.opponent;
            loser=q1.team;
        }
        season.playoffs.final.team={ name: winner.name, short: winner.short };
        season.playoffs.qualifier2.team={ name: loser.name, short: loser.short };

        await admin.save();
        return res.status(200).json({ message: "Qualifier 1 result added and final and qualifier 2 updated" });
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
}

async function addEliminatorResult(req, res){
    try{
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(400).json({ message: "Admin not found" });
        }
        const { year }=req.params;
        const season=admin.ipl.find(season=>season.year===new Date(year).getFullYear());
        if(!season){
            return res.status(400).json({ message: "Season not found" });
        }

        const { wonShort, wonBy, playerOfTheMatch, score, reason }=req.body;

        if(!wonShort || !wonBy || !playerOfTheMatch || !score){
            return res.status(400).json({ message: "Result details are required" });
        }
        if(!score.team || !score.opponent){
            return res.status(400).json({ message: "Scores for both team are required" });
        }
        if(score.team.runs===undefined || score.team.wickets===undefined || score.team.overs===undefined || score.opponent.runs===undefined || score.opponent.wickets===undefined || score.opponent.overs===undefined){
            return res.status(400).json({ message: "Complete score details are required"});
        }
        if(!playerOfTheMatch.name || !playerOfTheMatch.for){
            return res.status(400).json({ message: "Player of the match details are required" })
        }
        const eliminator=season.playoffs.eliminator;
        eliminator.result={
            won: {
                name: wonShort===eliminator.team.short ? eliminator.team.name : eliminator.opponent.name,
                short: wonShort
            },
            wonBy,
            playerOfTheMatch,
            score
        };        
        let winner, loser;
        if(eliminator.team.short===wonShort){
            winner=eliminator.team;
            loser=eliminator.opponent;
        }
        else{
            winner=eliminator.opponent;
            loser=eliminator.team;
        }
        season.playoffs.qualifier2.opponent={ name: winner.name, short: winner.short };
        season.playoffs.fourth=loser;

        await admin.save();
        return res.status(200).json({ message: "Eliminator result added and fourth place and qualifier 2 updated" });
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
}

async function addQ2Result(req, res){
    try{
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(400).json({ message: "Admin not found" });
        }
        const { year }=req.params;
        const season=admin.ipl.find(season=>season.year===new Date(year).getFullYear());
        if(!season){
            return res.status(400).json({ message: "Season not found" });
        }

        const { wonShort, wonBy, playerOfTheMatch, score, reason }=req.body;

        if(!wonShort || !wonBy || !playerOfTheMatch || !score){
            return res.status(400).json({ message: "Result details are required" });
        }
        if(!score.team || !score.opponent){
            return res.status(400).json({ message: "Scores for both team are required" });
        }
        if(score.team.runs===undefined || score.team.wickets===undefined || score.team.overs===undefined || score.opponent.runs===undefined || score.opponent.wickets===undefined || score.opponent.overs===undefined){
            return res.status(400).json({ message: "Complete score details are required"});
        }
        if(!playerOfTheMatch.name || !playerOfTheMatch.for){
            return res.status(400).json({ message: "Player of the match details are required" })
        }
        const q2=season.playoffs.qualifier2;
        q2.result={
            won: {
                name: wonShort===q2.team.short ? q2.team.name : q2.opponent.name,
                short: wonShort
            },
            wonBy,
            playerOfTheMatch,
            score
        };        
        let winner, loser;
        if(q2.team.short===wonShort){
            winner=q2.team;
            loser=q2.opponent;
        }
        else{
            winner=q2.opponent;
            loser=q2.team;
        }
        season.playoffs.final.opponent={ name: winner.name, short: winner.short };
        season.playoffs.third=loser;
        await admin.save();
        return res.status(200).json({ message: "Qualifier 2 result added and final and third place updated" });
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
}

async function addFinalResult(req, res){
    try{
        const admin=await Admin.findOne();
        if(!admin){
            return res.status(400).json({ message: "Admin not found" });
        }
        const { year }=req.params;
        const season=admin.ipl.find(season=>season.year===new Date(year).getFullYear());
        if(!season){
            return res.status(400).json({ message: "Season not found" });
        }

        const { wonShort, wonBy, playerOfTheMatch, score, reason }=req.body;

        if(!wonShort || !wonBy || !playerOfTheMatch || !score){
            return res.status(400).json({ message: "Result details are required" });
        }
        if(!score.team || !score.opponent){
            return res.status(400).json({ message: "Scores for both team are required" });
        }
        if(score.team.runs===undefined || score.team.wickets===undefined || score.team.overs===undefined || score.opponent.runs===undefined || score.opponent.wickets===undefined || score.opponent.overs===undefined){
            return res.status(400).json({ message: "Complete score details are required"});
        }
        if(!playerOfTheMatch.name || !playerOfTheMatch.for){
            return res.status(400).json({ message: "Player of the match details are required" })
        }
        const final=season.playoffs.final;
        final.result={
            won: {
                name: wonShort===final.team.short ? final.team.name : final.opponent.name,
                short: wonShort
            },
            wonBy,
            playerOfTheMatch,
            score
        };
        let winner, loser;
        if(final.team.short===wonShort){
            winner=final.team;
            loser=final.opponent;
        }
        else{
            winner=final.opponent;
            loser=final.team;
        }
        season.playoffs.first=winner;
        season.playoffs.second=loser;

        await admin.save();
        return res.status(200).json({ message: "Final result added and first and second position updated" });
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
    addMatches,
    editMatch,
    fetchMatches,
    deleteMatch,
    addResult,
    addStats,
    setPlayoffSchedule,
    addQ1andEliminator,
    addQ1Result,
    addEliminatorResult,
    addQ2Result,
    addFinalResult,
}