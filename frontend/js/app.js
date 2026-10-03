// Expense Tracker - frontend logic

// PHASE 2
// Your backend from Phase 1 is already running, with real expenses in the
// database (from schema.sql). Build this page directly against it with
// fetch and async/await - there is no in-memory or localStorage stage
// this time, and no sample data file.
//
// A possible structure (change it if you have a better idea):
//   - async function getExpenses()          fetch(API_URL), return the JSON
//   - async function addExpense(data)       fetch(API_URL, { method: "POST", ... })
//   - async function updateExpense(id,data) fetch(API_URL + "/" + id, { method: "PUT", ... })
//   - async function deleteExpense(id)      fetch(API_URL + "/" + id, { method: "DELETE" })
//   - async function refresh()              get the list, then call renderTable and renderSummary
//   - renderTable(list)                     build the table rows from the array the API returned
//   - renderSummary(list)                   update the summary cards
//   - applyFilter()                         re-render with the list filtered by category
//
// Don't forget:
//   - Show a Bootstrap spinner while a request is in flight.
//   - Wrap every fetch call in try/catch, and show a Bootstrap alert on failure.
//   - After add, edit, or delete, call refresh() so the page always shows
//     what the server actually saved - never update the table by hand.
//   - The API is at http://localhost:3000/api/expenses (see the Roadmap).

const API_URL = "http://localhost:3000/api/expenses";

/**
 * Fetch all expenses from the backend API.
 */
async function getExpenses() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch expenses");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching expenses:", error);
    showAlert("Could not load expenses. Check that the backend is running.", "danger");
    return null;
  }
}

// Add-Expense

async function addExpense(data) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to add expense");
    }

    return result;
  } catch (error) {
    showAlert(error.message || "Could not add expense.", "danger");
    return null;
  }
}


// Delete-Expense

async function deleteExpense(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to delete expense");
    }

    return result;
  } catch (error) {
    showAlert(error.message || "Could not delete expense.", "danger");
    return null;
  }
}


// Update-Expense

async function updateExpense(id, data) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update expense");
    }

    return result;
  } catch (error) {
    showAlert(error.message || "Could not update expense.", "danger");
    return null;
  }
}



/**
 * Display expenses inside the HTML table.
 */
function renderTable(expenses) {
  const tableBody = document.getElementById("expensesTableBody");

  tableBody.innerHTML = "";

  expenses.forEach((expense) => {
    const row = document.createElement("tr");

    const titleCell = document.createElement("td");
    titleCell.textContent = expense.title;

    const amountCell = document.createElement("td");
    amountCell.textContent = `$${Number(expense.amount).toFixed(2)}`;

    const categoryCell = document.createElement("td");
    categoryCell.textContent = expense.category;

    const dateCell = document.createElement("td");
    dateCell.textContent = expense.date;

    
const actionsCell = document.createElement("td");
actionsCell.className = "text-nowrap";

const actionsWrapper = document.createElement("div");
actionsWrapper.className = "d-flex flex-nowrap gap-1";

const editButton = document.createElement("button");
editButton.type = "button";
editButton.className = "btn btn-warning btn-sm";
editButton.textContent = "Edit";

editButton.addEventListener("click", () => {
  document.getElementById("expenseId").value = expense.id;
  document.getElementById("title").value = expense.title;
  document.getElementById("amount").value = expense.amount;
  document.getElementById("category").value = expense.category;
  document.getElementById("date").value = expense.date;

  document.getElementById("formTitle").textContent = "Edit Expense";
  document.getElementById("submitBtn").textContent = "Update Expense";

  document.getElementById("cancelEditBtn").classList.remove("d-none");

  document.getElementById("expenseForm").scrollIntoView({
    behavior: "smooth"
  });
});



const deleteButton = document.createElement("button");
deleteButton.type = "button";
deleteButton.className = "btn btn-danger btn-sm";
deleteButton.textContent = "Delete";

deleteButton.addEventListener("click", async () => {
  const confirmed = confirm(
    `Are you sure you want to delete "${expense.title}"?`
  );

  if (!confirmed) {
    return;
  }

  const result = await deleteExpense(expense.id);

  if (result === null) {
    return;
  }

  showAlert("Expense deleted successfully!", "success");
  await refresh();
});

    actionsWrapper.append(editButton, deleteButton);
    actionsCell.appendChild(actionsWrapper);

    row.append(
      titleCell,
      amountCell,
      categoryCell,
      dateCell,
      actionsCell
    );

    tableBody.appendChild(row);
  });
}

// render Summary

function renderSummary(expenses) {
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const expenseCount = expenses.length;

  const highestExpense = expenses.reduce(
    (highest, expense) =>
      Math.max(highest, Number(expense.amount)),
    0
  );

  document.getElementById("totalAmount").textContent =
    `$${totalAmount.toFixed(2)}`;

  document.getElementById("expenseCount").textContent =
    expenseCount;

  document.getElementById("highestExpense").textContent =
    `$${highestExpense.toFixed(2)}`;
}


/**
 * Display a Bootstrap alert.
 */
function showAlert(message, type) {
  const alertContainer = document.getElementById("alertContainer");

  alertContainer.innerHTML = "";

  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.setAttribute("role", "alert");
  alert.textContent = message;

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "btn-close";
  closeButton.setAttribute("data-bs-dismiss", "alert");
  closeButton.setAttribute("aria-label", "Close");

  alert.appendChild(closeButton);
  alertContainer.appendChild(alert);
}

// Loading Spinner

function setLoading(isLoading) {
  document
    .getElementById("loadingSpinner")
    .classList.toggle("d-none", !isLoading);
}


/**
 * Load expenses and render the table.
 */



async function refresh() {
  setLoading(true);

  try {
    const expenses = await getExpenses();

    if (expenses === null) {
      return;
    }

    allExpenses = expenses;
    applyFilter();
  } finally {
    setLoading(false);
  }
}




// Load expenses when the page opens.
document.addEventListener("DOMContentLoaded", refresh);

// Apply Filter

let allExpenses = [];

function applyFilter() {
  const selectedCategory =
    document.getElementById("categoryFilter").value;

  const filteredExpenses =
    selectedCategory === "All"
      ? allExpenses
      : allExpenses.filter(
          (expense) => expense.category === selectedCategory
        );

  renderTable(filteredExpenses);
  renderSummary(filteredExpenses);
}

document
  .getElementById("categoryFilter")
  .addEventListener("change", applyFilter);


  

document
  .getElementById("expenseForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const id = document.getElementById("expenseId").value;

    const data = {
      title: document.getElementById("title").value.trim(),
      amount: Number(document.getElementById("amount").value),
      category: document.getElementById("category").value,
      date: document.getElementById("date").value
    };

    let result;

    if (id) {
      result = await updateExpense(id, data);
    } else {
      result = await addExpense(data);
    }

    if (result === null) {
      return;
    }

    resetExpenseForm();

    showAlert(
      id
        ? "Expense updated successfully!"
        : "Expense added successfully!",
      "success"
    );

    await refresh();
  });

  
function resetExpenseForm() {
  document.getElementById("expenseForm").reset();
  document.getElementById("expenseId").value = "";

  document.getElementById("formTitle").textContent = "Add Expense";
  document.getElementById("submitBtn").textContent = "Add Expense";

  document.getElementById("cancelEditBtn").classList.add("d-none");
}

document
  .getElementById("cancelEditBtn")
  .addEventListener("click", resetExpenseForm);

