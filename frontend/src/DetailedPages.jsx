import './DetailedPages.css';
import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import "./Components/Timeline.css";
import Timeline from './Components/Timeline';
import { FaCircle } from "react-icons/fa6";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import axios from 'axios';

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
            return 'rgb(74, 191, 74)';
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
            return 'rgb(74, 191, 74)';
        }
        else if (value === "Moderate") {
            return 'orange';
        }
        else {
            return 'red';
        }
        /*return value === "Improving" ? 'rgb(74, 191, 74)' : 'red';*/
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!project) {
        return <h2>Project not found</h2>;
    }

    return (
        <>
            <h1 className='detailed-page-header'>{project.project_name}</h1>
            <div className='project-details'>
                <div className='project-left'>
                    <div className='project-metrics-card'>
                        <h3 className='card-header'>
                            <FaCircle className='circle' />
                            Project Metrics
                        </h3>
                        <div className='project-metrics-table'>
                            <table>
                                <tbody>
                                    <tr>
                                        <th>Performance</th>
                                        <th>Delay Trends</th>
                                        <th>Efficiency</th>
                                    </tr>
                                    <tr>
                                        <td style={{ color: getPerformanceColor(project.performance_metric) }}>{project.performance_metric}/100</td>
                                        <td>{project.delay} <span>days</span></td>
                                        <td style={{ color: getEfficiencyColor(project.efficiency) }}>{project.efficiency}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className='project-info'>
                        <div className='project-description'>
                            <h4 className='card-header'>
                                <FaCircle className='circle' />
                                Project Description
                            </h4>
                            <p>{project.description}</p>
                        </div>
                        <div className='project-budget-change'>
                            <h4 className='card-header'>
                                <FaCircle className='circle' />
                                Budget Change
                            </h4>
                            <p>${project.current_budget}<span> from initial plan</span></p>
                        </div>
                    </div>
                    <div className='project-funding'>
                        <h3 className='card-header'>
                            <FaCircle className='circle' />
                            Project Funding
                        </h3>
                        <table>
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
                </div>
            </div>
        </>
    );
}
