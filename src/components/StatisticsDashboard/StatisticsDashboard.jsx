import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form } from "formik";
import Select from "react-select";
import styles from "./StatisticsDashboard.module.css";
import StatisticsTable from "../StatisticsTable/StatisticsTable";
import StatisticsChart from "../Chart/Chart";
import BallanceTab from "../Balance/Balance";
import CurrencyTab from "../Currency/Currency";
import { getTransSummary } from "../../redux/statistics/operations";
import { selectSummary, selectStatLoading, selectStatError } from "../../redux/statistics/selectors";

const StatisticsDashboard = () => {
  const dispatch = useDispatch();

  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1)
  );
  const [selectedYear, setSelectedYear] = useState(
    String(new Date().getFullYear())
  );

  const { incomeSummary, expenseSummary } = useSelector(selectSummary);
  const isLoading = useSelector(selectStatLoading);
  const error = useSelector(selectStatError);
  const balance = incomeSummary - expenseSummary;

  const monthOptions = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => {
    const year = String(currentYear - i);
    return { value: year, label: year };
  });

  useEffect(() => {
    dispatch(getTransSummary({ month: selectedMonth, year: selectedYear }));
  }, [selectedMonth, selectedYear, dispatch]);

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "rgba(74, 86, 226, 0.1)",
      borderRadius: "8px",
      border: "1px solid var(--white-600)",
      color: "var(--white)",
      paddingLeft: "10px",
      fontSize: "16px",
      fontFamily: "var(--font-family)",
      fontWeight: 400,
      height: "50px",
      boxShadow: state.isFocused ? "0 0 0 1px var(--white)" : "none",
      "&:hover": {
        borderColor: "var(--white)",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "var(--white)",
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "8px",
      marginTop: "4px",
      zIndex: 10,
      backdropFilter: "blur(100px)",
      boxShadow: "0 4px 60px 0 rgba(0, 0, 0, 0.25)",
      background:
        "linear-gradient(360deg, rgba(83, 61, 186, 0.7) 0%, rgba(80, 48, 154, 0.7) 35.94%, rgba(106, 70, 165, 0.7) 61.04%, rgba(133, 93, 175, 0.7) 100%)",
    }),
    option: (provided, state) => ({
      ...provided,
      padding: "12px 20px",
      fontSize: "16px",
      fontFamily: "var(--font-family)",
      fontWeight: 400,
      color: state.isFocused ? "#ff868d" : "var(--white)",
      backgroundColor: state.isFocused
        ? "rgba(255, 255, 255, 0.1)"
        : "transparent",
      cursor: "pointer",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "var(--white)",
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: "200px",
    }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.statisticsChart}>
        <h1>Statistics</h1>
        {error && (
          <div className={styles.errorMessage}>
            <p>Error loading statistics: {error}</p>
            <p>Using local data instead.</p>
          </div>
        )}
        <div className={styles.statisticsChartContainer}>
          <StatisticsChart />
        </div>
      </div>

      <div className={styles.filterAndTableContainer}>
        <Formik
          initialValues={{
            month: monthOptions.find((m) => m.value === selectedMonth),
            year: yearOptions.find((y) => y.value === selectedYear),
          }}
          enableReinitialize
        >
          {({ values, setFieldValue }) => (
            <Form className={styles.statisticsFiltersContainer}>
              <div className={styles.statisticsFilterYear}>
                <Select
                  name="year"
                  value={values.year}
                  onChange={(option) => {
                    setFieldValue("year", option);
                    setSelectedYear(option.value);
                  }}
                  options={yearOptions}
                  styles={customSelectStyles}
                  isSearchable={false}
                />
              </div>
              <div className={styles.statisticsFilterMonth}>
                <Select
                  name="month"
                  value={values.month}
                  onChange={(option) => {
                    setFieldValue("month", option);
                    setSelectedMonth(option.value);
                  }}
                  options={monthOptions}
                  styles={customSelectStyles}
                  isSearchable={false}
                />
              </div>
            </Form>
          )}
        </Formik>

        <div className={styles.statisticsTableContainer}>
          <StatisticsTable />
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;
