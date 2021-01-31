CREATE DATABASE `myshop` /*!40100 DEFAULT CHARACTER SET utf8 */ /*!80016 DEFAULT ENCRYPTION='N' */;
CREATE TABLE `myshop`.`user` (
  `uuid` binary(16) NOT NULL,
  `email` varchar(320) NOT NULL,
  `password` varchar(64) NOT NULL,
  `role` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE  `myshop`.`profile` (
  `uuid` binary(16) NOT NULL,
  `user_name` varchar(45) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `avatar` mediumblob,
  PRIMARY KEY (`uuid`),
  CONSTRAINT `fk_prf_usr` FOREIGN KEY (`uuid`) REFERENCES  `myshop`.`user` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE  `myshop`.`post` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(250) NOT NULL,
  `author_id` binary(16) NOT NULL,
  `post_date` datetime NOT NULL,
  `short_content` varchar(360) NOT NULL,
  `post_content` longtext,
  PRIMARY KEY (`id`),
  KEY `fk_post_author_idx` (`author_id`),
  CONSTRAINT `fk_post_author` FOREIGN KEY (`author_id`) REFERENCES  `myshop`.`user` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
CREATE TABLE  `myshop`.`comment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `author_id` binary(16) NOT NULL,
  `post_id` int NOT NULL,
  `comment_date` datetime NOT NULL,
  `content` mediumtext,
  PRIMARY KEY (`id`),
  KEY `fr_comment_author_idx` (`author_id`),
  KEY `fk_comment_post_idx` (`post_id`),
  CONSTRAINT `fk_comment_author` FOREIGN KEY (`author_id`) REFERENCES  `myshop`.`user` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comment_post` FOREIGN KEY (`post_id`) REFERENCES  `myshop`.`post` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
