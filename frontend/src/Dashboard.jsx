import './Dashboard.css';
import React, { useState, useEffect } from 'react';
import { IoIosArrowUp } from "react-icons/io";
import { IoArrowDownSharp } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { FaCircle } from "react-icons/fa6";
import { GoGraph } from "react-icons/go";
import { BsGraphDown } from "react-icons/bs";
import axios from 'axios';

export default function Dashboard({ projects }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cityData, setCityData] = useState(null); // State to hold the city data

    const getPerformanceColor = (value) => {
        if (value >= 70) {
            return 'rgb(7, 222, 140)';
        } else if (value >= 50 && value < 70) {
            return 'orange';
        } else {
            return 'red';
        }
    };

    const getTrendIcon = (value) => {
        const color = value >= 50 ? 'rgb(7, 222, 140)' : 'red';
        const Icon = value >= 50 ? GoGraph : BsGraphDown;
        return (
            <span style={{ color }}>
                <Icon />
            </span>
        );
    };

    const getArrowIcon = (value) => {
        const color = value >= 50 ? 'rgb(7, 222, 140)' : 'red';
        const Icon = value >= 50 ? IoIosArrowUp : IoArrowDownSharp
        return (
            <span style={{ color }}>
                <Icon />
            </span>
        )
    }

    const getEfficiencyColor = (value) => {
        if (value === "Improving") {
            return 'rgb(7, 222, 140)'
        }
        else if (value === "Moderate") {
            return 'orange'
        }
        else {
            return 'red'
        }
    };

    useEffect(() => {
        const fetchCityData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects/summary`);
                setCityData(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching city data:", error);
                setError("Failed to load city data.");
                setLoading(false);
            }
        };
        fetchCityData();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    const completedProjects = projects.filter(project => project.status === "Completed");
    const notStartedProjects = projects.filter(project => project.status === "Planning Started");
    const inProgressProjects = projects.filter(project => project.status === "Planning Complete" || project.status === "Construction Started");

    return (
        <>
            <div className='dashboard'>
                <h1 className='dashboard-header'>Delayed City Projects at a Glance</h1>
                {cityData && (
                    <div className='city-section'>
                        <div className='city-metrics'>
                            <h3 className='card-header'>
                                <FaCircle className='circle' />
                                City Metrics
                            </h3>
                            <div className='city-metrics-table'>
                                <table>
                                    <tbody>
                                        <tr>
                                            <th>Performance</th>
                                            <th>Budget Trends</th>
                                            <th>Delay Trends</th>
                                            <th>Efficiency</th>
                                        </tr>
                                        <tr>
                                            <td style={{ color: getPerformanceColor(cityData.performance) }}>
                                                {parseFloat(cityData.performance).toFixed(1)}/100
                                            </td>
                                            <td style={{ color: getPerformanceColor(cityData.budget_change * 100) }}>
                                                {Math.round(cityData.budget_change * 100)}%
                                                {getArrowIcon(cityData.budget_change)}
                                            </td>
                                            <td>{Number(cityData.delays).toFixed(1)} <span>months</span></td>
                                            <td style={{ color: getEfficiencyColor(cityData.efficiency) }}>
                                                {cityData.efficiency}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                )}
                <div className='projects-section'>
                    <h2 className='dashboard-header'>Projects in Progress</h2>
                    <ul className="project-list">
                        {inProgressProjects.map((project) => (
                            <li key={project._id} className='project'>
                                <h4 className='project-header'>
                                    <FaCircle className='circle' />
                                    {project.project_name}
                                </h4>
                                <section className='project-info'>
                                    <p><strong>Start Date:</strong></p>
                                    <p>{new Date(project.planning_start_date).toISOString().split('T')[0]}</p>
                                </section>
                                <section className='project-info'>
                                    <p><strong>Type:</strong></p>
                                    <p>{project.category}</p>
                                </section>
                                <section className='project-info'>
                                    <p><strong>Location:</strong></p>
                                    <p>{project.address}</p>
                                </section>
                                <section className='project-info'>
                                    <p><strong>Region:</strong></p>
                                    <p>{project.region}</p>
                                </section>
                                <section className='project-info'>
                                    <p><strong>Status:</strong></p>
                                    <p>{project.status}</p>
                                </section>
                                <section className='project-info'>
                                    <p><strong>Original Completion Date:</strong></p>
                                    <p>{new Date(project.original_completion_date).toISOString().split('T')[0]}</p>
                                </section>
                                <section className='project-info'>
                                    <p><strong>Current Completion Date:</strong></p>
                                    <p>{new Date(project.current_completion_date).toISOString().split('T')[0]}</p>
                                </section>
                                <div className='project-button'>
                                    <Link to={`/projects/${project._id}`}><button>{project.project_name}</button></Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className='projects-section'>
                    <h2 className='dashboard-header'>Projects Not Started</h2>
                    <ul className="project-list">
                        {notStartedProjects.map((project) => (
                            <li key={project._id} className='project'>
                                <h4 className='project-header'>
                                    <FaCircle className='circle' />
                                    {project.project_name}
                                </h4>
                                <section className='project-info'>
                                    <p><strong>Start Date:</strong></p>
                                    <p>{new Date(project.planning_start_date).toISOString().split('T')[0]}</p>
                                </section>
                                <section className='project-info'>
                                    <p><strong>Type:</strong></p>
                                    <p>{project.category}</p>
                                </section>
                                <section className='project-info'>
                                    <p><strong>Location:</strong></p>
                                    <p>{project.address}</p>
                                </section>
                                <section className='project-info'>
                                    <p><strong>Region:</strong></p>
                                    <p>{project.region}</p>
                                </section>
                                <section className='project-info'>
                                    <p><strong>Status:</strong></p>
                                    <p>{project.status}</p>
                                </section>
                                <section className='project-info'>
                                    <p><strong>Original Completion Date:</strong></p>
                                    <p>{new Date(project.original_completion_date).toISOString().split('T')[0]}</p>
                                </section>
                                <section className='project-info'>
                                    <p><strong>Current Completion Date:</strong></p>
                                    <p>{new Date(project.current_completion_date).toISOString().split('T')[0]}</p>
                                </section>
                                <div className='project-button'>
                                    <Link to={`/projects/${project._id}`}><button>{project.project_name}</button></Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className='projects-section'>
                    <h2 className='dashboard-header'>Completed Projects</h2>
                    <ul className="project-list">
                        {completedProjects.map((project) => (
                            <li key={project._id} className='project'>
                                <h4 className='project-header'>
                                    <FaCircle className='circle' />
                                    {project.project_name}
                                </h4>
                                <section className='project-info'>
                                    <p><strong>Start Date:</strong></p>
                                    <p>{new Date(project.planning_start_date).toISOString().split('T')[0]}</p>
                                </section>
                                <section className='project-info'>
                                    <p><strong>Type:</strong></p>
                                    <p>{project.category}</p>
                                </section>
                                <section className='project-info'>
                                    <p><strong>Location:</strong></p>
                                    <p>{project.address}</p>
                                </section>
                                <section className='project-info'>
                                    <p><strong>Region:</strong></p>
                                    <p>{project.region}</p>
                                </section>
                                <section className='project-info'>
                                    <p><strong>Status:</strong></p>
                                    <p>{project.status}</p>
                                </section>
                                <section className='project-info'>
                                    <p><strong>Completion Date:</strong></p>
                                    <p>{new Date(project.current_completion_date).toISOString().split('T')[0]}</p>
                                </section>
                                <div className='project-button'>
                                    <Link to={`/projects/${project._id}`}><button>{project.project_name}</button></Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}
