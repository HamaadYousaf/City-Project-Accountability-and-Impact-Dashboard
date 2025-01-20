import './Dashboard.css';
import React, { useState, useEffect } from 'react';
import { IoIosArrowUp } from "react-icons/io";
import { Link } from 'react-router-dom'; //  
import { FaCircle } from "react-icons/fa6";
import { GoGraph } from "react-icons/go";
import { BsGraphDown } from "react-icons/bs";
import axios from 'axios';

export default function Dashboard({ projects }) {
    /*const [cityData, setCityData] = useState(null); */
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getPerformanceColor = (value) => {
        if (value >= 70) {
            return 'rgb(74, 191, 74)';
        } else if (value >= 50 && value < 70) {
            return 'orange';
        } else {
            return 'red';
        }
    };

    const getTrendIcon = (value) => {
        const color = value >= 50 ? 'rgb(74, 191, 74)' : 'red';
        const Icon = value >= 50 ? GoGraph : BsGraphDown;
        return (
            <span style={{ color }}>
                <Icon />
            </span>
        );
    };

    const getEfficiencyColor = (value) => {
        return value === "Improving" ? 'rgb(74, 191, 74)' : 'red';
    };

    console.log('test')
    return (
        <>
            <div className='dashboard'>
                <h1 className='dashboard-header'>Delayed City Projects at a Glance</h1>
                {/*
                <div className='city-section'>
                    <div className='city-metrics'>
                        <h3 className='card-header'>
                            <FaCircle className='circle' />
                            City Metrics</h3>
                        <div className='city-metrics-table'>
                            <table>
                                <tr className='city-metrics-table'>
                                    <th>Performance</th>
                                    <th>Budget Trends</th>
                                    <th>Delay Trends</th>
                                    <th>Efficiency</th>
                                </tr>
                                <tr className='city-metrics-table'>
                                    <td style={{ color: getPerformanceColor(cityData.performance_metric) }}>{cityData.performance_metric}/100</td>
                                    <td style={{ color: getPerformanceColor(cityData.original_budget) }}>{cityData.original_budget}% <IoIosArrowUp className='arrow' /></td>
                                    <td>{cityData.current_budget} <span>days</span></td>
                                    <td style={{ color: getEfficiencyColor(cityData.efficiency) }}>{cityData.efficiency}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div className='budget-trends'>
                        <h3 className='card-header'>
                            <FaCircle className='circle' />
                            Budget Trends</h3>
                        <div className='trends'>
                            <section className='budget-trend'>
                                <h4>Construction</h4>
                                <p>{cityData.current_budget}% {getTrendIcon(cityData.current_budget)}</p>
                            </section>
                            <section className='budget-trend'>
                                <h4>Transit</h4>
                                <p>{cityData.current_budget}% {getTrendIcon(cityData.current_budget)}</p>
                            </section>
                            <section className='budget-trend'>
                                <h4>Transportation</h4>
                                <p>{cityData.current_budget}% {getTrendIcon(cityData.current_budget)}</p>
                            </section>
                        </div>
                    </div>
                </div> */}
                <div className='projects-section'>
                    <h2 className='dashboard-header'>Projects</h2>
                    <ul className="project-list">
                        {projects.map((project) => ( //this was projectData.map
                            <li key={project._id} className='project'>
                                <h4 className='project-header'>
                                    <FaCircle className='circle' />
                                    {project.project_name}
                                </h4>
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
                                    <p>{project.current_completion_date}</p>
                                </section>
                                <div className='project-button'>
                                    <Link to={`/projects/${project._id}`}><button>{project.project_name}</button></Link>
                                </div>
                            </li>
                        ))}
                        {/*
                        {projects && projects.length > 0 ? (
                            projects.map(project => (
                                <li key={project._id} className='project'>
                                    <h4 className='project-header'>
                                        <FaCircle className='circle' />
                                        {project.project_name}
                                    </h4>
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
                                        <p>{project.current_completion_date}</p>
                                    </section>
                                    <div className='project-button'>
                                        <Link to={`/projects/${project._id}`}><button>{project.project_name}</button></Link>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p>No projects found.</p>
                        )} */}
                    </ul>
                </div>
            </div>

        </>
    )
} 