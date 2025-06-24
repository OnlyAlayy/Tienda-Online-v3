-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-06-2025 a las 03:08:43
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `viajesbd`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contactos`
--

CREATE TABLE `contactos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `contactos`
--

INSERT INTO `contactos` (`id`, `nombre`, `email`, `mensaje`, `fecha`) VALUES
(1, 'cmam ca', 'mascorisc3@gmail.com', 'fsafsf', '2025-06-22 16:47:58');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fechas_disponibles`
--

CREATE TABLE `fechas_disponibles` (
  `id` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `fecha` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `fechas_disponibles`
--

INSERT INTO `fechas_disponibles` (`id`, `id_producto`, `fecha`) VALUES
(1, 1, '2025-07-15'),
(2, 1, '2025-08-01'),
(3, 1, '2025-09-10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fechas_vuelta`
--

CREATE TABLE `fechas_vuelta` (
  `id` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `fecha` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `fechas_vuelta`
--

INSERT INTO `fechas_vuelta` (`id`, `id_producto`, `fecha`) VALUES
(1, 1, '2025-08-15'),
(2, 1, '2025-08-20'),
(3, 1, '2025-08-25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL,
  `producto` varchar(200) NOT NULL,
  `precio` decimal(10,0) NOT NULL,
  `descripcion` varchar(300) NOT NULL,
  `imagen` varchar(100) NOT NULL,
  `clase` enum('vip','normal') DEFAULT 'normal',
  `asientos_totales` int(11) DEFAULT 40
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `producto`, `precio`, `descripcion`, `imagen`, `clase`, `asientos_totales`) VALUES
(1, 'Paquete a Cataratas del Iguazú', 450, 'Incluye 3 noches de alojamiento, excursiones guiadas y traslados desde el aeropuerto.', 'iguazo.webp', 'normal', 40),
(2, 'Vacaciones en Punta Cana', 980, '7 días en resort all-inclusive con vuelos ida y vuelta. Experiencia caribeña premium.', 'puntacana.webp', 'normal', 40),
(3, 'Escapada a San Carlos de Bariloche', 520, 'Paquete de 4 días con actividades de montaña, chocolate tour y alojamiento con desayuno.', 'sancarlosbariloche.webp', 'normal', 40),
(5, 'Búzios Paradise', 950, 'Paquete completo: vuelo + 5 noches con desayuno en posada frente al mar. Ideal para relajarse y disfrutar de playas cristalinas.', 'buzios.webp', 'normal', 40),
(6, 'Cancún Escapada', 1390, 'Hotel 4★ all inclusive + vuelos ida y vuelta. Incluye excursión a Chichén Itzá y día en parque acuático.', 'cancun.webp', 'normal', 40),
(7, 'Mendoza', 770, 'Escapada gourmet: vuelo + 4 noches con visitas guiadas a bodegas y degustaciones premium en Luján de Cuyo.', 'mendoza.webp', 'normal', 40);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `clase` enum('normal','vip') NOT NULL,
  `asiento` int(11) NOT NULL,
  `fecha_ida` date NOT NULL,
  `fecha_vuelta` date NOT NULL,
  `fecha_reserva` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `foto_perfil` varchar(255) DEFAULT 'defaultprofile.png',
  `rol` enum('admin','cliente') DEFAULT 'cliente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `username`, `password`, `foto_perfil`, `rol`) VALUES
(1, 'Alay', '$2b$10$9FJINR58/DH3uS40ucNNd.Bct6GzTokn7JShn5KrhtgJ3m4zkeuoS', 'defaultprofile.png', 'cliente'),
(2, 'juli', '$2b$10$d0M7IecyZcD7aAC2AS9Qru3k5L1qVo./X.72bQKpuTi7JL8R9LnQ.', 'default1.png', 'cliente'),
(3, 'joaco', '$2b$10$eZ68tkZk/ppSZs4RG/7OfOiinDlHbTog2BWhA6/s2tt1FdkR5z1BS', 'default2.png', 'cliente'),
(4, 'Juli2', '$2b$10$CGAqLd.0a0RzlWxyipJr7ORPWDdtQ740FtpNBKQh6dko23cEwqOje', 'default3.png', 'cliente'),
(5, 'admin', '$2b$10$/Qwg5tlZ5uZaNGffomq8c.rnyeWgLB5EeKV62bsZ78olpb5esN2Y6', 'default1.png', 'admin');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `contactos`
--
ALTER TABLE `contactos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `fechas_disponibles`
--
ALTER TABLE `fechas_disponibles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `fechas_vuelta`
--
ALTER TABLE `fechas_vuelta`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`);

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reserva_unica` (`id_producto`,`fecha_ida`,`asiento`,`clase`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `contactos`
--
ALTER TABLE `contactos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `fechas_disponibles`
--
ALTER TABLE `fechas_disponibles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `fechas_vuelta`
--
ALTER TABLE `fechas_vuelta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `fechas_disponibles`
--
ALTER TABLE `fechas_disponibles`
  ADD CONSTRAINT `fechas_disponibles_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
