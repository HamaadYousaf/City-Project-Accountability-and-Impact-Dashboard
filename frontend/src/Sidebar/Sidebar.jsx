import Region from "./Region/Region";
import Status from "./Status/Status";
import Type from "./Type/Type";
import "./Sidebar.css";
import { useState, useEffect } from "react";
import Dashboard from "../Dashboard";
import axios from "axios";

export default function Sidebar() {
    const [searchInput, setSearchInput] = useState("");
    const [selectedRegion, setSelectedRegion] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedType, setSelectedType] = useState("");
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

            if (selectedRegion) {
                updatedProjects = updatedProjects.filter(project => project.region === selectedRegion);
            }

            if (selectedStatus) {
                updatedProjects = updatedProjects.filter(project => project.status === selectedStatus);
            }

            if (selectedType) {
                updatedProjects = updatedProjects.filter(project => project.category === selectedType);
            }

            setFilteredProjects(updatedProjects);
        };

        applyFilters();
    }, [searchInput, selectedRegion, selectedStatus, selectedType, projects]);

    // Filter change handlers
    const handleRegionChange = (e) => setSelectedRegion(e.target.value);
    const handleStatusChange = (e) => setSelectedStatus(e.target.value);
    const handleTypeChange = (e) => setSelectedType(e.target.value);
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
                <Region handleChange={handleRegionChange} selectedOption={selectedRegion} />
                <Status handleChange={handleStatusChange} selectedOption={selectedStatus} />
                <Type handleChange={handleTypeChange} selectedOption={selectedType} />
            </div>
            <Dashboard projects={filteredProjects} /> {/* Display filtered projects */}
        </>
    );
}
