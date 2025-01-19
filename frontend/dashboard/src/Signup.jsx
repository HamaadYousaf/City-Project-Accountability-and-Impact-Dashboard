import "./CommonStyles.css";

export default function Signup() {
    return (
        <>
            <div className="card">
                <h1 className="card-header">Sign Up</h1>
                <form method="POST" action="/signup">
                    <div className="card-inputs">
                        <input
                            type="email"
                            id=""
                            name="email"
                            placeholder="E-mail"
                            className="card-input"
                            required />
                        <input
                            type="text"
                            id=""
                            name="name"
                            placeholder="Name"
                            className="card-input"
                            required />
                        <input
                            type="password"
                            id=""
                            name="password"
                            placeholder="Password"
                            className="card-input"
                            required />
                    </div>
                    <div className="card-submission">
                        <button className="signup-button">Sign Up</button>
                    </div>
                </form>
            </div>
        </>
    )
}