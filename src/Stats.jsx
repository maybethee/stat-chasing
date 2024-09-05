import {
  getMapName,
  isPlayerWinner,
  getPercentSupersonicSpeed,
  getDemosInflicted,
} from "./utils";

function Stats({ replays, playerName }) {
  function avgSupersonic() {
    const sum = replays.reduce(
      (sum, replay) =>
        sum +
        getPercentSupersonicSpeed(
          replay["replay_stats"][0]["stats"],
          playerName
        ),
      0
    );
    const avg = sum / replays.length;
    return avg.toFixed(2);
  }

  function avgDemos() {
    const sum = replays.reduce(
      (sum, replay) =>
        sum + getDemosInflicted(replay["replay_stats"][0]["stats"], playerName),
      0
    );
    const avg = sum / replays.length;
    return avg.toFixed(2);
  }
  console.log(replays);
  const resultsPerMap = {};

  function addWinsPerMap() {
    replays.map((replay) => {
      const replayStats = replay["replay_stats"][0]["stats"];
      // console.log(`player winner?: ${isPlayerWinner(replayStats, playerName)}`);
      const mapName = getMapName(replayStats);
      resultsPerMap[mapName] = 0;
      if (isPlayerWinner(replayStats, playerName)) {
        resultsPerMap[mapName] = resultsPerMap[mapName] + 1;
      }
    });
    return resultsPerMap;
  }

  function mapWithMostWins(resultsPerMap) {
    return Object.entries(resultsPerMap).reduce(
      (acc, [mapName, wins]) => {
        if (wins > acc.maxVal) {
          acc.maxVal = wins;
          acc.maxKeys = [mapName];
        } else if (wins === acc.maxVal) {
          acc.maxKeys.push(mapName);
        }
        return acc;
      },
      { maxVal: 0, maxKeys: [] }
    );
  }

  function formatMapWithMostWins() {
    console.log(mapWithMostWins(addWinsPerMap()));
    const { maxVal, maxKeys } = mapWithMostWins(resultsPerMap);
    console.log(maxKeys.map((key) => `${key}: ${maxVal} wins`).join(", "));
    return maxKeys.map((key) => `${key}: ${maxVal} wins`).join(", ");
  }

  function winRate() {
    let win = 0;
    replays.map((replay) => {
      if (isPlayerWinner(replay["replay_stats"][0]["stats"], playerName)) {
        win++;
      }
    });
    const rate = win / replays.length;
    return rate.toFixed(2);
  }

  function formatOvertime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  const getOvertimes = () => {
    return replays.filter(
      (replay) => replay["replay_stats"][0]["stats"]["overtime_seconds"]
    );
  };

  function overtimeGamesPercent() {
    const overtimePercent = (getOvertimes().length / replays.length) * 100;
    return overtimePercent.toFixed(2);
  }

  function overtimWinRate() {
    const overtimeWins = replays.filter((replay) => {
      const isWinner = isPlayerWinner(
        replay["replay_stats"][0]["stats"],
        playerName
      );
      const overtimeSeconds =
        replay["replay_stats"][0]["stats"]["overtime_seconds"];
      return isWinner && overtimeSeconds > 0;
    });
    const winRate = overtimeWins.length / getOvertimes().length;
    return winRate.toFixed(2);
  }

  function longestOvertime() {
    const overtimes = getOvertimes().map((replay) =>
      parseInt(replay["replay_stats"][0]["stats"]["overtime_seconds"], 10)
    );
    // console.log(overtimes);
    console.log("Filtered Overtimes:", overtimes);
    const longestOvertimeSeconds = Math.max(...overtimes);
    return formatOvertime(longestOvertimeSeconds);
  }

  function longestOvertimeWin() {
    const overtimes = replays
      .filter((replay) => {
        const isWinner = isPlayerWinner(
          replay["replay_stats"][0]["stats"],
          playerName
        );
        const overtimeSeconds =
          replay["replay_stats"][0]["stats"]["overtime_seconds"];
        return isWinner && overtimeSeconds > 0;
      })
      .map((replay) => {
        const overtimeSeconds =
          replay["replay_stats"][0]["stats"]["overtime_seconds"];
        return parseInt(overtimeSeconds, 10);
      });

    console.log("Filtered Overtimes:", overtimes);
    const longestOvertimeSeconds = Math.max(...overtimes);
    return formatOvertime(longestOvertimeSeconds);
  }

  function longestOvertimeLoss() {
    const overtimes = replays
      .filter((replay) => {
        const isLoser = !isPlayerWinner(
          replay["replay_stats"][0]["stats"],
          playerName
        );
        const overtimeSeconds =
          replay["replay_stats"][0]["stats"]["overtime_seconds"];
        return isLoser && overtimeSeconds > 0;
      })
      .map((replay) => {
        const overtimeSeconds =
          replay["replay_stats"][0]["stats"]["overtime_seconds"];
        return parseInt(overtimeSeconds, 10);
      });

    console.log("Filtered Overtimes:", overtimes);
    const longestOvertimeSeconds = Math.max(...overtimes);
    return formatOvertime(longestOvertimeSeconds);
  }

  function highestDemoCount() {
    const demos = replays.map((replay) => {
      const demosInGame = getDemosInflicted(
        replay["replay_stats"][0]["stats"],
        playerName
      );
      return parseInt(demosInGame, 10);
    });
    return Math.max(...demos);
  }
  const mostWinsMap = mapWithMostWins(addWinsPerMap());
  return (
    <div>
      <div style={{ fontSize: "1.1rem" }}>
        <br />
        average % supersonic: {avgSupersonic()}%
        <br />
        <br />
        average demos inflicted: {avgDemos()}
        <br />
        <br />
        win rate: {winRate()}
        <br />
        <br />% games go to overtime: {overtimeGamesPercent()}%
        <br />
        longest overtime: {longestOvertime()}
        <br />
        longest overtime win: {longestOvertimeWin()}
        <br />
        longest overtime loss: {longestOvertimeLoss()}
        <br />
        overtime win rate: {overtimWinRate()}
        <br />
        <br />
        most demoes in a single game: {highestDemoCount()}
        <br />
        <br />
        map(s) with most wins: {formatMapWithMostWins()}
        {/* {replays.map((replay, index) => {
          return (
            <ul key={replay.replay_id}>
              <li>
                {index + 1}:{" "}
                {JSON.stringify(replay["replay_stats"][0]["stats"])}
              </li>
            </ul>
          );
        })} */}
      </div>
    </div>
  );
}

export default Stats;
