import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import { FaUserShield, FaLock, FaSignInAlt } from "react-icons/fa";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const admin = localStorage.getItem("admin");
        if (admin) {
            navigate("/dashboard");
        }
    }, [navigate]); // Added 'navigate' as a dependency
    

    const submitForm = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post("https://alvins.pythonanywhere.com/api/admin/login", {
                email,
                password
            });

            console.log("Login Response:", response.data);

            setLoading(false);
            setSuccess(response.data.message || "Login successful!");

            if (response.data.token) {
                localStorage.setItem("admin", JSON.stringify(response.data));
                console.log("Stored Admin:", localStorage.getItem("admin"));
                navigate("/dashboard");
            } else {
                setError("Invalid response from server.");
            }
        } catch (error) {
            setLoading(false);
            console.error("Login Error:", error.response?.data || error.message);
            setError(error.response?.data?.error || "Something went wrong. Please try again.");
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <FaUserShield className="admin-icon" />
                    <h2>Admin Portal</h2>
                </div>

                {loading && <div className="admin-loading">Authenticating...</div>}
                {success && <div className="admin-success">{success}</div>}
                {error && <div className="admin-error">{error}</div>}

                <form onSubmit={submitForm} className="admin-login-form">
                    <div className="form-group">
                        <label>Email</label>
                        <div className="input-with-icon">
                            <FaUserShield className="input-icon" />
                            <input
                                type="email"
                                placeholder="Enter admin email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="login-button">
                        <FaSignInAlt className="button-icon" />
                        {loading ? "Processing..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
