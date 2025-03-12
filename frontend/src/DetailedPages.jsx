import './DetailedPages.css';
import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import "./Components/Timeline.css";
import Timeline from './Components/Timeline';
import { FaCircle } from "react-icons/fa6";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import { AiFillQuestionCircle } from "react-icons/ai";
import { FaLink } from "react-icons/fa6";
import { GoGraph } from "react-icons/go";
import { BsGraphDown } from "react-icons/bs";
import axios from 'axios';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'

export default function DetailedPages() {
    const { id } = useParams(); // This extracts the "id" from the URL like "/projects/:id"
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects/${id}`);
                setProject(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching project data:", error);
                setError("Failed to load project data.");
                setLoading(false);
            }
        };
        fetchProjects();
    }, [id]);

    const municipalFunding = project ? project.municipal_funding : false;
    const provincialFunding = project ? project.provincial_funding : false;
    const federalFunding = project ? project.federal_funding : false;
    const otherFunding = project ? project.other_funding : false;

    const renderYesBox = (funding) => {
        return funding ? (
            <ImCheckboxChecked className='checkbox-icon' />
        ) : (
            <ImCheckboxUnchecked className='checkbox-icon' />
        );
    };

    const renderNoBox = (funding) => {
        return !funding ? (
            <ImCheckboxChecked className='checkbox-icon' />
        ) : (
            <ImCheckboxUnchecked className='checkbox-icon' />
        );
    };

    const getPerformanceColor = (value) => {
        if (value >= 70) {
            return 'rgb(7, 222, 140)';
        }
        else if (value >= 50 && value < 70) {
            return 'orange';
        }
        else if (value < 50) {
            return 'red';
        }
        else {
            return 'black';
        }
    };

    const getEfficiencyColor = (value) => {
        if (value === "Improving") {
            return 'rgb(7, 222, 140)';
        }
        else if (value === "Moderate") {
            return 'orange';
        }
        else {
            return 'red';
        }
        /*return value === "Improving" ? 'rgb(74, 191, 74)' : 'red';*/
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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!project) {
        return <h2>Project not found</h2>;
    }

    const budget_change = project.current_budget - project.original_budget

    return (
        <>
            <h1 className='detailed-page-header'>{project.project_name}</h1>
            <div className='map-container'>
                <MapContainer center={[project.location.coordinates[1], project.location.coordinates[0]]} zoom={13} scrollWheelZoom={true}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[project.location.coordinates[1], project.location.coordinates[0]]}>
                        <Popup>
                            {project.address} <br /> {project.postal_code}
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
            <div className='project-details'>
                <div className='project-left'>
                    <div className='project-metrics-card'>
                        <h3 className='card-header'>
                            <FaCircle className='circle' />
                            Project Metrics
                        </h3>
                        <div className='project-metrics-table'>
                            <table className='metrics-table'>
                                <tbody>
                                    <tr>
                                        <th>Performance
                                            <div className="tooltip-container">
                                                <AiFillQuestionCircle className="question-mark" />
                                                <span className="tooltip-text">Represents the overall project performance score.</span>
                                            </div>
                                        </th>
                                        <th>Delay Trends
                                            <div className="tooltip-container">
                                                <AiFillQuestionCircle className="question-mark" />
                                                <span className="tooltip-text">Indicates the delay in months of the project.</span>
                                            </div>
                                        </th>
                                        <th>Efficiency
                                            <div className="tooltip-container">
                                                <AiFillQuestionCircle className="question-mark" />
                                                <span className="tooltip-text">Measures the overall productivity and resource management of the project. Higher efficiency reflects the project being completed within budget and on time.</span>
                                            </div>
                                        </th>
                                    </tr>
                                    <tr>
                                        <td style={{ color: getPerformanceColor(project.performance_metric) }}>{project.performance_metric}/100</td>
                                        <td>{project.delay} <span>months</span></td>
                                        <td style={{ color: getEfficiencyColor(project.efficiency) }}>{project.efficiency}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className='project-info-card'>
                        <div className='project-cost-trends'>
                            <h4 className='card-header'>
                                <FaCircle className='circle' />
                                Cost Trends</h4>
                            <div className='trends'>
                                <section className='cost-trend'>
                                    <h4>Economic Costs</h4>
                                    <div className="tooltip-container">
                                        <AiFillQuestionCircle className="question-mark" />
                                        <span className="tooltip-text">Economic impacts from delays.</span>
                                    </div>
                                    <p>{project.Construction}% {getTrendIcon(project.Construction)}</p>
                                </section>
                                <section className='cost-trend'>
                                    <h4>Human Costs</h4>
                                    <div className="tooltip-container">
                                        <AiFillQuestionCircle className="question-mark" />
                                        <span className="tooltip-text">Human costs due to accidents or hazards caused by unfinished infrastructure.</span>
                                    </div>
                                    <p>{project.Transit}% {getTrendIcon(project.Transit)}</p>
                                </section>
                                <section className='cost-trend'>
                                    <h4>Opportunity Costs</h4>
                                    <div className="tooltip-container">
                                        <AiFillQuestionCircle className="question-mark" />
                                        <span className="tooltip-text">Opportunity costs from delays.</span>
                                    </div>
                                    <p>{project.Transportation}% {getTrendIcon(project.Transportation)}</p>
                                </section>
                            </div>
                        </div>
                        <div className='project-budget-change'>
                            <h4 className='card-header'>
                                <FaCircle className='circle' />
                                Budget Change
                            </h4>
                            <div className='budget-table'>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td className='pricing'>${project.current_budget.toLocaleString()}</td>
                                            <td className='pricing'>${project.original_budget.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td><button className='current-price'>Current</button></td>
                                            <td><button className='original-price'>Original</button></td>
                                        </tr>
                                        <tr></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p>${budget_change.toLocaleString()}<span> from initial plan</span></p>
                        </div>
                    </div>
                    <div className='project-funding'>
                        <h4 className='card-header'>
                            <FaCircle className='circle' />
                            Project Funding
                        </h4>
                        <table className='funding-table'>
                            <tbody>
                                <tr>
                                    <th>Funding</th>
                                    <th>Yes</th>
                                    <th>No</th>
                                </tr>
                                <tr>
                                    <td>Municipal</td>
                                    <td>{renderYesBox(municipalFunding)}</td>
                                    <td>{renderNoBox(municipalFunding)}</td>
                                </tr>
                                <tr>
                                    <td>Provincial</td>
                                    <td>{renderYesBox(provincialFunding)}</td>
                                    <td>{renderNoBox(provincialFunding)}</td>
                                </tr>
                                <tr>
                                    <td>Federal</td>
                                    <td>{renderYesBox(federalFunding)}</td>
                                    <td>{renderNoBox(federalFunding)}</td>
                                </tr>
                                <tr>
                                    <td>Other</td>
                                    <td>{renderYesBox(otherFunding)}</td>
                                    <td>{renderNoBox(otherFunding)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className='project-right'>
                    <Timeline />
                    <div className='project-information'>
                        <h4 className='card-header'>
                            <FaCircle className='circle' />
                            Project Details
                        </h4>
                        <p className='description'>{project.description}</p>
                        <div className='project-link'>
                            <FaLink className='link-icon' />
                            <a href={project.website} target='_blank'>{project.website}</a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
