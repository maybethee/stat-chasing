import { wrappedUtils } from "./utils";
import { useReplays } from "./ReplaysContext";
import WinLossStats from "./WinLossStats";
import DateStats from "./DateStats";
import OvertimeStats from "./OvertimeStats";
import DemoStats from "./DemoStats";
import MovementStats from "./MovementStats";
import CarStats from "./CarStats";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Stats() {
  const { replays, playerName } = useReplays();

  function highestGoalDifferenceGame() {
    const winningReplays = replays.filter((replay) => {
      const isWinner = wrappedUtils.isPlayerWinner(replay, playerName);
      return isWinner;
    });
    return winningReplays.reduce((maxReplay, replay) => {
      const maxGoalDiff = wrappedUtils.getGoalDifference(maxReplay);
      const currentGoalDiff = wrappedUtils.getGoalDifference(replay);
      return currentGoalDiff > maxGoalDiff ? replay : maxReplay;
    }, winningReplays[0]);
  }

  function formatBiggestWin() {
    const biggestWin = highestGoalDifferenceGame();

    // console.log(biggestWin["replay_stats"][0]["stats"]);
    return (
      "biggest win: " +
      wrappedUtils.getGoalDifference(biggestWin) +
      " " +
      "goal lead against " +
      // eventually: link to player profiles on ballchasing (or steam profile if steam?)
      wrappedUtils.getOpposingPlayerNames(biggestWin) +
      " " +
      "on " +
      // eventually: link to replay on ballchasing
      new Date(
        biggestWin["replay_stats"][0]["stats"]["date"]
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }) +
      "."
    );
  }

  function gamesWonGoalDiffs() {
    const goalDiffsArr = [];

    // 5 times, do:
    for (let n = 1; n <= 5; n++) {
      const gamesAtNDiff = replays.filter((replay) => {
        const isWinner = wrappedUtils.isPlayerWinner(replay, playerName);
        const nGoals = wrappedUtils.isGoalDifference(replay, n);
        return isWinner && nGoals;
      });
      // console.log(gamesAtNDiff);
      // console.log(gamesAtNDiff.length);
      goalDiffsArr.push(gamesAtNDiff.length);
    }
    // console.log("games won diff array: ", goalDiffsArr);
    return goalDiffsArr;
  }

  function gamesLostGoalDiffs() {
    const goalDiffsArr = [];

    // 5 times, do:
    for (let n = 1; n <= 5; n++) {
      const gamesAtNDiff = replays.filter((replay) => {
        const isLoser = !wrappedUtils.isPlayerWinner(replay, playerName);
        const nGoals = wrappedUtils.isGoalDifference(replay, n);
        return isLoser && nGoals;
      });
      // console.log(gamesAtNDiff);
      // console.log(gamesAtNDiff.length);
      goalDiffsArr.push(gamesAtNDiff.length);
    }
    // console.log("games lost diff array: ", goalDiffsArr);
    return goalDiffsArr;
  }

  function groupReplaysByMap() {
    const mapGroups = {};
    replays.forEach((replay) => {
      const mapName = wrappedUtils.getMapName(replay);
      if (!mapGroups[mapName]) {
        mapGroups[mapName] = [];
      }
      mapGroups[mapName].push(replay);
    });
    return mapGroups;
  }

  function groupWinsByMap(mapGroups) {
    const winsByMap = {};
    for (const mapName in mapGroups) {
      winsByMap[mapName] = mapGroups[mapName].reduce((count, replay) => {
        return (
          count + (wrappedUtils.isPlayerWinner(replay, playerName) ? 1 : 0)
        );
      }, 0);
    }
    return winsByMap;
  }

  function mapWithMostWins(winsByMap) {
    return Object.entries(winsByMap).reduce(
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

  const mapWithMostReplays = (mapGroups) => {
    return Object.entries(mapGroups).reduce(
      (acc, [mapName, replays]) => {
        const count = replays.length; // Get the number of replays for each date
        if (count > acc.maxVal) {
          acc.maxVal = count;
          acc.maxKeys = [mapName];
        } else if (count === acc.maxVal) {
          acc.maxKeys.push(mapName);
        }
        return acc;
      },
      { maxVal: 0, maxKeys: [] }
    );
  };

  function formatMapWithMostWins() {
    // console.log(mapWithMostWins(addWinsPerMap()));
    const mapGroups = groupReplaysByMap(replays);
    const winsByMap = groupWinsByMap(mapGroups);
    const { maxVal, maxKeys } = mapWithMostWins(winsByMap);

    return (
      "map(s) with most wins: " +
      maxKeys.map((key) => `${key}, ${maxVal} wins`).join(", ")
    );
  }

  function formatMapWithMostReplays() {
    // console.log(mapWithMostWins(addWinsPerMap()));
    const mapGroups = groupReplaysByMap(replays);
    const { maxVal, maxKeys } = mapWithMostReplays(mapGroups);

    return (
      "map(s) with most played games: " +
      maxKeys.map((key) => `${key}, with ${maxVal} games`).join(", ")
    );
  }

  const combinedGoalDiffs = gamesWonGoalDiffs()
    .reverse()
    .concat(gamesLostGoalDiffs());

  function avgMVPInAllGames() {
    const sum = replays.reduce((sum, replay) => {
      if (wrappedUtils.isPlayerMVP(replay, playerName)) {
        return sum + 1;
      }
      return sum;
    }, 0);
    const avg = sum / replays.length;
    return avg.toFixed(2);
  }

  function avgMVPInWins() {
    // note: this filter is necessary to differentiate from the above statistic
    const filteredReplays = replays.filter((replay) => {
      const isWinner = wrappedUtils.isPlayerWinner(replay, playerName);
      return isWinner;
    });
    const sum = filteredReplays.reduce((sum, replay) => {
      if (wrappedUtils.isPlayerMVP(replay, playerName)) {
        return sum + 1;
      }
      return sum;
    }, 0);
    const avg = sum / filteredReplays.length;
    return avg.toFixed(2);
  }

  const backgroundColors = [
    "rgba(75, 192, 192, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(255, 99, 132, 0.6)",
    "rgba(255, 99, 132, 0.6)",
    "rgba(255, 99, 132, 0.6)",
    "rgba(255, 99, 132, 0.6)",
    "rgba(255, 99, 132, 0.6)",
  ];

  const borderColors = [
    "rgba(75, 192, 192, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(255, 99, 132, 1)",
    "rgba(255, 99, 132, 1)",
    "rgba(255, 99, 132, 1)",
    "rgba(255, 99, 132, 1)",
    "rgba(255, 99, 132, 1)",
  ];

  return (
    <div>
      <h2>{playerName}'s Stats:</h2>
      <br />
      <br />
      average MVPs out of all games: {avgMVPInAllGames()}
      <br />
      <br />
      average MVPs out of only wins: {avgMVPInWins()}
      <br />
      <br />
      {formatMapWithMostReplays()}
      <br />
      <br />
      {formatMapWithMostWins()}
      <div style={{ fontSize: "1.1rem" }}>
        <br />
        <CarStats />
        <br />
        <br />
        <WinLossStats />
        <br />
        <br />
        <DateStats />
        <br />
        <br />
        <OvertimeStats />
        <br />
        <br />
        <DemoStats />
        <br />
        <br />
        <MovementStats />
        <br />
        <br />
        <div style={{ position: "relative" }}>
          <Bar
            data={{
              labels: [
                "5+ goals",
                "4 goals",
                "3 goals",
                "2 goals",
                "1 goal",
                "1 goal",
                "2 goals",
                "3 goals",
                "4  goals",
                "5+ goals",
              ],
              datasets: [
                {
                  // might just make a custom label...
                  label: "Games Won | Games Lost",
                  data: combinedGoalDiffs,
                  backgroundColor: backgroundColors,
                  borderColor: borderColors,
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              maintainAspectRatio: true,
              responsive: true,
              scales: {
                y: {
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
              plugins: {
                legend: {
                  labels: {
                    generateLabels: (chart) => {
                      const { datasets } = chart.data;
                      return datasets.map((dataset) => ({
                        text: dataset.label,
                        fillStyle: "transparent",
                        strokeStyle: "transparent",
                      }));
                    },
                  },
                },
              },
            }}
          />
        </div>
        <br />
        <p>{formatBiggestWin()}</p>
      </div>
    </div>
  );
}

export default Stats;
