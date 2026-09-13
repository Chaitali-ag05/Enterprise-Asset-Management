const axios = require("axios");
async function test() {
  const api = axios.create({ baseURL: "http://localhost:8080/api" });
  try {
    const login = await api.post("/auth/login", { usernameOrEmail: "admin", password: "password" });
    console.log("LOGIN SUCCESS:", login.data.username);
    api.defaults.headers.common["Authorization"] = "Bearer " + login.data.token;
    
    const emps = await api.get("/employees");
    console.log("GET EMPLOYEES:", emps.data.length, "found.");
    
    if (emps.data.length > 0) {
      const emp = await api.get("/employees/" + emps.data[0].id);
      console.log("GET EMPLOYEE ID", emps.data[0].id, "SUCCESS:", emp.data.firstName);
    }
    console.log("ALL TESTS PASSED.");
  } catch (e) {
    console.error("ERROR:", e.response ? e.response.data : e.message);
  }
}
test();
