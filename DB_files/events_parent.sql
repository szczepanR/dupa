CREATE TABLE `events_parent` (
  `parent_id` int(30) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8_general_ci NOT NULL,
  `weekday` int(1) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `repeats` TINYINT(1) DEFAULT NULL,
  `repeat_freq` TINYINT(1) DEFAULT NULL,
  `resourceID` varchar(255) COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`parent_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;