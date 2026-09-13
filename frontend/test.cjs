const axios = require("axios");
async function test() {
  const api = axios.create({ baseURL: "http://localhost:8080/api" });
  try {
    const login = await api.post("/auth/login", { usernameOrEmail: "admin", password: "password" });
    console.log("LOGIN SUCCESS:", login.data.username);
    api.defaults.headers.common["Authorization"] = "Bearer " + login.data.token;
    
    const assets = await api.get("/assets");
    console.log("GET ASSETS:", assets.data.length, "found.");
    
    const vendors = await api.get("/vendors");
    console.log("GET VENDORS:", vendors.data.length, "found.");
    
    if (assets.data.length > 0) {
      const asset = await api.get("/assets/" + assets.data[0].id);
      console.log("GET ASSET ID", assets.data[0].id, "SUCCESS:", asset.data.assetName);
    }
    console.log("ALL TESTS PASSED.");
  } catch (e) {
    console.error("ERROR:", e.response ? e.response.data : e.message);
  }
}
test();
