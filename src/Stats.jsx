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

  //

  function groupReplaysByDate() {
    const dateGroups = {};
    replays.forEach((replay) => {
      const date = wrappedUtils.splitReplayDate(replay);
      if (!dateGroups[date]) {
        dateGroups[date] = [];
      }
      dateGroups[date].push(replay);
    });
    return dateGroups;
  }

  function groupWinsByDate(dateGroups) {
    const winsByDate = {};
    for (const date in dateGroups) {
      winsByDate[date] = dateGroups[date].reduce((count, replay) => {
        return (
          count + (wrappedUtils.isPlayerWinner(replay, playerName) ? 1 : 0)
        );
      }, 0);
    }
    return winsByDate;
  }

  function dateWithMostWins(winsByDate) {
    return Object.entries(winsByDate).reduce(
      (acc, [date, wins]) => {
        if (wins > acc.maxVal) {
          acc.maxVal = wins;
          acc.maxKeys = [date];
        } else if (wins === acc.maxVal) {
          acc.maxKeys.push(date);
        }
        return acc;
      },
      { maxVal: 0, maxKeys: [] }
    );
  }

  const dateWithMostReplays = (dateGroups) => {
    return Object.entries(dateGroups).reduce(
      (acc, [date, replays]) => {
        const count = replays.length; // Get the number of replays for each date
        if (count > acc.maxVal) {
          acc.maxVal = count;
          acc.maxKeys = [date];
        } else if (count === acc.maxVal) {
          acc.maxKeys.push(date);
        }
        return acc;
      },
      { maxVal: 0, maxKeys: [] }
    );
  };

  function formatDateWithMostWins() {
    const dateGroups = groupReplaysByDate(replays);
    const winsByDate = groupWinsByDate(dateGroups);
    const { maxVal, maxKeys } = dateWithMostWins(winsByDate);

    return (
      "date(s) with most wins: " +
      maxKeys
        .map((key) => {
          const keyDate = new Date(key).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return `${keyDate}, with ${maxVal} wins`;
        })
        .join(", ")
    );
  }

  function avgGamesPlayedPerSession() {
    // maybe differentiate this from avg games played per day including days where no games were played, since this is currently more like "games played per session" which isn't that useless ig but maybe just not what i initially intended

    // in the case of all days and not just sessions, i may have to start with the real date first, and do some kind of "if datePlayed, date[1].length, else 0 and then add totals..., starting from first existing date and ending on last existing date. shouldn't be too hard, but not sure how to match the dates yet, maybe just the same as below"

    // let startDate = new Date(Object.keys(dateGroups)[0]);
    // const endDate = new Date(Object.keys(dateGroups)[-1]);

    // while (startDate <= endDate) {
    //   console.log("start");
    //   // if (Object.entries(dateGroudateGroupsps).includes(startDate)) {
    //   // Object.keys(dateGroups).find(())startDate
    //   // }

    //   let newDate = startDate.setDate(loop.getDate() + 1);
    //   startDate = new Date(newDate);
    // }

    const dateGroups = groupReplaysByDate(replays);
    console.log("date groups arr:", dateGroups);

    let gamesPlayed = [];
    Object.entries(dateGroups).forEach((date) => {
      // console.log("date", date[1].length);
      gamesPlayed.push(date[1].length);
    });

    console.log("games played:", gamesPlayed);

    const sum = gamesPlayed.reduce((sum, date) => sum + date, 0);
    const avg = sum / gamesPlayed.length;
    return avg.toFixed(2);
  }

  function formatDateWithMostReplays() {
    const dateGroups = groupReplaysByDate(replays);
    const { maxVal, maxKeys } = dateWithMostReplays(dateGroups);

    return (
      "date(s) with most played games: " +
      maxKeys
        .map((key) => {
          const keyDate = new Date(key).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return `${keyDate}, with ${maxVal} games`;
        })
        .join(", ")
    );
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

  return (
    <div>
      average games played per session: {avgGamesPlayedPerSession()}
      <br />
      <br />
      {formatDateWithMostReplays()}
      <br />
      <br />
      {formatDateWithMostWins()}
      <br />
      <br />
      {formatMapWithMostReplays()}
      <br />
      <br />
      {formatMapWithMostWins()}
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
