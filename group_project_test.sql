-- MySQL dump 10.13  Distrib 8.0.32, for Linux (x86_64)
--
-- Host: localhost    Database: group_project_test
-- ------------------------------------------------------
-- Server version	8.0.32-0ubuntu0.22.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `admin-fk-user-id_idx` (`user_id`),
  CONSTRAINT `admin-fk-user-id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,7777783),(2,7777784),(3,7777785),(4,7777786),(5,7777787);
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_rsvp`
--

DROP TABLE IF EXISTS `event_rsvp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_rsvp` (
  `user_id` int NOT NULL,
  `event_id` int NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  KEY `foreign_key_user_id_idx` (`user_id`),
  KEY `foreign_key_event_id_idx` (`event_id`),
  CONSTRAINT `foreign_key_event_id` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`),
  CONSTRAINT `foreign_key_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_rsvp`
--

LOCK TABLES `event_rsvp` WRITE;
/*!40000 ALTER TABLE `event_rsvp` DISABLE KEYS */;
INSERT INTO `event_rsvp` VALUES (7777783,9,74),(7777784,4,75),(7777784,10,76),(7777783,4,79);
/*!40000 ALTER TABLE `event_rsvp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` tinytext NOT NULL,
  `content` mediumtext NOT NULL,
  `user_id` int NOT NULL,
  `deadline` timestamp NOT NULL,
  `organisation_id` int DEFAULT NULL,
  `image` longblob,
  PRIMARY KEY (`id`),
  KEY `fk_user_id_2_idx` (`user_id`),
  CONSTRAINT `fk_user_id_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (4,'testing justin edit LMAO','HUH1231',7777784,'2024-05-29 05:07:00',1,NULL),(9,'timothy','1231',7777783,'2024-07-04 17:49:00',1,NULL),(10,'test event','`123123123',7777784,'2024-06-14 15:35:00',2,NULL);
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organisation_user_relations`
--

DROP TABLE IF EXISTS `organisation_user_relations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organisation_user_relations` (
  `organisation_id` int NOT NULL,
  `user_id` int NOT NULL,
  `get_notifications` tinyint NOT NULL DEFAULT '1',
  UNIQUE KEY `unique_org_user` (`organisation_id`,`user_id`),
  KEY `fk_organisation_id_2_idx` (`organisation_id`),
  KEY `fk_user_id_4_idx` (`user_id`),
  CONSTRAINT `fk_organisation_id` FOREIGN KEY (`organisation_id`) REFERENCES `organisations` (`id`),
  CONSTRAINT `fk_user_id_4` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organisation_user_relations`
--

LOCK TABLES `organisation_user_relations` WRITE;
/*!40000 ALTER TABLE `organisation_user_relations` DISABLE KEYS */;
INSERT INTO `organisation_user_relations` VALUES (1,7777783,1),(1,7777784,1),(1,7777798,0),(2,7777783,1),(2,7777784,1),(2,7777785,1),(2,7777786,1),(2,7777787,1),(2,7777788,1),(2,7777789,1),(3,7777783,1),(3,7777784,1),(4,7777783,1),(4,7777784,1),(5,7777783,1),(19,7777784,1);
/*!40000 ALTER TABLE `organisation_user_relations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organisations`
--

DROP TABLE IF EXISTS `organisations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organisations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `user_id` int NOT NULL,
  `description` longtext,
  `image_path` text,
  PRIMARY KEY (`id`),
  KEY `fk_user_id_3_idx` (`user_id`),
  CONSTRAINT `fk_user_id_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organisations`
--

LOCK TABLES `organisations` WRITE;
/*!40000 ALTER TABLE `organisations` DISABLE KEYS */;
INSERT INTO `organisations` VALUES (1,'TEST organisation123',7777783,'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ligula libero, consequat ut finibus et, tempus quis magna. Morbi porttitor nisi in pharetra elementum. Integer lobortis 123123tortor eu arcu aliquam ornare. Phasellus vitae suscipit libero. Integer id nisi malesuada, maximus odio ut, dictum nisi.123123123','1718091711528.jpg'),(2,'TEST 2 organisation',7777784,'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ligula libero, consequat ut finibus et, tempus quis magna. Morbi porttitor nisi in pharetra elementum. Integer lobortis tortor eu arcu aliquam ornare. Phasellus vitae suscipit libero. Integer id nisi malesuada, maximus odio ut, dictum nisi.','1718084659803.png'),(3,'Organisation 3',7777784,'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ligula libero, consequat ut finibus et, tempus quis magna. Morbi porttitor nisi in pharetra elementum. Integer lobortis tortor eu arcu aliquam ornare. Phasellus vitae suscipit libero. Integer id nisi malesuada, maximus odio ut, dictum nisi.','1718012194069.png'),(4,'Organisation 4',7777784,'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ligula libero, consequat ut finibus et, tempus quis magna. Morbi porttitor nisi in pharetra elementum. Integer lobortis tortor eu arcu aliquam ornare. Phasellus vitae suscipit libero. Integer id nisi malesuada, maximus odio ut, dictum nisi.','1718084667799.jpg'),(5,'Organisation 5',7777784,'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ligula libero, consequat ut finibus et, tempus quis magna. Morbi porttitor nisi in pharetra elementum. Integer lobortis tortor eu arcu aliquam ornare. Phasellus vitae suscipit libero. Integer...','1718084677628.jpg'),(6,'Organisation 6',7777784,'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ligula libero, consequat ut finibus et, tempus quis magna. Morbi porttitor nisi in pharetra elementum. Integer lobortis tortor eu arcu aliquam ornare. Phasellus vitae suscipit libero. Integer...','1718084683741.jpg'),(7,'Organisation 7',7777784,'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ligula libero, consequat ut finibus et, tempus quis magna. Morbi porttitor nisi in pharetra elementum. Integer lobortis tortor eu arcu aliquam ornare. Phasellus vitae suscipit libero. Integer...',NULL),(19,'123123',7777784,'123','1718090058525.jpg');
/*!40000 ALTER TABLE `organisations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` tinytext NOT NULL,
  `content` mediumtext NOT NULL,
  `user_id` int DEFAULT NULL,
  `post_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `organisation_id` int DEFAULT NULL,
  `public` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id_fk_posts_idx` (`user_id`),
  KEY `organisation_id_fk_posts_idx` (`organisation_id`),
  CONSTRAINT `organisation_id_fk_posts` FOREIGN KEY (`organisation_id`) REFERENCES `organisations` (`id`),
  CONSTRAINT `user_id_fk_posts` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (16,'test2','abcdef',7777783,'2024-06-10 02:21:00',1,1),(17,'test3','abcdef',7777783,'2024-06-10 02:21:00',1,1),(18,'test4','abcdef',7777783,'2024-06-10 02:21:00',1,1),(19,'test5','abcdef',7777783,'2024-06-10 02:21:00',1,1),(20,'test6','abcdef',7777783,'2024-06-10 02:21:00',1,1),(21,'test7','abcdef',7777783,'2024-06-10 02:21:00',1,1),(22,'test8','abcdef',7777783,'2024-06-10 02:21:00',1,1),(23,'test9','abcdef',7777783,'2024-06-10 02:21:00',1,1),(24,'timothy','timothy',7777784,'2024-06-10 08:13:24',1,1),(25,'test','test',7777783,'2024-06-10 09:48:10',1,0),(36,'123','123',7777783,'2024-06-10 11:24:31',1,0),(38,'abc','abc',7777783,'2024-06-10 15:28:47',5,0),(39,'my testing grid','my testing grid',7777783,'2024-06-11 04:58:23',1,1),(40,'my testing grid','my testing grid',7777783,'2024-06-11 04:58:23',1,1),(41,'my testing grid','my testing grid',7777783,'2024-06-11 04:58:25',1,1),(42,'my testing grid','my testing grid',7777783,'2024-06-11 04:58:27',1,1),(43,'my test notifications','my test notifications',7777783,'2024-06-11 05:09:12',1,0),(44,'123notifications should go through','notifications should go through',7777783,'2024-06-11 05:09:38',1,0),(46,'Making a Difference in Local Schools','Yesterday, I volunteered at the local elementary school to help with their after-school program. The kids were amazing, and it was fulfilling to see their faces light up when we played educational games together.',7777784,'2024-06-11 05:47:56',2,1),(47,'Beach Clean-Up Success!','Had a great time participating in the community beach clean-up this morning. We collected over 50 bags of trash and made our coastline a little cleaner. Every small action counts!',7777784,'2024-06-11 06:01:45',2,0),(48,'Animal Shelter Love','Spent the day at the animal shelter, feeding and playing with the cats and dogs. It\'s incredible how much these animals just want a bit of love and attention. Consider adopting if you\'re looking for a pet!',7777784,'2024-06-11 06:01:57',2,0),(49,'Teaching Tech to Seniors','Today, I volunteered at a senior center, helping the elderly with basic computer skills. It was heartwarming to see them excited about emailing their grandchildren and browsing the web.\n\n',7777784,'2024-06-11 06:02:10',2,0),(50,'Teaching Tech to Seniors','Today, I volunteered at a senior center, helping the elderly with basic computer skills. It was heartwarming to see them excited about emailing their grandchildren and browsing the web.\n\n',7777784,'2024-06-11 06:02:10',2,0),(51,'Teaching Tech to Seniors','Today, I volunteered at a senior center, helping the elderly with basic computer skills. It was heartwarming to see them excited about emailing their grandchildren and browsing the web.',7777784,'2024-06-11 06:08:02',3,1),(52,'Community Garden Planting','Had an awesome time helping out at the community garden. We planted a variety of vegetables and herbs. Can’t wait to see the fruits (and veggies) of our labor grow!',7777784,'2024-06-11 06:08:15',3,0),(53,'Meal Prep for the Homeless','Volunteered at a local shelter preparing meals for the homeless. It was a humbling experience and a reminder of the importance of giving back.\n\n',7777784,'2024-06-11 06:08:56',3,1),(54,'Library Book Drive','Spent the afternoon organizing a book drive at the library. Collected hundreds of books that will be distributed to underfunded schools. Reading opens so many doors!',7777784,'2024-06-11 06:10:20',3,1),(55,'Fundraising Walkathon','Participated in a walkathon to raise funds for cancer research. It was inspiring to see so many people come together for such a worthy cause.',7777784,'2024-06-11 06:11:53',4,1),(56,'Youth Mentorship Program','Started mentoring a young student through a local nonprofit. It\'s incredibly rewarding to help guide and support the next generation.',7777784,'2024-06-11 06:12:19',4,0),(57,'Soup Kitchen Service','Volunteered at the soup kitchen today. Served meals and chatted with some wonderful people. It’s a small effort that can make a big impact.',7777784,'2024-06-11 06:12:43',4,1),(58,'123','123',7777784,'2024-06-11 07:14:22',19,0);
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('5gecu62jemVPQQDl2iXMgS4pEI2umJLT',1749618579,'{\"cookie\":{\"originalMaxAge\":31536000000,\"expires\":\"2025-06-11T05:08:59.048Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":{\"id\":7777783,\"username\":\"timothy\",\"display_name\":\"timothytew\",\"first_name\":\"timothy\",\"last_name\":\"timothy\",\"email\":\"tewtimothy@gmail.com\",\"isAdmin\":true,\"isLeader\":true,\"account_type\":\"local\"}}}'),('NQaUkCjGa_obw_og8U0Amar3ilyNIFSh',1749627959,'{\"cookie\":{\"originalMaxAge\":31536000000,\"expires\":\"2025-06-11T05:44:03.665Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":{\"id\":7777784,\"username\":\"justin\",\"display_name\":\"justin\",\"first_name\":\"justin\",\"last_name\":\"justin\",\"email\":\"justin\",\"isAdmin\":true,\"isLeader\":true,\"account_type\":\"local\"}}}'),('cFWoxeDiCIbEyzESdH-o-i-9WH7pQLXH',1749562996,'{\"cookie\":{\"originalMaxAge\":31536000000,\"expires\":\"2025-06-10T08:19:50.438Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":{\"id\":7777783,\"username\":\"timothy\",\"display_name\":\"timothytew\",\"first_name\":\"timothy\",\"last_name\":\"timothy\",\"email\":\"tewtimothy@gmail.com\",\"isAdmin\":true,\"isLeader\":true,\"account_type\":\"local\"}}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `display_name` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `account_type` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_UNIQUE` (`id`),
  UNIQUE KEY `display_name_UNIQUE` (`display_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7777809 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (7777783,'timothytew','timothy','timothy','timothy','$2a$10$kaAA0Kv/rzdMsUyjv5Y9MeCXP5LIuhB71lWN8uphdu/MPRvTWQeRq','tewtimothy@gmail.com','local'),(7777784,'justin','justin','justin','justin','$2a$10$VDsrjpSHrlyrWvQuWhgOouw/rPkwU8rqzO/eurABf2fC6hzlizVHi','justin','local'),(7777785,'test1','test1','test1','test1','test1','test1','local'),(7777786,'test2','test2','test2','test2','test2','test2','local'),(7777787,'test3','test3','test3','test3','test3','test3','local'),(7777788,'test4','test4','test4','test4','test4','test4','local'),(7777789,'test5','test5','test5','test5','test5','test5','local'),(7777790,'test6','test6','test6','test6','test6','test6','local'),(7777791,'test7','test7','test7','test7','test7','test7','local'),(7777796,'tim','tim','tim','tim','$2a$10$wpJ9ozAEv2GWlaMHZI2EZe4Xg80aBSfjIHcWYxUI7o5iPQKSV0C2K','tim@tew','local'),(7777798,'Timothy Tew','Timothy','Tew','107368369551404787281','','tewtimothy@gmail.com','google'),(7777802,'mytest','mytest','mytest','mytest','$2a$10$Q/lVaKsjlcieWYaoO6.oHutQ88cfWWJABbameW4hpAIwUKSLacLM2','mytest@mytest','local'),(7777808,'big','WDC_PROJECT','WDC_PROJECT','114034894299196688088','','group82wdcproject@gmail.com','google');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-06-11  8:18:58
