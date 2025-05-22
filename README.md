
Built by https://www.blackbox.ai

---

# SDCKL Student Attendance Management System

## Project Overview
The SDCKL Student Attendance Management System is a web-based application designed for managing student attendance in a simple and efficient manner. The system allows educators to record attendance for each student, add remarks, and save or clear the data easily.

## Installation
To set up the SDCKL Student Attendance Management System on your local machine, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd sdckl-student-attendance-management-system
   ```

2. **Open the `index.html` file**:
   Open `index.html` in your preferred web browser (e.g. Chrome, Firefox).

## Usage
Upon loading the application, a table of students will be displayed with options to mark their attendance as either "Present" or "Absent." Educators can also add remarks for each student. 

- **To save attendance**: Click the "Save Attendance" button. 
- **To clear all attendance data**: Click the "Clear" button.

Attendance data is stored in the browser's local storage, ensuring that it persists even after the page is reloaded until cleared.

## Features
- User-friendly interface for marking attendance.
- Dynamic rendering of student data from a predefined list.
- Ability to save attendance and remarks in local storage.
- Clear attendance functionality to reset the data.
- Validation to ensure all attendance statuses are selected and remarks are within character limits.

## Dependencies
This project uses the following libraries and frameworks, which are referenced in the `index.html` file:

- **Tailwind CSS** for styling
- **Font Awesome** for icons
- Google Fonts for typography

No additional package dependencies are defined in a `package.json` file since this project does not utilize Node.js or JavaScript libraries that require installation.

## Project Structure
The project structure is simple and consists of the following files:

```
sdckl-student-attendance-management-system/
├── index.html    # Main HTML page
└── script.js     # JavaScript for dynamic behavior and functionality
```

### - `index.html`
This file contains the structure of the web application, including styles and scripts.

### - `script.js`
This file handles the dynamic interaction within the application, such as rendering the attendance table, saving attendance data, and clearing attendance.

Feel free to enhance the project, add features, or customize it for your needs!