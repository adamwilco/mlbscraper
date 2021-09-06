import fetch from 'node-fetch';
import fs from 'fs';
import csv from 'fast-csv';

const scheduleurl = (startDate, endDate) => "https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate="+startDate+"&endDate="+endDate;
const gameurl = (gamepk) => "https://statsapi.mlb.com/api/v1.1/game/"+gamepk+"/feed/live";
const formatDate = (date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

//set up the csv stream for writing data to file//
const ws = fs.createWriteStream('./data_all.csv');
const stream = csv.format();
stream.pipe(ws);

//make a header row for csv//
stream.write([ 'date', 'year', 'gamepk', 'type', 'game_type', 'temp', 'condition', 'wind', 'venue', 'home_team', 'away_team', 'batter', 'batter_name', 'stand', 'pitcher', 'pitcher_name', 'throws',
               'events', 'description', 'inning', 'topbot', 'abnum', 'pitchnum', 'pitch_balls', 'pitch_strikes', 'pitch_outs', 'pitch_call', 'pitch_type', 'pitch_startSpeed', 'pitch_endSpeed',
               'pitch_sz_top', 'pitch_sz_bot', 'pitch_x0', 'pitch_y0', 'pitch_z0', 'pitch_extension', 'pitch_vx0', 'pitch_vy0', 'pitch_vz0', 'pitch_ax', 'pitch_ay', 'pitch_az', 'pitch_pfx_x',
               'pitch_pfx_z', 'pitch_px', 'pitch_pz', 'pitch_x', 'pitch_y', 'pitch_breakAngle', 'pitch_breakLength', 'pitch_break_y', 'pitch_spinrate', 'pitch_breakDirection',
               'pitch_zone', 'pitch_plateTime', 'bip_EV', 'bip_VA', 'bip_distance', 'bip_type', 'bip_hardness', 'bip_location', 'bip_hc_x', 'bip_hc_y', 'MLB_playID', 'id' ]);

//these lines determine which dates to scrape//
const today = new Date();
const yesterday = new Date(today.setDate(today.getDate() - 1));
const date = formatDate(yesterday);
const url = scheduleurl (date, date)

//fetch the gamepk data from the given dates//
  fetch(url)
    .then(res => res.json())
    .then(json => setGamepks(json) )
    .catch(err => console.error(err));

//loop through each date to extract the game data//
function setGamepks(data) {
  const gpks = [];
  for (let d = 0; d < data.dates.length; d++) {
    const total = data.dates[d].games.length;
    const games = data.dates[d].games;
    for(let g = 0; g < total; g++) {
      gpks.push(games[g].gamePk);
    }
  }
  
  //removes duplicate gamepks//
  const gamepks = gpks.unique();
  
  next(gamepks);
}

//go through each gamepk, fetch data from the internet, send to the scrape function//
function next(gamepks) {
  for (let game = 0; game < gamepks.length; game++) {

    const gamepk = gamepks[game];
    const url = gameurl(gamepk);
    
    fetch(url)
      .then(res => res.json())
      .then(json => scrape(json) )
      .catch(err => console.error(err));
  }
}

function scrape(data) {
  //temporarily save chunks of data as "output" that will be written to file//
  let output = [];
  
  //check to see if the game is a completed regular season game, if not skip the game//
  const game_status = data.gameData.status.abstractGameState;
  const game_type = data.gameData.game.type;
  if (game_status !== "Final" && game_type === "R") { return }
  
  
  const gamepk = data.gameData.game.pk;
  
  //loop through the plays to grab desired data//
  for (let i = 0; i < data.liveData.plays.allPlays.length; i++) {
    let pitchnum = 1;
    if(typeof data.liveData.plays.allPlays[i].playEvents !== "undefined") {
      const leng = data.liveData.plays.allPlays[i].playEvents.length;
      for (let p = 0; p < leng; p++) {
        if (data.liveData.plays.allPlays[i].playEvents[p].isPitch === true) {
          const play = {}
          const ab = data.liveData.plays.allPlays[i];
          
          play.gamepk = gamepk;
          play.date = data.gameData.datetime.officialDate;
          play.year = data.gameData.game.season;
          play.type = data.gameData.game.gamedayType;
          play.game_type = data.gameData.game.type;
          play.temp = data.gameData.weather.temp;
          play.condition = data.gameData.weather.condition;
          play.wind = data.gameData.weather.wind;
          play.venue = data.gameData.venue.id;
          play.home_team = data.gameData.teams.home.abbreviation;
          play.away_team = data.gameData.teams.away.abbreviation;
          
          play.batter = ab.matchup.batter.id;
          play.batter_name = ab.matchup.batter.fullName;
          play.stand = ab.matchup.batSide.code;
          play.pitcher = ab.matchup.pitcher.id;
          play.pitcher_name = ab.matchup.pitcher.fullName;
          play.throws = ab.matchup.pitchHand.code;
          
          play.events = ab.result.event;
          play.description = ab.result.eventType;
          play.des = ab.result.description;
          
          play.inning = ab.about.inning;
          play.topbot = ab.about.halfInning;
          
          play.abnum = ab.atBatIndex;
          
          pitch = data.liveData.plays.allPlays[i].playEvents[p];
          if(pitch.isPitch) {
            play.MLB_playID = pitch.playId;
            try {
            play.pitch_balls = (p-1 >= 0) ? ab.playEvents[p-1].count.balls:0;
            play.pitch_strikes = (p-1 >= 0) ? ab.playEvents[p-1].count.strikes:0;
            play.pitch_outs = (p-1 >= 0) ? ab.playEvents[p-1].count.outs:0;
            play.pitch_call = pitch.details.description;
            play.pitch_type = data.liveData.plays.allPlays[i].playEvents[p].details.type.code;
            play.pitch_startSpeed = pitch.pitchData.startSpeed;
            play.pitch_endSpeed = pitch.pitchData.endSpeed;
            play.pitch_sz_top = pitch.pitchData.strikeZoneTop;
            play.pitch_sz_bot = pitch.pitchData.strikeZoneBottom;
            play.pitch_x0 = pitch.pitchData.coordinates.x0;
            play.pitch_y0 = pitch.pitchData.coordinates.y0;
            play.pitch_z0 = pitch.pitchData.coordinates.z0;
            play.pitch_extension = pitch.pitchData.extension;
            play.pitch_vx0 = pitch.pitchData.coordinates.vX0;
            play.pitch_vy0 = pitch.pitchData.coordinates.vY0;
            play.pitch_vz0 = pitch.pitchData.coordinates.vZ0;
            play.pitch_ax = pitch.pitchData.coordinates.aX;
            play.pitch_ay = pitch.pitchData.coordinates.aY;
            play.pitch_az = pitch.pitchData.coordinates.aZ;
            play.pitch_pfx_x = pitch.pitchData.coordinates.pfxX;
            play.pitch_pfx_z = pitch.pitchData.coordinates.pfxZ;
            play.pitch_px = pitch.pitchData.coordinates.pX;
            play.pitch_pz = pitch.pitchData.coordinates.pZ;
            play.pitch_x = pitch.pitchData.coordinates.x;
            play.pitch_y = pitch.pitchData.coordinates.y;
            play.pitch_px = pitch.pitchData.coordinates.pX;
            play.pitch_pz = pitch.pitchData.coordinates.pZ;
            play.pitch_breakAngle = pitch.pitchData.breaks.breakAngle;
            play.pitch_breakLength = pitch.pitchData.breaks.breakLength;
            play.pitch_break_y = pitch.pitchData.breaks.breakY;
            play.pitch_spinrate = pitch.pitchData.breaks.spinRate;
            play.pitch_breakDirection = pitch.pitchData.breaks.spinDirection;
            play.pitch_zone = pitch.pitchData.zone;
            play.pitch_plateTime = pitch.pitchData.plateTime;
            play.pitchnum = pitchnum;
            
            if(pitch.details.isInPlay ) {
              play.bip_EV = pitch.hitData.launchSpeed;
              play.bip_VA = pitch.hitData.launchAngle;
              play.bip_distance = pitch.hitData.totalDistance;
              play.bip_type = pitch.hitData.trajectory;
              play.bip_hardness = pitch.hitData.hardness;
              play.bip_location = pitch.hitData.location;
              play.bip_hc_x = pitch.hitData.coordinates.coordX;
              play.bip_hc_y = pitch.hitData.coordinates.coordY;
            }
          } catch {}
          }
          play.id = String(gamepk)+"-"+String(ab.matchup.batter.id)+"-"+String(ab.matchup.pitcher.id)+"-"+String(ab.about.inning) +"-"+ String(ab.atBatIndex) +"-"+ String(pitchnum);
          pitchnum++;
          output.push( play );
        }
      }
    } else {
        //in the event of no pitches thrown in a play, set place holder for pitches thrown//
        //this is needed to ensure a unique id for each play//
        play.pitchnum = pitchnum;
        
        //unique play ID//
        play.id = String(gamepk)+"-"+String(ab.matchup.batter.id)+"-"+String(ab.matchup.pitcher.id)+"-"+String(ab.about.inning) +"-"+ String(ab.atBatIndex) +"-"+ String(pitchnum);
        
        output.push( play );
    }
  }
  
  //send output to be written to file//
  writeToFile(output);
}


//takes an array and writes each line to csv file//
function writeToFile(data) {
  data.forEach( (row) => stream.write(row) );
}

//added functionality to array function to allow easy deletion of duplicates//
Array.prototype.contains = function(v) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === v) return true;
  }
  return false;
};

Array.prototype.unique = function() {
  var arr = [];
  for (var i = 0; i < this.length; i++) {
    if (!arr.contains(this[i])) {
      arr.push(this[i]);
    }
  }
  return arr;
}
