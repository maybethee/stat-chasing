// these functions assume replay is the "replay_stats" of a single replay object

const findPlayer = (team, playerName) => {
  return team ? team.find((player) => player["name"] === playerName) : null;
};

const getTeams = (replayStats) => {
  const blueTeam = replayStats["blue"] ? replayStats["blue"]["players"] : [];
  const orangeTeam = replayStats["orange"]
    ? replayStats["orange"]["players"]
    : [];

  // console.log("replay stats blue:", replayStats["blue"]);
  // console.log("orange team:", orangeTeam);
  return { blueTeam, orangeTeam };
};

const getPlayerStats = (replayStats, playerName) => {
  const { blueTeam, orangeTeam } = getTeams(replayStats);

  const player =
    findPlayer(blueTeam, playerName) || findPlayer(orangeTeam, playerName);

  return player ? player["stats"] : null;
};

const getMapName = (replayStats) => {
  return replayStats["map_name"];
};

const isPlayerWinner = (replayStats, playerName) => {
  const { blueTeam, orangeTeam } = getTeams(replayStats);
  const winningTeam = getWinningTeam(replayStats);

  // true if player name is on winning team
  return (
    blueTeam.some((player) => player["name"] === playerName) &&
    winningTeam === "blue"
  );
};

const getPercentSupersonicSpeed = (replayStats, playerName) => {
  const playerStats = getPlayerStats(replayStats, playerName);
  return playerStats ? playerStats["movement"]["percent_supersonic_speed"] : 0;
};

const getDemosInflicted = (replayStats, playerName) => {
  const playerStats = getPlayerStats(replayStats, playerName);
  return playerStats ? playerStats["demo"]["inflicted"] : 0;
};

const getWinningTeam = (replayStats) => {
  const { blueTeam, orangeTeam } = getTeams(replayStats);
  console.log("orange goals:", blueTeam[0]["stats"]["core"]["goals_against"]);
  const blueGoals = orangeTeam[0]["stats"]["core"]["goals_against"];
  const orangeGoals = blueTeam[0]["stats"]["core"]["goals_against"];
  return blueGoals > orangeGoals ? "blue" : "orange";
};

export {
  isPlayerWinner,
  getDemosInflicted,
  getPercentSupersonicSpeed,
  getMapName,
};
