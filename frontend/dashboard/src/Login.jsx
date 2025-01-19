import "./CommonStyles.css";

export default function Login() {
    return (
        <>
            <div className="card">
                <h1 className="card-header">Login</h1>
                <form method="POST" action="/login">
                    <div className="card-inputs">
                        <input
                            type="text"
                            id=""
                            name="name"
                            placeholder="Name"
                            className="login-input"
                            required />
                        <input
                            type="password"
                            id=""
                            name="password"
                            placeholder="Password"
                            className="login-input"
                            required />
                    </div>
                    <div className="card-submission">
                        <button className="login-button">Login</button>
                    </div>
                </form>
            </div>
        </>
    )
}