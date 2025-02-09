import Region from "./Region/Region";
import Status from "./Status/Status";
import Type from "./Type/Type";
import "./Sidebar.css";
import { useState, useEffect } from "react";
import Dashboard from "../Dashboard";
import axios from "axios";

export default function Sidebar() {
    const [searchInput, setSearchInput] = useState("");
    const [selectedFilter, setSelectedFilter] = useState({ type: "", value: "" });
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [projects, setProjects] = useState([]);

    // Fetch all projects initially
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects`);
                setProjects(response.data.data);
                setFilteredProjects(response.data.data); // Set filteredProjects to the full list initially
            } catch (error) {
                console.error("Error fetching project data:", error);
            }
        };
        fetchProjects();
    }, []);

    // Update filtered projects whenever filters change
    useEffect(() => {
        const applyFilters = () => {
            let updatedProjects = [...projects];

            if (searchInput) {
                updatedProjects = updatedProjects.filter(project =>
                    project.project_name.toLowerCase().startsWith(searchInput.toLowerCase())
                );
            }

            if (selectedFilter.value) {
                updatedProjects = updatedProjects.filter(project => {
                    switch (selectedFilter.type) {
                        case 'region':
                            return project.region === selectedFilter.value;
                        case 'status':
                            return project.status === selectedFilter.value;
                        case 'type':
                            return project.category === selectedFilter.value;
                        default:
                            return true;
                    }
                });
            }

            setFilteredProjects(updatedProjects);
        };

        applyFilters();
    }, [searchInput, selectedFilter, projects]);

    // Filter change handler
    const handleFilterChange = (type, value) => {
        setSelectedFilter({ type, value });
    };

    const handleInputChange = (e) => setSearchInput(e.target.value);

    return (
        <>
            <div className="inner-sidebar">
                <input
                    type="text"
                    placeholder="Search for projects..."
                    className="search-box"
                    value={searchInput}
                    onChange={handleInputChange}
                />
                <Region handleChange={handleFilterChange} selectedOption={selectedFilter} />
                <Status handleChange={handleFilterChange} selectedOption={selectedFilter} />
                <Type handleChange={handleFilterChange} selectedOption={selectedFilter} />
            </div>
            <Dashboard projects={filteredProjects} /> {/* Display filtered projects */}
        </>
    );
}
