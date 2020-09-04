-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 04, 2020 at 02:45 PM
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
-- Table structure for table `about`
--

CREATE TABLE `about` (
  `text` text COLLATE utf8_bin DEFAULT NULL,
  `media_type` int(10) NOT NULL DEFAULT 0,
  `video_id` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `photo` varchar(255) COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `about`
--

INSERT INTO `about` (`text`, `media_type`, `video_id`, `photo`) VALUES
(NULL, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `articles`
--

CREATE TABLE `articles` (
  `id` int(255) NOT NULL,
  `cover` varchar(255) COLLATE utf8_bin NOT NULL,
  `title` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `title_en` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `title_tr` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `content` text COLLATE utf8_bin DEFAULT NULL,
  `content_en` text COLLATE utf8_bin DEFAULT NULL,
  `content_tr` text COLLATE utf8_bin DEFAULT NULL,
  `keywords` varchar(255) COLLATE utf8_bin NOT NULL,
  `time` varchar(255) COLLATE utf8_bin NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `articles`
--

INSERT INTO `articles` (`id`, `cover`, `title`, `title_en`, `title_tr`, `content`, `content_en`, `content_tr`, `keywords`, `time`, `status`) VALUES
(2, 'assets/articles/2/510037Group 184.jpg', 'كبش مقابل 3 آلاف ليرة تركية في مرسين', '', '', '                                                                                                                                <p>xSDSDSADASDAS</p><p>DAS</p><p>D</p><p>ASDASDSADSAD</p><p>SADASDASDSAD</p>                                                                                                                        ', '<p><br></p>', '<p><br></p>', '', '1599143694', 1);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(255) NOT NULL,
  `name_en` varchar(255) COLLATE utf8_bin NOT NULL,
  `name_tr` varchar(255) COLLATE utf8_bin NOT NULL,
  `name_ar` varchar(255) COLLATE utf8_bin NOT NULL,
  `image_path` varchar(255) COLLATE utf8_bin NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name_en`, `name_tr`, `name_ar`, `image_path`, `status`) VALUES
(39, 'Test 2', 'test', 'تجريب', 'assets/categories/39/870700baby_carry.svg', 1);

-- --------------------------------------------------------

--
-- Table structure for table `general`
--

CREATE TABLE `general` (
  `facebook` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `twitter` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `instagram` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `snapchat` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `whatsapp` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `email` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `cellphone` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `address` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `map_code` text COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `general`
--

INSERT INTO `general` (`facebook`, `twitter`, `instagram`, `snapchat`, `whatsapp`, `email`, `phone`, `cellphone`, `address`, `map_code`) VALUES
(NULL, '', '', '', '', '', '', NULL, '', NULL),
(NULL, '', '', '', '', '', '', NULL, '', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `panel`
--

CREATE TABLE `panel` (
  `email` varchar(255) COLLATE utf8_bin NOT NULL,
  `password` varchar(255) COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `panel`
--

INSERT INTO `panel` (`email`, `password`) VALUES
('email@email.com', '$2y$10$JHWqO7bq0mYoy1cvRQCePuSS165x/YanR6GxVlzW08XGSRC6AlHA.');

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
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `cover` varchar(255) COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name_en`, `name_ar`, `name_tr`, `price_usd`, `price_eur`, `price_tl`, `description`, `keywords`, `category`, `link`, `time`, `status`, `cover`) VALUES
(4, 'Baby sleeping mosquito net', 'ناموسية نائمة للأطفال', 'Bebek uyuyan cibinlik', 50, 42, 350, 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'product,new,baby,test', 39, '', '1599210610', 1, 'assets/products/4/5462811.jpeg');

-- --------------------------------------------------------

--
-- Table structure for table `product_gallery`
--

CREATE TABLE `product_gallery` (
  `id` int(255) NOT NULL,
  `product_id` int(255) NOT NULL,
  `image_path` varchar(255) COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `product_gallery`
--

INSERT INTO `product_gallery` (`id`, `product_id`, `image_path`) VALUES
(4, 3, 'assets/products/3/5788483.jpeg'),
(5, 3, 'assets/products/3/7579915.jpeg'),
(6, 3, 'assets/products/3/4508327.jpeg'),
(7, 3, 'assets/products/3/8360088.jpeg'),
(8, 3, 'assets/products/3/58385611.jpeg'),
(9, 3, 'assets/products/3/2711429.jpeg'),
(13, 4, 'assets/products/4/6962183.jpeg'),
(14, 4, 'assets/products/4/5702715.jpeg'),
(15, 4, 'assets/products/4/9244877.jpeg'),
(16, 4, 'assets/products/4/7974628.jpeg'),
(17, 4, 'assets/products/4/810549.jpeg');

-- --------------------------------------------------------

--
-- Table structure for table `session`
--

CREATE TABLE `session` (
  `email` varchar(255) COLLATE utf8_bin NOT NULL,
  `token` varchar(255) COLLATE utf8_bin NOT NULL,
  `time` varchar(255) COLLATE utf8_bin NOT NULL,
  `id` varchar(255) COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `session`
--

INSERT INTO `session` (`email`, `token`, `time`, `id`) VALUES
('email@email.com', '$2y$10$4Njj3HNdU8aF90TFS894x.6Dxar32JLaqAskomDZyMWeiH4Z4.gTi5f4dea0a415071598941706', '1598952879', 'frfltu23ri94u73glh9rdrcv4u'),
('email@email.com', '$2y$10$7dCr0EUpDPkKVWCnuHsLIO9GJ5af1SRb9QA63oeo36nYgKPX.ug3W5f508ef02450a1599114992', '1599114997', 'u64visv75i1ko7end172a3kqt5'),
('email@email.com', '$2y$10$OWilkZJ1o0oF6o/uWszUIuJqE9sl3WIxp6Xqigx.4a/swZh7hJOpq5f43d2cbd32661598280395', '1598280400', '69kommc7v7764iiu8m70e1q2o5'),
('email@email.com', '$2y$10$OXV6JG1LDmSYkdO3yCsPrOcZ72zzEe2dnXWb8jpD.q3.0kWz1zq2a5f4603638105d1598423907', '1598427680', 's0f3no2p5uu9ejpghgv1s1e4ge'),
('email@email.com', '$2y$10$WE83/1h.VtrDT2HqrGunMug8JGHLl01eWsnQzb4joCkx8GbkDcrBC5f3f69248d4861597991204', '1597997084', 'k7m1oivus8nturl8hujnen70id'),
('email@email.com', '$2y$10$XNxGyq4b9ZK0lJ/qfKRSv.p3feYJDkxVSBBMKvTuInoYEWcyIAHhq5f3f8767b07751597998951', '1597998960', 'k7m1oivus8nturl8hujnen70id'),
('email@email.com', '$2y$10$lZp/iCDtkaoVNkp3lVfcIedTq64Dnd20j8x5w9zo6P99yh9MtuLE25f435fed767631598250989', '1598250999', '7t8crs6d427ofrgu7p7u07pid7'),
('email@email.com', '$2y$10$rgHSbl8KXdWqJyxgn6f1lupvixN3fCHlBuAAEFU2aDRZUjOSndnK25f4f3f89775a21599029129', '1599031010', 'rqbouceqqaqr1d4f39igs52t6e'),
('email@email.com', '$2y$10$sVIstV7AJvgDhnGVC2fHyuf2MOwCgCgGThjrDlhr.hyTRm3jk3gwG5f51def1ae3fa1599201009', '1599201068', 'tsrs29g7qm77sr2hu2n1f3m313');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `panel`
--
ALTER TABLE `panel`
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_gallery`
--
ALTER TABLE `product_gallery`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `session`
--
ALTER TABLE `session`
  ADD UNIQUE KEY `token` (`token`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `articles`
--
ALTER TABLE `articles`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `product_gallery`
--
ALTER TABLE `product_gallery`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
