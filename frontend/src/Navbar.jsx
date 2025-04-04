import React from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
import symbol from './logo.png';

export default function Navbar() {

    return (
        <>
            <nav className='navbar'>
                <div className="nav-logo">
                    <Link to="/">
                        <img src={symbol} alt="CityScope Symbol" className="symbol-icon" />
                        <div className='logo'><span>CityScope</span> Toronto</div>
                    </Link>
                </div>
            </nav>
        </>
    )
}
