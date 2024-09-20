const withReplayStats =
  (fn) =>
  (replay, ...args) => {
    const replayStats = replay["replay_stats"][0]["stats"];
    return fn(replayStats, ...args);
  };

const findPlayer = (team, playerName) => {
  return team ? team.find((player) => player["name"] === playerName) : null;
};

const findPlayerById = (team, playerId) => {
  return team ? team.find((player) => player["id"]["id"] === playerId) : null;
};

const inPlaylist = (replayStats, playlist) => {
  return replayStats["playlist_id"] === playlist ? true : false;
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

const joinNames = (names) => {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return names.join(" and ");

  return names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
};

const getOpposingPlayerNames = (replayStats, playerName) => {
  const { blueTeam, orangeTeam } = getTeams(replayStats);

  let opposingTeam;

  findPlayer(blueTeam, playerName)
    ? (opposingTeam = orangeTeam)
    : (opposingTeam = blueTeam);

  const opponentNames = opposingTeam.map((player) => {
    return player["name"];
  });

  return joinNames(opponentNames);
};

const getPlayerStats = (replayStats, playerName) => {
  const { blueTeam, orangeTeam } = getTeams(replayStats);

  const player =
    findPlayer(blueTeam, playerName) || findPlayer(orangeTeam, playerName);

  return player ? player["stats"] : null;
};

const getPlayerNameById = (replayStats, playerId) => {
  const { blueTeam, orangeTeam } = getTeams(replayStats);

  const player =
    findPlayerById(blueTeam, playerId) || findPlayerById(orangeTeam, playerId);

  return player ? player["name"] : "";
};

const splitReplayDate = (replayStats) => {
  return replayStats["date"].split("T")[0];
};

const getMapName = (replayStats) => {
  return replayStats["map_name"];
};

const isPlayerWinner = (replayStats, playerName) => {
  const { blueTeam, orangeTeam } = getTeams(replayStats);
  const winningTeam = getWinningTeam(replayStats);

  // true if player name is on winning team
  return (
    (blueTeam.some((player) => player["name"] === playerName) &&
      winningTeam === "blue") ||
    (orangeTeam.some((player) => player["name"] === playerName) &&
      winningTeam === "orange")
  );
};

const getPercentSupersonicSpeed = (replayStats, playerName) => {
  const playerStats = getPlayerStats(replayStats, playerName);
  return playerStats ? playerStats["movement"]["percent_supersonic_speed"] : 0;
};

const getAvgSpeed = (replayStats, playerName) => {
  const playerStats = getPlayerStats(replayStats, playerName);
  return playerStats ? playerStats["movement"]["avg_speed"] : 0;
};

const getBPM = (replayStats, playerName) => {
  const playerStats = getPlayerStats(replayStats, playerName);
  return playerStats ? playerStats["boost"]["bpm"] : 0;
};

const getBCPM = (replayStats, playerName) => {
  const playerStats = getPlayerStats(replayStats, playerName);
  return playerStats ? playerStats["boost"]["bcpm"] : 0;
};

const getDemosInflicted = (replayStats, playerName) => {
  const playerStats = getPlayerStats(replayStats, playerName);
  return playerStats ? playerStats["demo"]["inflicted"] : 0;
};

const getDemosTaken = (replayStats, playerName) => {
  const playerStats = getPlayerStats(replayStats, playerName);
  return playerStats ? playerStats["demo"]["taken"] : 0;
};

const getWinningTeam = (replayStats) => {
  const { blueTeam, orangeTeam } = getTeams(replayStats);
  // console.log("orange goals:", blueTeam[0]["stats"]["core"]["goals_against"]);
  const blueGoals = orangeTeam[0]["stats"]["core"]["goals_against"];
  const orangeGoals = blueTeam[0]["stats"]["core"]["goals_against"];

  return blueGoals > orangeGoals ? "blue" : "orange";
};

// for use with goal differential bar chart, remove 5+ conditional for other purposes
const isGoalDifference = (replayStats, desiredDifference) => {
  if (desiredDifference === 5) {
    return getGoalDifference(replayStats) >= desiredDifference ? true : false;
  } else {
    return getGoalDifference(replayStats) === desiredDifference ? true : false;
  }
};

const getGoalDifference = (replayStats) => {
  const { blueTeam, orangeTeam } = getTeams(replayStats);

  const blueGoals = orangeTeam[0]["stats"]["core"]["goals_against"];
  const orangeGoals = blueTeam[0]["stats"]["core"]["goals_against"];

  return Math.abs(blueGoals - orangeGoals);
};

const getTotalDistance = (replayStats, playerName) => {
  const playerStats = getPlayerStats(replayStats, playerName);
  return playerStats ? playerStats["movement"]["total_distance"] : 0;
};

const getOvertimeSeconds = (replayStats) => {
  return replayStats["overtime_seconds"];
};

const isPlayerMVP = (replayStats, playerName) => {
  const playerStats = getPlayerStats(replayStats, playerName);

  return playerStats ? playerStats["core"]["mvp"] : null;
};

export const wrappedUtils = {
  isPlayerWinner: withReplayStats(isPlayerWinner),
  isGoalDifference: withReplayStats(isGoalDifference),
  getDemosInflicted: withReplayStats(getDemosInflicted),
  getDemosTaken: withReplayStats(getDemosTaken),
  getTotalDistance: withReplayStats(getTotalDistance),
  getPercentSupersonicSpeed: withReplayStats(getPercentSupersonicSpeed),
  getMapName: withReplayStats(getMapName),
  getOvertimeSeconds: withReplayStats(getOvertimeSeconds),
  getGoalDifference: withReplayStats(getGoalDifference),
  getOpposingPlayerNames: withReplayStats(getOpposingPlayerNames),
  getAvgSpeed: withReplayStats(getAvgSpeed),
  getBPM: withReplayStats(getBPM),
  getBCPM: withReplayStats(getBCPM),
  inPlaylist: withReplayStats(inPlaylist),
  splitReplayDate: withReplayStats(splitReplayDate),
  isPlayerMVP: withReplayStats(isPlayerMVP),
  getPlayerNameById: withReplayStats(getPlayerNameById),
};
