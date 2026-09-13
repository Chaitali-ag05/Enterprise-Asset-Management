const axios = require("axios");
async function test() {
  const api = axios.create({ baseURL: "http://localhost:8080/api" });
  try {
    const login = await api.post("/auth/login", { usernameOrEmail: "admin", password: "password" });
    console.log("LOGIN SUCCESS:", login.data.username);
    api.defaults.headers.common["Authorization"] = "Bearer " + login.data.token;
    
    // 1. Create a department
    const newDeptName = "Test Dept " + Math.random().toString(36).substring(7);
    const created = await api.post("/departments", { name: newDeptName });
    console.log("CREATED DEPT:", created.data);
    
    // 2. Fetch list
    const list = await api.get("/departments");
    console.log("TOTAL DEPARTMENTS:", list.data.length);
    
    // 3. Update department
    const updated = await api.put("/departments/" + created.data.id, { name: newDeptName + " Updated" });
    console.log("UPDATED DEPT:", updated.data);
    
    // 4. Duplicate name test
    try {
      await api.post("/departments", { name: updated.data.name });
      console.error("FAILED: Should not allow duplicate");
    } catch (err) {
      console.log("DUPLICATE CATCH EXPECTED:", err.response.data.message);
    }
    
    // 5. Deactivate
    await api.delete("/departments/" + created.data.id);
    console.log("DEACTIVATED SUCCESS");
    
    // 6. Verify status
    const deactivated = await api.get("/departments/" + created.data.id);
    console.log("STATUS AFTER DEACTIVATE:", deactivated.data.status);

  } catch (e) {
    console.error("ERROR:", e.response ? e.response.data : e.message);
  }
}
test();
