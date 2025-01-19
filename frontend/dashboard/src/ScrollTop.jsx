import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation(); //

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]); //basically saying when the route changes, scroll up top, route being pathname 

    return null;
};


