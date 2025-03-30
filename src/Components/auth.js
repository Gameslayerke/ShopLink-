export const isAdminAuthenticated = () => {
    const admin = localStorage.getItem("admin");

    if (!admin) return false; // Ensure 'admin' exists

    try {
        const parsedAdmin = JSON.parse(admin);
        return parsedAdmin && parsedAdmin.token ? parsedAdmin : false; // Ensure token exists
    } catch (error) {
        console.error("Invalid admin data in localStorage:", error);
        return false; // If JSON parsing fails, return false
    }
};
