import { useState, useEffect } from "react";
import API from "../Services/api";

// ---------------------------
// Types
// ---------------------------
interface Employee {
  employee_id: string;
  full_name: string;
  role: string;
  email: string;
  phone: string;
  is_active: boolean;
  must_change_password: boolean;
}

interface NewEmployee {
  full_name: string;
  role: string;
  email: string;
  phone: string;
  password: string;
}

const HRDashboard = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [newEmployee, setNewEmployee] = useState<NewEmployee>({
    full_name: "",
    role: "",
    email: "",
    phone: "",
    password: "",
  });

  // ---------------------------
  // Fetch all employees on page load
  // ---------------------------
  useEffect(() => {
    fetchEmployees();
  }, []);

 const fetchEmployees = async () => {
  try {
    const response = await API.get("/auth/employees/");
    // Make sure we always set an array
    const data = Array.isArray(response.data) ? response.data : [];
    setEmployees(data);
  } catch (err) {
    setError("Failed to load employees");
  }
};
  // ---------------------------
  // Create new employee
  // ---------------------------
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await API.post("/auth/employees/", newEmployee);
      setSuccess(
        `Employee created! ID: ${response.data.employee_id} — share this with the employee`
      );
      setNewEmployee({
        full_name: "",
        role: "",
        email: "",
        phone: "",
        password: "",
      });
      setShowForm(false);
      fetchEmployees();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Deactivate employee
  // ---------------------------
  const handleDeactivate = async (employee_id: string) => {
    if (!confirm("Are you sure you want to deactivate this employee?")) return;
    try {
      await API.patch(`/auth/employees/${employee_id}/`, {
        is_active: false,
      });
      setSuccess("Employee deactivated successfully");
      fetchEmployees();
    } catch (err) {
      setError("Failed to deactivate employee");
    }
  };

  // ---------------------------
  // Reset password
  // ---------------------------
  const handleResetPassword = async (employee_id: string) => {
    const newPassword = prompt("Enter new default password for this employee:");
    if (!newPassword) return;
    try {
      await API.patch(`/auth/employees/${employee_id}/`, {
        reset_password: newPassword,
      });
      setSuccess(`Password reset successfully for ${employee_id}`);
      fetchEmployees();
    } catch (err) {
      setError("Failed to reset password");
    }
  };

  // ---------------------------
  // Role badge color
  // ---------------------------
  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      hr: "#8b5cf6",
      area_manager: "#3b82f6",
      cafe_manager: "#f59e0b",
      team_member: "#10b981",
      warehouse: "#6366f1",
    };
    return colors[role] || "#888";
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>HR Dashboard</h2>
        <button style={styles.addButton} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Employee"}
        </button>
      </div>

      {/* Success / Error messages */}
      {success && <div style={styles.success}>{success}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {/* Create Employee Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Create New Employee</h3>
          <form onSubmit={handleCreateEmployee}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Full name"
                  value={newEmployee.full_name}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, full_name: e.target.value })
                  }
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Role</label>
              <select
  style={styles.input}
  value={newEmployee.role}
  onChange={(e) =>
    setNewEmployee({ ...newEmployee, role: e.target.value })
  }
  required
>
  <option value="">Select role</option>
  {/* The 'value' must be exactly as written below */}
  <option value="hr">HR</option>
  <option value="area_manager">Area Manager</option>
  <option value="cafe_manager">Cafe Manager</option>
  <option value="team_member">Team Member</option>
  <option value="warehouse">Warehouse</option>
</select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input
                  style={styles.input}
                  type="email"
                  placeholder="Email address"
                  value={newEmployee.email}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, email: e.target.value })
                  }
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Phone</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Phone number"
                  value={newEmployee.phone}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Default Password</label>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Set default password"
                  value={newEmployee.password}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, password: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <button
              style={loading ? styles.buttonDisabled : styles.button}
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Employee"}
            </button>
          </form>
        </div>
      )}

      {/* Employee Table */}
      <div style={styles.tableCard}>
        <h3 style={styles.formTitle}>All Employees ({employees.length})</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Employee ID</th>
                <th style={styles.th}>Full Name</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.employee_id} style={styles.tableRow}>
                  <td style={styles.td}>{emp.employee_id}</td>
                  <td style={styles.td}>{emp.full_name}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor: getRoleColor(emp.role),
                      }}
                    >
                      {emp.role?.replace("_", " ")}
                    </span>
                  </td>
                  <td style={styles.td}>{emp.email}</td>
                  <td style={styles.td}>{emp.phone}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor: emp.is_active ? "#10b981" : "#ef4444",
                      }}
                    >
                      {emp.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.resetBtn}
                      onClick={() => handleResetPassword(emp.employee_id)}
                    >
                      Reset Password
                    </button>
                    {emp.is_active && (
                      <button
                        style={styles.deactivateBtn}
                        onClick={() => handleDeactivate(emp.employee_id)}
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ---------------------------
// Styles
// ---------------------------
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1f2937",
  },
  addButton: {
    padding: "10px 20px",
    backgroundColor: "#e67e22",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  formCard: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    marginBottom: "24px",
  },
  formTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#1f2937",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
  },
  button: {
    padding: "10px 24px",
    backgroundColor: "#e67e22",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  buttonDisabled: {
    padding: "10px 24px",
    backgroundColor: "#f0a868",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "not-allowed",
    fontSize: "14px",
  },
  tableCard: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#6b7280",
    borderBottom: "1px solid #e5e7eb",
  },
  tableRow: {
    borderBottom: "1px solid #f3f4f6",
  },
  td: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#1f2937",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "20px",
    color: "white",
    fontSize: "12px",
    fontWeight: "500",
  },
  resetBtn: {
    padding: "6px 12px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    marginRight: "8px",
  },
  deactivateBtn: {
    padding: "6px 12px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  success: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
};

export default HRDashboard;