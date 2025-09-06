import { useSelector } from "react-redux";
import { selectCategories } from "../../redux/statistics/selectors";
import { selectTotalBalance } from "../../redux/auth/selectors";
import styles from "./Chart.module.css";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { selectSummary } from "../../redux/statistics/selectors";

ChartJS.register(ArcElement, Tooltip, Legend);

const Chart = () => {
  const categoriesData = useSelector(selectCategories) || [];
  const balance = useSelector(selectTotalBalance) ?? 0;
  const summary = useSelector(selectSummary) || { incomeSummary: 0, expenseSummary: 0 };
  const { expenseSummary } = summary;


  const categoryColors = {
    "Main expenses": "#FED057",
    Products: "#FFD8D0",
    Car: "#FD9498",
    "Self care": "#C5BAFF",
    "Child care": "#6E78E8",
    "Household products": "#4A56E2",
    Education: "#81E1FF",
    Leisure: "#24CCA7",
    "Other expenses": "#00AD84",
    Entertainment: "#FF6596",
  };

  // Filter out income category and ensure we have valid data
  const expenseCategories = categoriesData.filter(c => c.category && c.category !== 'Income' && c.category !== 'INCOME');
  
  
  if (!expenseCategories.length || expenseSummary === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.chartWrapper}>
          <div className={styles.noDataMessage}>
            <p>No expense data available</p>
            <p>Add some transactions to see your spending breakdown</p>
          </div>
          <div className={styles.balanceDisplay}>
            <p className={styles.balanceAmount}>
              ₴ {expenseSummary.toLocaleString("uk-UA", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const data = {
    labels: expenseCategories.map((c) => c.category),
    datasets: [
      {
        data: expenseCategories.map((c) => c.total),
        backgroundColor: expenseCategories.map(
          (c) => categoryColors[c.category] || "#808080"
        ),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };


  const options = {
    cutout: "70%",
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) =>
            `${ctx.label}: ₴${ctx.raw.toLocaleString("uk-UA", {
              minimumFractionDigits: 2,
            })}`,
        },
      },
    },
    maintainAspectRatio: false,
    elements: {
      arc: {
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: '#fff',
      },
    },
    interaction: {
      intersect: false,
    },
  };

  return (
    <div className={styles.container}>
      <div className={styles.chartWrapper}>
        <Doughnut data={data} options={options} />
        <div className={styles.balanceDisplay}>
          <p className={styles.balanceAmount}>
            ₴ {expenseSummary.toLocaleString("uk-UA", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
      <div className={styles.legend}>
        {expenseCategories.map((category, index) => (
          <div key={category.category} className={styles.legendItem}>
            <div 
              className={styles.legendColor} 
              style={{ backgroundColor: categoryColors[category.category] || "#808080" }}
            />
            <span className={styles.legendLabel}>{category.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chart;
