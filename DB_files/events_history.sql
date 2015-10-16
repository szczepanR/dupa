CREATE TABLE IF NOT EXISTS `events_history` (
  `title` varchar(255) NOT NULL,
  `start` datetime DEFAULT NULL,
  `end` datetime DEFAULT NULL,
  `resourceID` text,
  `category_id` varchar(255) NOT NULL,
  `queryType` int(30) /* 1=INSERT, 2=UPDATE, 3=DELETE*/
  `timedate` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;