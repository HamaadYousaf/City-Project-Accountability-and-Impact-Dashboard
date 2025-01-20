import React from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
import { PiLetterCirclePFill } from "react-icons/pi";


export default function Navbar() {

    return (
        <>
            <nav className='navbar'>
                <div className="nav-logo">
                    <Link to="/">
                        {/*<PiLetterCirclePFill className='logo' size={35} /> */}
                        <div className='logo'>Logo</div>
                    </Link>
                </div>
                {/*<div className='nav-input'>
                    <input
                        type="text"
                        placeholder='Search for projects'
                        className='search-box' />
                </div> */}
                <div>
                    <p>Username</p> {/*here do something like if isSignedIn then show*/}
                </div>
                <div className='nav-links'>
                    <ul>
                        <li>
                            <Link to="/signup" >
                                <button className='nav-button'>Sign Up</button>
                            </Link>
                        </li>
                        <li>
                            <Link to="/login" >
                                <button className='nav-button'>Login</button>
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    )
}
