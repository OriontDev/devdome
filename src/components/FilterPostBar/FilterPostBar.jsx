import { useState } from "react";
import styles from './FilterPostBar.module.css';


function FilterPostBar( {setSortPostMode, sortPostMode} ) {

    // LTO => Latest To Oldest
    // OTL => Oldest To Latest
    // LIK => By Like
    // COM => By Comments

  return (
    <>
      <div className={styles.container}>
        <button onClick={() => setSortPostMode("LIK")} className={sortPostMode == "LIK" ? styles.buttonChoosen : styles.filterButton}>Most Liked</button>
        <button onClick={() => setSortPostMode("LTO")} className={sortPostMode == "LTO" ? styles.buttonChoosen : styles.filterButton}>Latest</button>
        <button onClick={() => setSortPostMode("OTL")} className={sortPostMode == "OTL" ? styles.buttonChoosen : styles.filterButton}>Oldest</button>
        <button onClick={() => setSortPostMode("COM")} className={sortPostMode == "COM" ? styles.buttonChoosen : styles.filterButton}>Most Commented</button>
      </div>
    </>

  );
}

export default FilterPostBar