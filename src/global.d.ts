import { RecaptchaVerifier } from "firebase/auth";

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
        confirmationResult: any; // if you also use confirmationResult on window
    }
}

