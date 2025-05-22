document.addEventListener('DOMContentLoaded', () => {
  const students = [
    { id: 'S001', name: 'Alice Johnson' },
    { id: 'S002', name: 'Bob Smith' },
    { id: 'S003', name: 'Charlie Brown' },
    { id: 'S004', name: 'Diana Prince' },
    { id: 'S005', name: 'Ethan Hunt' }
  ];

  const tableBody = document.getElementById('student-table-body');
  const saveBtn = document.getElementById('save-btn');
  const clearBtn = document.getElementById('clear-btn');
  const messageEl = document.getElementById('message');

  // Load attendance data from localStorage or initialize empty
  let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || {};

  function renderTable() {
    tableBody.innerHTML = '';
    students.forEach(student => {
      const attendance = attendanceData[student.id]?.attendance || 'absent';
      const remarks = attendanceData[student.id]?.remarks || '';

      const tr = document.createElement('tr');
      tr.classList.add('bg-red-700', 'hover:bg-red-600');

      tr.innerHTML = `
        <td class="px-4 py-2">${student.id}</td>
        <td class="px-4 py-2">${student.name}</td>
        <td class="px-4 py-2">
          <label class="inline-flex items-center space-x-2">
            <input type="radio" name="attendance-${student.id}" value="present" ${attendance === 'present' ? 'checked' : ''} />
            <span>Present</span>
          </label>
          <label class="inline-flex items-center space-x-2 ml-4">
            <input type="radio" name="attendance-${student.id}" value="absent" ${attendance === 'absent' ? 'checked' : ''} />
            <span>Absent</span>
          </label>
        </td>
        <td class="px-4 py-2">
          <input type="text" maxlength="200" placeholder="Remarks" class="w-full rounded px-2 py-1 text-black" value="${remarks}" name="remarks-${student.id}" />
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function saveAttendance() {
    let valid = true;
    students.forEach(student => {
      const attendanceRadios = document.getElementsByName(`attendance-${student.id}`);
      const remarksInput = document.querySelector(`input[name="remarks-${student.id}"]`);
      let attendanceValue = null;
      attendanceRadios.forEach(radio => {
        if (radio.checked) attendanceValue = radio.value;
      });
      if (!attendanceValue) {
        valid = false;
      }
      if (remarksInput.value.length > 200) {
        valid = false;
      }
      attendanceData[student.id] = {
        attendance: attendanceValue,
        remarks: remarksInput.value.trim()
      };
    });
    if (!valid) {
      messageEl.textContent = 'Please ensure all attendance statuses are selected and remarks are within 200 characters.';
      messageEl.classList.add('text-yellow-300');
      return;
    }
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    messageEl.textContent = 'Attendance saved successfully!';
    messageEl.classList.remove('text-yellow-300');
    messageEl.classList.add('text-green-300');
  }

  function clearAttendance() {
    attendanceData = {};
    localStorage.removeItem('attendanceData');
    renderTable();
    messageEl.textContent = 'Attendance cleared.';
    messageEl.classList.remove('text-green-300');
    messageEl.classList.add('text-yellow-300');
  }

  saveBtn.addEventListener('click', saveAttendance);
  clearBtn.addEventListener('click', clearAttendance);

  renderTable();
});
