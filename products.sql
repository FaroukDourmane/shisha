-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 02, 2020 at 05:02 PM
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.4.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shisha`
--

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(255) NOT NULL,
  `name_en` varchar(255) COLLATE utf8_bin NOT NULL,
  `name_ar` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `name_tr` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `price_usd` int(255) NOT NULL DEFAULT 0,
  `price_eur` int(255) NOT NULL DEFAULT 0,
  `price_tl` int(255) NOT NULL DEFAULT 0,
  `description` text COLLATE utf8_bin NOT NULL,
  `keywords` varchar(255) COLLATE utf8_bin NOT NULL,
  `category` int(255) NOT NULL,
  `link` varchar(255) COLLATE utf8_bin NOT NULL,
  `time` varchar(255) COLLATE utf8_bin NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
