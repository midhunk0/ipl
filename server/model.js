const mongoose=require("mongoose");

const matchSchema=new mongoose.Schema({
    team: { 
        name: { type: String, default: "" }, 
        short: { type: String, default: "" }
    },
    opponent: { 
        name: { type: String, default: "" }, 
        short: { type: String, default: "" }
    },
    venue: { type: String, default: "" },
    date: { type: Date, default: "" },
    time: { type: String, default: "" },
    result: {
        score: {
            team: { 
                runs: { type: Number, default: 0 }, 
                wickets: { type: Number, default: 0 }, 
                overs: { type: Number, default: 0 }
            },
            opponent: { 
                runs: { type: Number, default: 0 }, 
                wickets: { type: Number, default: 0 }, 
                overs: { type: Number, default: 0 }
            }
        },
        won: { 
            name: { type: String, default: "" }, 
            short: { type: String, default: "" }
        },
        wonBy: { type: String, default: "" },
        playerOfTheMatch: { 
            name: { type: String, default: "" },
            for: { type: String, default: "" }
        },
        draw: { 
            status: { type: Boolean, default: false },
            reason: { type: String, default: "" }
        }
    },
    number: { type: Number, default: 0 },
    type: { 
        type: String, 
        enum: ["league", "qualifier1", "eliminator", "qualifier2", "final"], 
        default: "league"
    }      
});

const playoffsSchema=new mongoose.Schema({
    qualifier1: {
        type: matchSchema,
        default: {}
    },
    eliminator: {
        type: matchSchema,
        default: {}
    },
    qualifier2: {
        type: matchSchema,
        default: {}
    },
    final: {
        type: matchSchema,
        default: {}
    },
    fourth: {
        name: { type: String, default: "" }, 
        short: { type: String, default: "" }
    },
    third: {
        name: { type: String, default: "" }, 
        short: { type: String, default: "" }
    },
    second: {
        name: { type: String, default: "" }, 
        short: { type: String, default: "" }
    },
    first: {
        name: { type: String, default: "" }, 
        short: { type: String, default: "" }
    }
})

const teamSchema=new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    short: { type: String, required: true, unique: true },
    position: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    home: { type: [String], required: true },
    matches: [{
        matchId: { type: String, required: true },
        point: { type: Number, default: null },
        date: { type: Date, default: null },
        _id: false
    }],
    totalRunsScored: { type: Number, default: 0 },
    totalBallsFaced: { type: Number, default: 0 },
    totalOversFaced: { type: Number, default: 0 },
    totalRunsConceded: { type: Number, default: 0 },
    totalBallsBowled: { type: Number, default: 0 },
    totalOversBowled: { type: Number, default: 0 },
    netRunRate: { type: Number, default: 0 } 
});

const statsSchema=new mongoose.Schema({
    champion: { type: String, default: "" },
    runnerUp: { type: String, default: "" },
    fairPlayAward: { type: String, default: "" },
    orangeCap: {
        name: { type: String, default: "" },
        runs: { type: Number, default: 0 },
        team: { type: String, default: "" }
    },
    purpleCap: {
        name: { type: String,  default: "" },
        wickets: { type: Number, default: 0 },
        team: { type: String,  default: "" }
    },
    most6s: {
        name: { type: String, default: "" },
        number: { type: Number, default: 0 },
        team: { type: String, default: "" }
    },
    most4s: {
        name: { type: String, default: "" },
        number: { type: Number, default: 0 },
        team: { type: String, default: "" }
    },
    highestScore: {
        name: { type: String, default: "" },
        runs: { type: Number, default: 0 },
        team: { type: String, default: "" }
    },
    mostValuablePlayer: {
        name: { type: String, default: "" },
        team: { type: String, default: "" }
    },
    emergingPlayer: {
        name: { type: String, default: "" },
        team: { type: String, default: "" }
    },
}, { _id: false });

const iplSchema=new mongoose.Schema({
    year: { type: Number, required: true, unique: true },
    teams: [teamSchema],
    stats: { type: statsSchema, default: {} },
    matches: [matchSchema],
    playoffs: { type: playoffsSchema, default: {} }
});

const adminSchema=new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    ipl: [iplSchema]
});

const Admin=mongoose.model("Admin", adminSchema);
module.exports=Admin;