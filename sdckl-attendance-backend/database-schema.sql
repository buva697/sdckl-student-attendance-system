-- MySQL database schema for SDCKL Student Attendance Management System

CREATE DATABASE IF NOT EXISTS sdckl_attendance;
USE sdckl_attendance;

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    remarks TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    attendance_status ENUM('Present', 'Late', 'Absent') NOT NULL DEFAULT 'Absent',
    remarks TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (student_id, attendance_date)
);

-- Biometric scan logs table
CREATE TABLE IF NOT EXISTS biometric_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    scan_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('success', 'failure') NOT NULL,
    CONSTRAINT fk_biometric_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_biometric_scan_timestamp ON biometric_logs(scan_timestamp);
