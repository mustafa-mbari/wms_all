export interface UserData {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  is_active: boolean
  email_verified: boolean
  last_login_at?: string
  created_at: string
  role_names: string[]
  role_slugs: string[]
}

export const exportToCSV = (data: UserData[], filename = "users.csv") => {
  const headers = ["ID", "Username", "Name", "Email", "Phone", "Roles", "Status", "Email Verified", "Last Login", "Created At"]

  const csvContent = [
    headers.join(","),
    ...data.map((user) =>
      [
        `"${user.id}"`,
        `"${user.username}"`,
        `"${user.first_name} ${user.last_name}"`,
        `"${user.email}"`,
        `"${user.phone || 'N/A'}"`,
        `"${user.role_names.join(', ')}"`,
        `"${user.is_active ? 'Active' : 'Inactive'}"`,
        `"${user.email_verified ? 'Verified' : 'Not Verified'}"`,
        `"${user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}"`,
        `"${new Date(user.created_at).toLocaleDateString()}"`,
      ].join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportToExcel = (data: UserData[], filename = "users.xlsx") => {
  // In a real app, you'd use a library like xlsx or exceljs
  // For now, we'll export as CSV with .xlsx extension as a placeholder
  const headers = ["ID", "Username", "Name", "Email", "Phone", "Roles", "Status", "Email Verified", "Last Login", "Created At"]

  const csvContent = [
    headers.join("\t"),
    ...data.map((user) =>
      [
        user.id,
        user.username,
        `${user.first_name} ${user.last_name}`,
        user.email,
        user.phone || 'N/A',
        user.role_names.join(', '),
        user.is_active ? 'Active' : 'Inactive',
        user.email_verified ? 'Verified' : 'Not Verified',
        user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never',
        new Date(user.created_at).toLocaleDateString(),
      ].join("\t"),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportToPDF = (data: UserData[], filename = "users.pdf") => {
  // In a real app, you'd use a library like jsPDF or Puppeteer
  // For now, we'll create a simple HTML version and print it
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>User Directory</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        h1 { color: #333; margin-bottom: 20px; }
        .status-active { color: green; font-weight: bold; }
        .status-inactive { color: red; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>User Directory</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Roles</th>
            <th>Status</th>
            <th>Email Verified</th>
            <th>Last Login</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (user) => `
            <tr>
              <td>${user.id}</td>
              <td>${user.username}</td>
              <td>${user.first_name} ${user.last_name}</td>
              <td>${user.email}</td>
              <td>${user.phone || 'N/A'}</td>
              <td>${user.role_names.join(', ')}</td>
              <td><span class="${user.is_active ? 'status-active' : 'status-inactive'}">${user.is_active ? 'Active' : 'Inactive'}</span></td>
              <td>${user.email_verified ? 'Verified' : 'Not Verified'}</td>
              <td>${user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}</td>
              <td>${new Date(user.created_at).toLocaleDateString()}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </body>
    </html>
  `

  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }
}
