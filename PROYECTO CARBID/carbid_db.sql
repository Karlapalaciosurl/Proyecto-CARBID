-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: carbid_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_vehiculo` int DEFAULT NULL,
  `mensaje` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `tipo` tinyint DEFAULT '0',
  `lectura` tinyint(1) NOT NULL DEFAULT '0',
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notif_usuario` (`id_usuario`),
  KEY `fk_notif_vehiculo` (`id_vehiculo`),
  CONSTRAINT `fk_notif_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notif_vehiculo` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pujas`
--

DROP TABLE IF EXISTS `pujas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pujas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_vehiculo` int NOT NULL,
  `id_usuario` int DEFAULT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_puja` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_vehiculo` (`id_vehiculo`),
  CONSTRAINT `pujas_ibfk_1` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pujas`
--

LOCK TABLES `pujas` WRITE;
/*!40000 ALTER TABLE `pujas` DISABLE KEYS */;
/*!40000 ALTER TABLE `pujas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resultados_subasta`
--

DROP TABLE IF EXISTS `resultados_subasta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resultados_subasta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_vehiculo` int NOT NULL,
  `id_usuario` int NOT NULL,
  `monto_final` decimal(10,2) NOT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_vehiculo` (`id_vehiculo`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `resultados_subasta_ibfk_1` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `resultados_subasta_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resultados_subasta`
--

LOCK TABLES `resultados_subasta` WRITE;
/*!40000 ALTER TABLE `resultados_subasta` DISABLE KEYS */;
/*!40000 ALTER TABLE `resultados_subasta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `usuario` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `correo` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP,
  `email_verificado` tinyint(1) NOT NULL DEFAULT '0',
  `codigo_verificacion` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (2,'Karla','Escobar',NULL,'karla2@carbid.com','$2b$10$tx78zain6xQNEvJy3lJKde9KajeUdQ8McJIUtnOlu4gk5YunQNHN6','55555555','2025-11-02 03:34:36',0,NULL),(16,'Karla ','Palacios','karlipalacios','karlaa.trab@gmail.com','$2b$10$6eQFgFp3vD.G88ZOn0mgqu98n7QBOBP5YEgnSI2dSOmPKRlEyoocC',NULL,'2025-11-07 19:19:47',1,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehiculos`
--

DROP TABLE IF EXISTS `vehiculos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehiculos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `marca` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `modelo` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `color` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `anio` int DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `precio_base` decimal(10,2) DEFAULT NULL,
  `precio_actual` decimal(10,2) DEFAULT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  `estado` tinyint NOT NULL DEFAULT '1' COMMENT '1=PENDIENTE, 2=ACTIVA, 3=FINALIZADA SIN CONFIRMAR, 4=RECHAZADA, 5=CON ÉXITO',
  `notificado_confirmacion` tinyint(1) DEFAULT '0',
  `imagenes` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_vehiculo_usuario` (`id_usuario`),
  CONSTRAINT `fk_vehiculo_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehiculos`
--

LOCK TABLES `vehiculos` WRITE;
/*!40000 ALTER TABLE `vehiculos` DISABLE KEYS */;
INSERT INTO `vehiculos` VALUES (2,2,'Porsche','Cayman ','Negro',2020,'Arranca, contiene llave del vehículo, pequeño golpe delantero, solo danos estéticos',150000.00,NULL,'2025-11-05 03:40:00','2025-11-07 22:23:00',6,1,'[\"1762335444704.jpeg\",\"1762335444704.jpeg\",\"1762335444704.avif\",\"1762335444705.jpg\",\"1762335444707.jpg\",\"1762335444707.jpg\",\"1762335444707.jpeg\",\"1762335444707.jpeg\",\"1762335444708.jpeg\",\"1762335444708.jpg\"]','2025-11-05 09:37:24'),(3,2,'Ford','Bronco','Gris',2020,'No arranca, no contiene llave del vehiculo, danos altos ',85000.00,NULL,'2025-11-05 03:40:00','2025-11-07 22:23:00',3,0,'[\"1762335517310.jpeg\",\"1762335517310.jpeg\",\"1762335517310.jpg\",\"1762335517312.jpeg\",\"1762335517312.jpeg\"]','2025-11-05 09:38:37'),(4,2,'BMW','X3','Blanco',2021,'Se contiene la lllave del vehiculo, buen estado, pequeno golpe atras, arranca ',12000.00,NULL,'2025-11-05 03:40:00','2025-11-07 22:23:00',3,0,'[\"1762335574469.webp\",\"1762335574469.jpeg\",\"1762335574469.jpg\"]','2025-11-05 09:39:34'),(5,2,'BMW ','X7','Azul',2023,'Buen estado, arranca, no camina, no tiene desperfectos mas que el motor',200000.00,NULL,'2025-11-05 03:55:00','2025-11-07 22:23:00',3,0,'[\"1762335669630.jpeg\",\"1762335669630.jpeg\"]','2025-11-05 09:41:09'),(6,2,'Toyota','Land Cruiser','Celeste',2025,'Dañado de adelante y atras, no contiene llave, no arranca',150000.00,NULL,'2025-11-05 03:54:00','2025-11-07 22:23:00',3,0,'[\"1762335738067.jpeg\",\"1762335738067.jpeg\",\"1762335738067.jpg\"]','2025-11-05 09:42:18'),(7,2,'Mercedes','EQA','blanca',2022,'venta ya solo para repuestos',40000.00,NULL,'2025-11-05 03:59:00','2025-11-07 22:23:00',3,0,'[\"1762335792801.jpeg\",\"1762335792801.jpeg\",\"1762335792801.jpeg\"]','2025-11-05 09:43:12');
/*!40000 ALTER TABLE `vehiculos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-08  1:49:08
