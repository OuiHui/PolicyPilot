import React, { useState } from "react";
import { AuthForm } from "./ui/auth-form";
import { apiUrl } from "../config";

type LoginProps = {
    onLogin: (user: any) => void;
};

export function Login({ onLogin }: LoginProps) {
    const [mode, setMode] = useState<"login" | "signup">("login");

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (email: string, password: string) => {
        setError(null);
        if (mode === "login") {
            try {
                const response = await fetch(apiUrl("/api/users/login"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                if (response.ok) {
                    const user = await response.json();
                    console.log("Logged in:", user);
                    onLogin(user);
                } else {
                    const data = await response.json();
                    if (response.status === 404) {
                        setError("Account not found. Please create an account.");
                    } else {
                        setError(data.error || "Login failed");
                    }
                }
            } catch (err) {
                setError("Failed to connect to server. Please ensure the backend is running.");
                console.error(err);
            }
        } else {
            try {
                // For now, we'll split the email to get first/last name or just use placeholders
                // In a real app, we'd add fields for names
                const firstName = "New";
                const lastName = "User";

                const response = await fetch(apiUrl("/api/users"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, firstName, lastName }),
                });

                if (response.ok) {
                    const user = await response.json();
                    console.log("Signed up:", user);
                    onLogin(user);
                } else {
                    const data = await response.json();
                    setError(data.error || "Signup failed");
                }
            } catch (err) {
                setError("Failed to connect to server");
                console.error(err);
            }
        }
    };

    const handleGoogleAuth = () => {
        // Simulate OAuth login/signup
        onLogin({
            _id: "google-user-id",
            email: "user@gmail.com",
            firstName: "Google",
            lastName: "User",
            hipaaAccepted: false
        });
    };

    const toggleMode = () => {
        setMode(mode === "login" ? "signup" : "login");
    };

    return (
        <>
            <AuthForm
                mode={mode}
                onSubmit={handleSubmit}
                onGoogleSignup={handleGoogleAuth}
                onToggleMode={toggleMode}
                error={error}
            />
        </>
    );
}
