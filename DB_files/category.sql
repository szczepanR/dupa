CREATE TABLE `category` (
  `category_id` int(30) NOT NULL,
  `color` varchar(255) COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;