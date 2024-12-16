"use client";
import { useState } from "react";
import { ChangeLanguageButtons, Error, Header, LoginForm, LoginImage } from "./components";

const Login = () => {
    const [error, setError] = useState("");
    return (
        <div className="_full _center px-3">
            <LoginImage />
            <div className="p-6 border w-96  border-gray-200 rounded-lg shadow-md flex flex-col gap-4">
                <Header />
                <Error error={error} />
                <LoginForm setError={setError} />
                <ChangeLanguageButtons />
            </div>
        </div>
    );
};

export default Login;
