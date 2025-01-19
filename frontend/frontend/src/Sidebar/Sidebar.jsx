import Region from "./Region/Region"
import Status from "./Status/Status"
import Type from "./Type/Type"
import "./Sidebar.css";
import { useState, useEffect } from "react";
import Dashboard from "../Dashboard";
import axios from "axios";


export default function Sidebar() {
    const [searchInput, setSearchInput] = useState("");
    const [selectedOption, setSelectedOption] = useState("");
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [projects, setProjects] = useState([]); // State for storing fetched project data

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get(`${process.env.API_URL}/api/projects`);
                setProjects(response.data);
                setFilteredProjects(response.data);
            } catch (error) {
                console.error("Error fetching project data:", error);
            }
        };
        fetchProjects();
    }, []);

    const handleRegionChange = (e) => {
        const selectedRegion = e.target.value;
        setSelectedOption(selectedRegion);
        const filteredRegion = projects.filter(project => project.region === selectedRegion);
        setFilteredProjects(filteredRegion); // Update the filtered projects state
    };

    const handleStatusChange = (e) => {
        const selectedStatus = e.target.value;
        setSelectedOption(selectedStatus);
        const filteredStatus = projects.filter(project => project.status === selectedStatus);
        setFilteredProjects(filteredStatus); // Update the filtered projects state
    };

    const handleTypeChange = (e) => {
        const selectedType = e.target.value;
        setSelectedOption(selectedType);
        const filteredType = projects.filter(project => project.category === selectedType);
        setFilteredProjects(filteredType); // Update the filtered projects state
    };

    const handleInputChange = (e) => {
        const input = e.target.value.toLowerCase();
        setSearchInput(input);
        const filteredByInput = projects.filter(project => project.project_name.toLowerCase().startsWith(input));
        setFilteredProjects(filteredByInput);
    }

    return (
        <>
            {/*<div className="sidebar"> */}
            <div className="inner-sidebar">
                {/*
                <div className="sidebar-logo">
                    <h2 className="logo">LOGO</h2>
                </div> */}
                <input
                    type="text"
                    placeholder='Search for projects...'
                    className='search-box'
                    value={searchInput}
                    onChange={handleInputChange}
                />
                <Region handleChange={handleRegionChange} selectedOption={selectedOption} />
                <Status handleChange={handleStatusChange} selectedOption={selectedOption} />
                <Type handleChange={handleTypeChange} selectedOption={selectedOption} />
            </div>
            <Dashboard projects={filteredProjects} /> {/*filteredProjects comes from the useState above*/}
            {/*</div>*/}
        </>
    )
}

