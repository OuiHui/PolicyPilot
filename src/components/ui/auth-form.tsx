import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Shield } from "lucide-react";

import { Button } from "./button";
import { Input } from "./input";

interface AuthFormProps {
    heading?: string;
    onSubmit?: (email: string, password: string, firstName?: string, lastName?: string) => void;
    onGoogleSignup?: () => void;
    mode?: "signup" | "login";
    onToggleMode?: () => void;
    error?: string | null;
}

const AuthForm = ({
    heading,
    onSubmit,
    onGoogleSignup,
    mode = "login",
    onToggleMode,
    error,
}: AuthFormProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit && email && password) {
            if (mode === "signup") {
                onSubmit(email, password, firstName, lastName);
            } else {
                onSubmit(email, password);
            }
        }
    };

    const isLogin = mode === "login";
    const mainButtonText = isLogin ? "Login" : "Create an account";
    const googleButtonText = isLogin
        ? "Login with Google"
        : "Sign up with Google";
    const toggleText = isLogin
        ? "Don't have an account?"
        : "Already have an account?";
    const toggleLinkText = isLogin ? "Sign up" : "Login";

    return (
        <section className="bg-muted min-h-screen flex items-center justify-center p-6">
            <div
                className="border-muted bg-background flex w-full flex-col items-center gap-6 rounded-md border px-6 py-12 shadow-md"
                style={{ maxWidth: "360px" }}
            >
                {/* PolicyPilot Logo */}
                <div className="flex items-center gap-1 lg:justify-start">
                    <Shield className="w-10 h-10 text-blue-600" />
                    <span className="text-gray-900 text-xl font-semibold">
                        PolicyPilot
                    </span>
                </div>

                {heading && (
                    <h1 className="text-3xl font-semibold">{heading}</h1>
                )}
                {!heading && (
                    <p className="text-gray-600 text-center">
                        {isLogin ? (
                            <>
                                <span className="block">Welcome back!</span>
                                <span className="block">
                                    Login to manage your appeals.
                                </span>
                            </>
                        ) : (
                            "Get started with your appeal journey."
                        )}
                    </p>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="flex w-full flex-col gap-6"
                >
                    {mode === "signup" && (
                        <>
                            <Input
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                            <Input
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </>
                    )}
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200">
                            {error}
                        </div>
                    )}
                    <Button type="submit" className="w-full">
                        {mainButtonText}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={onGoogleSignup}
                    >
                        <FcGoogle className="mr-2 size-5" />
                        {googleButtonText}
                    </Button>
                </form>

                {onToggleMode && (
                    <div className="text-muted-foreground flex justify-center gap-1 text-sm">
                        <p>{toggleText}</p>
                        <button
                            type="button"
                            onClick={onToggleMode}
                            className="text-primary font-medium hover:underline"
                        >
                            {toggleLinkText}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export { AuthForm };
