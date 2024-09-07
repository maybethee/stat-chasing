import { wrappedUtils } from "./utils";
import { useReplays } from "./ReplaysContext";
import OvertimeStats from "./OvertimeStats";
import WinLossStats from "./WinLossStats";
import DemoStats from "./DemoStats";
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

  function avgSupersonic() {
    const sum = replays.reduce(
      (sum, replay) =>
        sum + wrappedUtils.getPercentSupersonicSpeed(replay, playerName),
      0
    );
    const avg = sum / replays.length;
    return avg.toFixed(2);
  }

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

  function sumTotalDistance() {
    return replays.reduce(
      (sum, replay) => sum + wrappedUtils.getTotalDistance(replay, playerName),
      0
    );
  }

  function avgDistance() {
    const sum = sumTotalDistance();
    const avg = sum / replays.length;
    return avg.toFixed(2);
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
        map(s) with most wins: {formatMapWithMostWins()}
        <br />
        average % supersonic: {avgSupersonic()}%
        <br />
        average distance driven per game: {avgDistance()}
        <br />
        total distance driven across all games: {sumTotalDistance()}
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
      </div>
    </div>
  );
}

export default Stats;
