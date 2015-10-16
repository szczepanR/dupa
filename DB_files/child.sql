CREATE TABLE `child` (
  `child_id` int(30) NOT NULL AUTO_INCREMENT,
  `firstname` varchar(255) COLLATE utf8_general_ci NOT NULL,
  `lastname` varchar(255) COLLATE utf8_general_ci NOT NULL,
PRIMARY KEY (`child_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;