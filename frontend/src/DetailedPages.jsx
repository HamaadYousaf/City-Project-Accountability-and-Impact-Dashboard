import './DetailedPages.css';
import { useParams } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import "./Components/Timeline.css"
import Timeline from './Components/Timeline';
import { FaCircle } from "react-icons/fa6";
import { MdOutlineCheckBoxOutlineBlank, MdOutlineCheckBox } from "react-icons/md";
import { FaRegSquareCheck } from "react-icons/fa6";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import axios from 'axios';


export default function DetailedPages() {
    //will prob need axios and when i do use the .data.data

    const { id } = useParams(); // This extracts the "id" from the URL like "/projects/:id"
    {/*const project = projectData.find(p => p.id === parseInt(id)); // check if the id of the project matches the id obtained from URL and id from URL is a string so we parse it to convert to a number*/ }

    const [project, setProject] = useState(null); // State to hold project data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    {/*useEffect(() => {
        // Fetch the project data by ID
        axios.get(`/api/projects/${id}`)
            .then(response => {
                setProject(response.data.data); // Assign fetched project data
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    }, [id]); */}

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects/${id}`);
                console.log(response.data.data)
                setProject(response.data.data);
            } catch (error) {
                console.error("Error fetching project data:", error);
            }
        };
        fetchProjects();
    }, [id]);

    const municipalFunding = project.municipal_funding;
    const provincialFunding = project.provincial_funding;
    const federalFunding = project.federal_funding;
    const otherFunding = project.other_funding;

    const renderYesBox = (funding) => {
        return funding ?
            <ImCheckboxChecked className='checkbox-icon' />
            : <ImCheckboxUnchecked className='checkbox-icon' />
    }

    const renderNoBox = (funding) => {
        return funding ?
            <ImCheckboxChecked className='checkbox-icon' />
            :
            <ImCheckboxUnchecked className='checkbox-icon' />

    }

    const getPerformanceColor = (value) => {
        if (value >= 70) {
            return 'rgb(74, 191, 74)';
        }
        else if (value >= 50 && value < 70) {
            return 'orange'
        }
        else if (value < 50) {
            return 'red'
        }
        else {
            return 'black'
        }
    }

    const getEfficiencyColor = (value) => {
        return value === "Improving" ? 'rgb(74, 191, 74)' : 'red';
    }

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
                            Project Metrics</h3>
                        <div className='project-metrics-table'>
                            <table>
                                <tr>
                                    <th>Performance</th>
                                    <th>Delay Trends</th>
                                    <th>Efficiency</th>
                                </tr>
                                <tr>
                                    <td style={{ color: getPerformanceColor(project.Performance) }}>{project.Performance}/100</td>
                                    <td>{project.Delay_Trends} <span>days</span></td>
                                    <td style={{ color: getEfficiencyColor(project.Efficiency) }}>{project.Efficiency}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div className='project-info'>
                        <div className='project-description'>
                            <h4 className='card-header'>
                                <FaCircle className='circle' />
                                Project Description</h4>
                            <p>{project.description}</p>
                        </div>
                        <div className='project-budget-change'>
                            <h4 className='card-header'>
                                <FaCircle className='circle' />
                                Budget Change</h4>
                            <p>${project.current_budget}<span> from initial plan</span></p>
                        </div>
                    </div>
                    <div className='project-funding'>
                        <h3 className='card-header'>
                            <FaCircle className='circle' />
                            Project Funding</h3>
                        <table>
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
                        </table>
                    </div>

                </div>
                <div className='project-right'>
                    {/*<Timeline className="timeline" /> */}
                </div>
            </div>
        </>
    )

}