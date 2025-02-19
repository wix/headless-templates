"use client";
import {useRouter} from "next/router";

/*
 * Error page component.
 * This component displays an error message when an error occurs.
 * The error message is passed as a query parameter.
 */
export default function ErrorPage() {
    const router = useRouter();
    const {message} = router.query;

    return (
        <div style={{padding: "20px", textAlign: "center"}}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 600 540"
                width="100"
                height="100"
            >
                <path
                    d="M270 512A256 256 0 1 0 270 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-112c0-13.3 10.7-24 24-24zM238 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
                    fill="none"
                    stroke="black"
                    strokeWidth="24"
                />
            </svg>

            <h1>Something went wrong</h1>
            {message ? (
                <h4>{message}</h4>
            ) : (
                <h4>An unknown error occurred. Please try again later.</h4>
            )}
        </div>
    );
}
