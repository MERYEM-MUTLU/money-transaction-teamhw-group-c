import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  isTransError,
  isTransLoading,
  selectTransactions,
} from "../../../redux/transactions/selectors";
import styles from "./TransactionList.module.css";
import { fetchTransactions } from "../../../redux/transactions/operations";
import TransactionItem from "../TransactionsItem/TransactionItem";
import Loader from "../../Loader/Loader";

const TransactionList = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const transactions = useSelector(selectTransactions);
  const loading = useSelector(isTransLoading);
  const error = useSelector(isTransError);

  return (
    <div className={styles.mainContainer}>
      <ul className={styles.ListHeader}>
        <li className={styles.listHeaderItem}>Date</li>
        <li className={styles.listHeaderItem}>Type</li>
        <li className={styles.listHeaderItem}>Category</li>
        <li className={styles.listHeaderItem}>Comment</li>
        <li className={styles.listHeaderItem}>Sum</li>
        <li className={styles.listHeaderItem}></li>
      </ul>
      {loading && <Loader />}
      <ul className={styles.scroll}>
        {transactions.length > 0 ? (
          transactions.map((item) => {
            return (
              <li key={item._id}>
                <TransactionItem
                  id={item._id}
                  category={item.category}
                  date={item.date}
                  sum={item.sum}
                  type={item.type}
                  comment={item.comment}
                />
              </li>
            );
          })
        ) : (
          <h3 className={styles.message}> No transactions</h3>
        )}
      </ul>
    </div>
  );
};

export default TransactionList;
