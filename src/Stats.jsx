import { wrappedUtils } from "./utils";
import { useReplays } from "./ReplaysContext";
import OvertimeStats from "./OvertimeStats";
import WinLossStats from "./WinLossStats";
import DemoStats from "./DemoStats";
import MovementStats from "./MovementStats";
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

  const resultsPerMap = {};

  function addWinsPerMap() {
    replays.map((replay) => {
      const mapName = wrappedUtils.getMapName(replay);
      resultsPerMap[mapName] = 0;
      if (wrappedUtils.isPlayerWinner(replay, playerName)) {
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
    // console.log(mapWithMostWins(addWinsPerMap()));
    const { maxVal, maxKeys } = mapWithMostWins(resultsPerMap);
    // console.log(maxKeys.map((key) => `${key}: ${maxVal} wins`).join(", "));
    return maxKeys.map((key) => `${key}: ${maxVal} wins`).join(", ");
  }

  // need to ensure this game is a winning game
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

  const combinedGoalDiffs = gamesWonGoalDiffs()
    .reverse()
    .concat(gamesLostGoalDiffs());

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

  // replays.map((replay) => {
  //   wrappedUtils.getOpposingPlayerNames(replay, playerName);
  // });

  const mostWinsMap = mapWithMostWins(addWinsPerMap());

  return (
    <div>
      <div style={{ fontSize: "1.1rem" }}>
        <br />
        <WinLossStats />
        <br />
        <br />
        <OvertimeStats />
        <br />
        <br />
        <DemoStats />
        <br />
        <br />
        <MovementStats />
        {/* map(s) with most wins: {formatMapWithMostWins()} */}
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
