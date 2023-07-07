-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2023-06-30 10:51:36
-- 伺服器版本： 10.4.27-MariaDB
-- PHP 版本： 8.0.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `demo`
--

-- --------------------------------------------------------

--
-- 資料表結構 `parking`
--

CREATE TABLE `parking` (
  `id` int(11) NOT NULL,
  `confirm` tinyint(1) NOT NULL,
  `license_plate` text NOT NULL,
  `space_id` int(11) NOT NULL,
  `enter_time` datetime NOT NULL DEFAULT current_timestamp(),
  `out_time` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `car_img_path` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `parking`
--

INSERT INTO `parking` (`id`, `confirm`, `license_plate`, `space_id`, `enter_time`, `out_time`, `car_img_path`) VALUES
(1, 1, 'ABC-2155', 0, '2023-06-30 16:32:28', '2023-06-30 16:33:26', 'C:\\donkey_git\\630');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `parking`
--
ALTER TABLE `parking`
  ADD PRIMARY KEY (`id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `parking`
--
ALTER TABLE `parking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
