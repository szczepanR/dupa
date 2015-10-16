CREATE TABLE `events` (
  `event_id` int(30) NOT NULL AUTO_INCREMENT,
  `parent_id` int(30) NOT NULL,
  `title` varchar(255) COLLATE utf8_general_ci NOT NULL,
  `start` DATETIME DEFAULT NULL,
  `end` DATETIME DEFAULT NULL,
  `resourceID` varchar(255) COLLATE utf8_general_ci NOT NULL,
  `description` varchar(255) COLLATE utf8_general_ci NULL,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;