const fetch = require('node-fetch');

const scheduleurl = (startDate, endDate) => "https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate="+startDate+"&endDate="+endDate;
const gameurl = (gamepk) => "https://statsapi.mlb.com/api/v1.1/game/"+gamepk+"/feed/live";
const formatDate = (date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

const fs = require('fs');
var csv = require('fast-csv');
const ws = fs.createWriteStream('./data.csv');
const stream = csv.format();
stream.pipe(ws);
stream.write([ 'date', 'temp', 'condition', 'wind', 'venue', 'batter_name', 'batter', 'stand', 'pitcher_name', 'pitcher', 'throws', 'events', 'description', 'des', 'home_team', 'away_team', 'year', 'type', 'game_type', 'gamepk', 'inning', 'topbot', 'abnum', 'id' ]);


const today = new Date();
const yesterday = new Date(today.setDate(today.getDate() - 1));
const date = formatDate(yesterday);
const url = scheduleurl (date, date)

  fetch(url)
    .then(res => res.json())
    .then(json => setGamepks(json) )
    .catch(err => console.error(err));

function setGamepks(data) {
  const gpks = [];
  for (let d = 0; d < data.dates.length; d++) {
    const total = data.dates[d].games.length;
    const games = data.dates[d].games;
    for(let g = 0; g < total; g++) {
      gpks.push(games[g].gamePk);
    }
  }
  const gamepks = gpks.unique();
  
  next(gamepks);
}

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
  let output = [];
  const game_status = data.gameData.status.abstractGameState;
  const game_type = data.gameData.game.type;
  if (game_status !== "Final" && game_type === "R") { return }
  const gamepk = data.gameData.game.pk;
  for (let i = 0; i < data.liveData.plays.allPlays.length; i++) {
    const play = {}
    play.gamepk = gamepk;
    const ab = data.liveData.plays.allPlays[i];
    play.date = data.gameData.datetime.officialDate;
    play.temp = data.gameData.weather.temp;
    play.condition = data.gameData.weather.condition;
    play.wind = data.gameData.weather.wind;
    play.venue = data.gameData.venue.id;
    
    play.batter = ab.matchup.batter.id;
    play.batter_name = ab.matchup.batter.fullName;
    play.stand = ab.matchup.batSide.code;
    play.pitcher = ab.matchup.pitcher.id;
    play.pitcher_name = ab.matchup.pitcher.fullName;
    play.throws = ab.matchup.pitchHand.code;
    play.events = ab.result.event;
    play.description = ab.result.eventType;
    play.des = ab.result.description;
    play.home_team = data.gameData.teams.home.abbreviation;
    play.away_team = data.gameData.teams.away.abbreviation;
    play.year = data.gameData.game.season;
    play.type = data.gameData.game.gamedayType;
    play.game_type = data.gameData.game.type;
    play.inning = ab.about.inning;
    play.topbot = ab.about.halfInning;
    play.abnum = ab.atBatIndex;
    const pitchnum = (typeof ab.playEvents !== "undefined") ? ab.playEvents.length:1;
    
    play.pitchnum = pitchnum;
    play.id = String(gamepk)+"-"+String(ab.matchup.batter.id)+"-"+String(ab.matchup.pitcher.id)+"-"+String(ab.about.inning) +"-"+ String(ab.atBatIndex) +"-"+ String(pitchnum);
    output.push( play );
  }

  writeToFile(output);
}



function writeToFile(data) {
  data.forEach( (row) => stream.write(row) );
}


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
