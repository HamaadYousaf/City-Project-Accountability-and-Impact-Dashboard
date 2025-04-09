import './Dashboard.css';
import React, { useState, useEffect } from 'react';
import { IoIosArrowUp } from "react-icons/io";
import { IoArrowDownSharp } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { FaCircle } from "react-icons/fa6";
import { AiFillQuestionCircle } from "react-icons/ai";
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import CityPieChart from './Components/CityPieChart';


export default function Dashboard({ projects, pageNum, setPageNum }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cityData, setCityData] = useState(null); // State to hold the city data
    const [allProjects, setAllProjects] = useState([]);

    const getPerformanceColor = (value) => {
        if (value >= 70) {
            return 'rgb(7, 222, 140)';
        } else if (value >= 50 && value < 70) {
            return 'orange';
        } else {
            return 'red';
        }
    };

    const getBudgetColor = (value) => {
        if (value >= 50) {
            return 'red'
        }
        else {
            return 'rgb(7, 222, 140)'
        }
    }

    const getArrowIcon = (value) => {
        const color = value >= 50 ? 'red' : 'rgb(7, 222, 140)';
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

    useEffect(() => {
        const fetchAllProjects = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects`)
                setAllProjects(response.data.data)
            } catch (error) {
                console.log(error)
                setError("No data available")
            }
        };
        fetchAllProjects();
    }, [])

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    const completedProjects = projects.filter(project => project.status === "Completed");
    const notStartedProjects = projects.filter(project => project.status === "Planning Started");
    const inProgressProjects = projects.filter(project => project.status === "Planning Complete" || project.status === "Construction Started");

    const totalEconomicCost = allProjects.reduce((sum, project) => sum + project.economic_cost, 0); //sum starts at 0 and added with the economic cost
    const totalOpportunityCost = allProjects.reduce((sum, project) => sum + project.opportunity_cost, 0);
    const totalHumanCost = allProjects.reduce((sum, project) => sum + project.human_cost, 0);

    const totalPieData = [
        { name: 'Economic Cost', value: totalEconomicCost },
        { name: 'Opportunity Cost', value: totalOpportunityCost },
        { name: 'Human Cost', value: totalHumanCost }
    ];

    return (
        <>
            <div className='dashboard-wrapper'>
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
                                    <table className='metrics-table'>
                                        <tbody>
                                            <tr>
                                                <th>Performance
                                                    <div className="tooltip-container">
                                                        <AiFillQuestionCircle className="question-mark" />
                                                        <span className="tooltip-text">Represents the overall city performance score.</span>
                                                    </div>
                                                </th>
                                                <th>Budget Trends
                                                    <div className="tooltip-container">
                                                        <AiFillQuestionCircle className="question-mark" />
                                                        <span className="tooltip-text">Tracks changes in the city’s project budgets over time. A positive trend means projects are running under budget, while a negative trend indicates budget overruns.</span>
                                                    </div>
                                                </th>
                                                <th>Delay Trends
                                                    <div className="tooltip-container">
                                                        <AiFillQuestionCircle className="question-mark" />
                                                        <span className="tooltip-text">Indicates the average delay in months across all city projects. </span>
                                                    </div>
                                                </th>
                                                <th>Efficiency
                                                    <div className="tooltip-container">
                                                        <AiFillQuestionCircle className="question-mark" />
                                                        <span className="tooltip-text">Measures the overall productivity and resource management of city projects. Higher efficiency reflects projects being completed within budget and on time.</span>
                                                    </div>
                                                </th>
                                            </tr>
                                            <tr>
                                                <td style={{ color: getPerformanceColor(cityData.performance) }}>
                                                    {parseFloat(cityData.performance).toFixed(1)}/100
                                                </td>
                                                <td style={{ color: getBudgetColor(cityData.budget_change * 100) }}>
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
                            <div className='cost-trends'>
                                <h3 className='card-header'>
                                    <FaCircle className='circle' />Cost Trends</h3>
                                <CityPieChart pieData={totalPieData} />
                                <div className='legend'>
                                    <p><FaCircle className='circle' />Economic <FaCircle className='circle' />Opportunity <FaCircle className='circle' />Human</p>
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
                                        <p className='info'>{new Date(project.planning_start_date).toISOString().split('T')[0]}</p>
                                    </section>
                                    <section className='project-info'>
                                        <p><strong>Type:</strong></p>
                                        <p className='info'>{project.category}</p>
                                    </section>
                                    <section className='project-info'>
                                        <p><strong>Location:</strong></p>
                                        <p className='info'>{project.address}</p>
                                    </section>
                                    <section className='project-info'>
                                        <p><strong>Region:</strong></p>
                                        <p className='info'>{project.region}</p>
                                    </section>
                                    <section className='project-info'>
                                        <p><strong>Status:</strong></p>
                                        <p className='info'>{project.status}</p>
                                    </section>
                                    <section className='project-info'>
                                        <p><strong>Original Completion Date:</strong></p>
                                        <p className='info'>{new Date(project.original_completion_date).toISOString().split('T')[0]}</p>
                                    </section>
                                    <section className='project-info'>
                                        <p><strong>Current Completion Date:</strong></p>
                                        <p className='info'>{new Date(project.current_completion_date).toISOString().split('T')[0]}</p>
                                    </section>
                                    <div className='project-button'>
                                        <Link to={`/projects/${project._id}`}><button>View Project</button></Link>
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
                                        <Link to={`/projects/${project._id}`}><button>View Project</button></Link>
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
                                        <Link to={`/projects/${project._id}`}><button>View Project</button></Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className='pagination'>
                        <Stack spacing={2}>
                            <Pagination
                                className='custom-pagination'
                                count={15}
                                page={pageNum}
                                onChange={(e, value) => setPageNum(value)} //we call setPageNum from sidebar file and value represents the page number
                            />
                        </Stack>
                    </div>
                </div>
            </div>
        </>
    );
}
