import Region from "./Region/Region";
import Status from "./Status/Status";
import Type from "./Type/Type";
import "./Sidebar.css";
import { useState, useEffect } from "react";
import Dashboard from "../Dashboard";
import axios from "axios";
import { FaBars } from "react-icons/fa";

export default function Sidebar() {
    const [searchInput, setSearchInput] = useState("");
    const [selectedFilter, setSelectedFilter] = useState({ type: "", value: "" });
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [projects, setProjects] = useState([]);
    const [pageNum, setPageNum] = useState(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Fetch all projects initially
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects?page=${pageNum}`);
                setProjects(response.data.data);
                //setFilteredProjects(response.data.data); 
            } catch (error) {
                console.error("Error fetching project data:", error);
            }
        };
        fetchProjects();
    }, [pageNum]);

    // Update filtered projects whenever filters change
    useEffect(() => {
        const applyFilters = async () => {
            let updatedProjects = [...projects];
            if (searchInput) {
                updatedProjects = updatedProjects.filter(project =>
                    project.project_name.toLowerCase().startsWith(searchInput.toLowerCase())
                );
            }
            if (selectedFilter.value) {
                if (selectedFilter.type === 'region') {
                    updatedProjects = updatedProjects.filter(project => project.region === selectedFilter.value);
                } else if (selectedFilter.type === 'status') {
                    updatedProjects = updatedProjects.filter(project => project.status === selectedFilter.value);
                } else if (selectedFilter.type === 'type') {
                    updatedProjects = updatedProjects.filter(project => project.category === selectedFilter.value);
                }
            }
            setFilteredProjects(updatedProjects);
        };
        applyFilters();
    }, [searchInput, selectedFilter, projects]);

    // Filter change handler
    const handleFilterChange = (type, value) => {
        setSelectedFilter({ type, value });
    };

    const handleInputChange = (e) => {
        setSearchInput(e.target.value);
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <>
            <div className="layout-container">
                <div className="hamburger-icon" onClick={toggleSidebar}>
                    <FaBars />
                </div>

                <div className={`inner-sidebar ${isSidebarOpen ? "open" : ""}`}>
                    <div className="sidebar-content">
                        <input
                            type="text"
                            placeholder="Search for projects..."
                            className="search-box"
                            value={searchInput}
                            onChange={handleInputChange}
                        />
                        <Status handleChange={handleFilterChange} selectedOption={selectedFilter} />
                        <Region handleChange={handleFilterChange} selectedOption={selectedFilter} />
                        <Type handleChange={handleFilterChange} selectedOption={selectedFilter} />
                    </div>
                </div>


                <Dashboard
                    projects={filteredProjects}
                    pageNum={pageNum}
                    setPageNum={setPageNum}
                />
            </div> {/* Display filtered projects */}
        </>
    );
}
