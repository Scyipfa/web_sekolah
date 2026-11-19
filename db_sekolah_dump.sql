-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: db_sekolah
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tbl_guru`
--

DROP TABLE IF EXISTS `tbl_guru`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_guru` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nip` varchar(30) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `alamat` varchar(128) NOT NULL,
  `telepon` varchar(20) NOT NULL,
  `agama` varchar(20) NOT NULL,
  `foto` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_guru`
--

LOCK TABLES `tbl_guru` WRITE;
/*!40000 ALTER TABLE `tbl_guru` DISABLE KEYS */;
INSERT INTO `tbl_guru` VALUES (1,'198708282014022004','Fitria Annisya','Jl. Jati','0831****','Islam','');
INSERT INTO `tbl_guru` VALUES (2,'-','Yenny Astion Rompas','Jl. Casadova','0853*****','Kristen','');
INSERT INTO `tbl_guru` VALUES (3,'199602122024212011','Rizky Ananda Indriani','Jl. Mahir Mahar','0815******','Islam','');
/*!40000 ALTER TABLE `tbl_guru` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_jurusan`
--

DROP TABLE IF EXISTS `tbl_jurusan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_jurusan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jurusan` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `jurusan` (`jurusan`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_jurusan`
--

LOCK TABLES `tbl_jurusan` WRITE;
/*!40000 ALTER TABLE `tbl_jurusan` DISABLE KEYS */;
INSERT INTO `tbl_jurusan` VALUES (2,'RPL 1');
INSERT INTO `tbl_jurusan` VALUES (1,'RPL 2');
/*!40000 ALTER TABLE `tbl_jurusan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_nilai_ujian`
--

DROP TABLE IF EXISTS `tbl_nilai_ujian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_nilai_ujian` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `no_ujian` char(7) NOT NULL,
  `pelajaran` varchar(100) NOT NULL,
  `nilai_ujian` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_nilai_ujian`
--

LOCK TABLES `tbl_nilai_ujian` WRITE;
/*!40000 ALTER TABLE `tbl_nilai_ujian` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_nilai_ujian` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_pelajaran`
--

DROP TABLE IF EXISTS `tbl_pelajaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_pelajaran` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pelajaran` varchar(50) NOT NULL,
  `jurusan` varchar(50) NOT NULL,
  `guru` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_pelajaran`
--

LOCK TABLES `tbl_pelajaran` WRITE;
/*!40000 ALTER TABLE `tbl_pelajaran` DISABLE KEYS */;
INSERT INTO `tbl_pelajaran` VALUES (1,'KIK','RPL 2','Fitria Annisya');
INSERT INTO `tbl_pelajaran` VALUES (2,'MPKK/PBO','RPL 2','Yenny Astion Rompas');
INSERT INTO `tbl_pelajaran` VALUES (3,'MPKK/WEB','RPL 2','Rizky Ananda Indriani');
/*!40000 ALTER TABLE `tbl_pelajaran` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_sekolah`
--

DROP TABLE IF EXISTS `tbl_sekolah`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_sekolah` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(128) NOT NULL,
  `alamat` varchar(128) NOT NULL,
  `akreditasi` char(1) NOT NULL,
  `status` varchar(10) NOT NULL,
  `email` varchar(100) NOT NULL,
  `visimisi` text NOT NULL,
  `gambar` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_sekolah`
--

LOCK TABLES `tbl_sekolah` WRITE;
/*!40000 ALTER TABLE `tbl_sekolah` DISABLE KEYS */;
INSERT INTO `tbl_sekolah` VALUES (1,'SMK Negeri 1 Palangka Raya','JL. Tambun Bungai, No.77','B','Negeri','smkn.1palangkaraya@yahoo.co.id','Visi: Terciptanya iklim kerja yang kondusif, agar seluruh warga sekolah merasa memiliki sekolah serta menyiapkan kelulusan yang berkualitas unggul yang dibutuhkan masyarakat/dunia kerja dan atau mandiri melalui pola pendidikan dan pelatihan sistem ganda.\r\nMisi:  berfokus pada penguatan pendidikan karakter untuk mencetak lulusan yang berakhlak mulia, profesional, dan berwawasan global (SILU BELIA PROBAL). Selain itu, sekolah berupaya menyiapkan tenaga ahli teknik tingkat menengah yang kreatif, inovatif, dan bertakwa kepada Tuhan Yang Maha Esa melalui optimalisasi Pendidikan Sistem Ganda (PSG) agar lulusan siap bersaing di dunia kerja maupun berwirausaha secara mandiri','6af81d027069e.png');
/*!40000 ALTER TABLE `tbl_sekolah` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_siswa`
--

DROP TABLE IF EXISTS `tbl_siswa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_siswa` (
  `nis` char(6) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `alamat` varchar(128) NOT NULL,
  `kelas` varchar(3) NOT NULL,
  `jurusan` varchar(50) NOT NULL,
  `foto` varchar(50) NOT NULL,
  PRIMARY KEY (`nis`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_siswa`
--

LOCK TABLES `tbl_siswa` WRITE;
/*!40000 ALTER TABLE `tbl_siswa` DISABLE KEYS */;
INSERT INTO `tbl_siswa` VALUES ('17364','Ahmad Zain Athhaillah','Jl. Tangkiling','XII','RPL 2','');
INSERT INTO `tbl_siswa` VALUES ('17366','Aisya Norsafila','Jl. Haka 4, No.128','XII','RPL 2','');
INSERT INTO `tbl_siswa` VALUES ('17394','Aqueenza Dinda Pramesty','Jl. Kecipir','XII','RPL 2','');
INSERT INTO `tbl_siswa` VALUES ('17398','Arivay','Garuda','XII','RPL 2','');
INSERT INTO `tbl_siswa` VALUES ('17402','Asma Asy-Syifa N.S','Jl. Danau Ilung','XII','RPL 2','');
/*!40000 ALTER TABLE `tbl_siswa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_ujian`
--

DROP TABLE IF EXISTS `tbl_ujian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_ujian` (
  `no_ujian` char(7) NOT NULL,
  `tgl_ujian` date NOT NULL,
  `nis` char(6) NOT NULL,
  `jurusan` varchar(50) NOT NULL,
  `total_nilai` int(11) NOT NULL,
  `nilai_terendah` int(11) NOT NULL,
  `nilai_tertinggi` int(11) NOT NULL,
  `nilai_rata2` int(11) NOT NULL,
  `hasil_ujian` varchar(10) NOT NULL,
  PRIMARY KEY (`no_ujian`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_ujian`
--

LOCK TABLES `tbl_ujian` WRITE;
/*!40000 ALTER TABLE `tbl_ujian` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_ujian` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_user`
--

DROP TABLE IF EXISTS `tbl_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(256) NOT NULL,
  `nama` varchar(128) NOT NULL,
  `alamat` varchar(128) NOT NULL,
  `jabatan` varchar(128) NOT NULL,
  `foto` varchar(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_user`
--

LOCK TABLES `tbl_user` WRITE;
/*!40000 ALTER TABLE `tbl_user` DISABLE KEYS */;
INSERT INTO `tbl_user` VALUES (1,'smknegeri1pky','$2y$10$N2KZSq4NqmUUBxuc/JxweucTQzjkdQI.OaqRntZHw1w2.yb7n.GbO','SMK Negeri 1 Palangka Raya','Jl. Tambun Bungai, No.77','Administrator','6af8055717def.png');
/*!40000 ALTER TABLE `tbl_user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-19 16:01:14
