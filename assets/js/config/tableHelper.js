class TableHelper {
    constructor(tableId, headers = [], data = []) {
      this.tableId = tableId; // ID tabel
      this.headers = headers; // Array header tabel
      this.data = data; // Array data
      this.currentId = this.data.length + 1; // Auto-increment ID
      this.tableElement = document.getElementById(tableId);
  
      if (!this.tableElement) {
        console.error(`Table with ID '${tableId}' not found!`);
        return;
      }
  
      this.init();
    }
  
    // Initialize table
    init() {
      this.renderHeader();
      this.renderTable();
    }
  
    // Render Header
    renderHeader() {
      const thead = this.tableElement.querySelector('thead');
      if (!thead) {
        console.error('No <thead> element found in table.');
        return;
      }
  
      const headerRow = document.createElement('tr');
      this.headers.forEach((header) => {
        const th = document.createElement('th');
        th.textContent = header.label; // Header label
        headerRow.appendChild(th);
      });
  
      const actionTh = document.createElement('th');
      actionTh.textContent = 'Actions';
      headerRow.appendChild(actionTh);
  
      thead.innerHTML = ''; // Bersihkan <thead>
      thead.appendChild(headerRow);
    }
  
    // Render Table Rows
    renderTable() {
      const tbody = this.tableElement.querySelector('tbody');
      if (!tbody) {
        console.error('No <tbody> element found in table.');
        return;
      }
  
      tbody.innerHTML = ''; // Bersihkan tbody
  
      this.data.forEach((row, index) => {
        const tr = document.createElement('tr');
  
        this.headers.forEach((header) => {
          const td = document.createElement('td');
          td.textContent = row[header.key] || '-'; // Isi data sesuai key
          tr.appendChild(td);
        });
  
        // Add Actions (Delete button)
        const actionTd = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('btn', 'btn-sm', 'btn-danger');
        deleteBtn.addEventListener('click', () => this.deleteRow(index));
        actionTd.appendChild(deleteBtn);
        tr.appendChild(actionTd);
  
        tbody.appendChild(tr);
      });
    }
  
    // Add new row to the table
    addRow(rowData) {
      const newRow = { id: this.currentId++, ...rowData };
      this.data.push(newRow);
      this.renderTable();
    }
  
    // Delete row from the table
    deleteRow(index) {
      this.data.splice(index, 1);
      this.renderTable();
    }
  }
  
  // Usage example when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Headers (label and key)
    const headers = [
      { label: 'ID', key: 'id' },
      { label: 'Name', key: 'name' },
      { label: 'Email', key: 'email' },
      { label: 'Date', key: 'date' },
      { label: 'Salary', key: 'salary' }
    ];
  
    // Sample Data
    const initialData = [
      { id: 1, name: 'John Doe', email: 'john@example.com', date: '2023-12-12', salary: '5000' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', date: '2023-11-11', salary: '6000' }
    ];
  
    // Initialize Table
    const tableHelper = new TableHelper('dynamic-table', headers, initialData);
  
    // Handle form submission for adding a new record
    document.getElementById('form-add-new-record').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('basicFullname').value.trim();
      const email = document.getElementById('basicEmail').value.trim();
      const date = document.getElementById('basicDate').value.trim();
      const salary = document.getElementById('basicSalary').value.trim();
  
      if (!name || !email || !date || !salary) {
        alert('All fields are required!');
        return;
      }
  
      tableHelper.addRow({ name, email, date, salary });
      document.getElementById('form-add-new-record').reset();
      document.querySelector('.btn-close').click();
    });
  });
  