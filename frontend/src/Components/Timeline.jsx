import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import "./Timeline.css";

export default function Timeline() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjectData = async () => {
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
        fetchProjectData();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!project) return <p>Project not found</p>;

    const status = project.status;

    return (
        <>
            <ul className="timeline timeline-vertical">
                <li>
                    <hr className="bg-primary" />
                    <div className={`timeline-start timeline-box ${status === "Planning Started" ? "bg-gray" : status === "Planning Complete" ? "bg-gray" : status === "Construction Started" ? "bg-gray" : "bg-blue"}`}>
                        <div className="label-wrapper">
                            <span>Complete</span>
                            <span className="timeline-text">{new Date(project.current_completion_date).toISOString().split('T')[0]}</span>
                        </div>
                    </div>
                    <div className={`timeline-middle ${status === "Planning Started" ? "gray" : status === "Planning Complete" ? "gray" : status === "Construction Started" ? "gray" : "blue"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="text-primary h-5 w-5">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <hr />
                </li>
                <li>
                    <hr />
                    <div className={`timeline-middle ${status === "Planning Started" ? "gray" : status === "Planning Complete" ? "lightblue" : status === "Construction Started" ? "lightblue" : "blue"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className={`timeline-end timeline-box ${status === "Planning Started" ? "bg-gray" : status === "Planning Complete" ? "bg-lightblue" : status === "Construction Started" ? "bg-lightblue" : "bg-blue"}`}>
                        <div className="label-wrapper">
                            <span>Construction Start</span>
                            <span className="timeline-text">{new Date(project.construction_start_date).toISOString().split('T')[0]}</span>
                        </div>
                    </div>
                    <hr />
                </li>
                <li>
                    <hr />
                    <div className={`timeline-start timeline-box ${status === "Planning Started" ? "bg-gray" : status === "Planning Complete" ? "bg-blue" : status === "Construction Started" ? "bg-blue" : "bg-blue"}`}>
                        <div className="label-wrapper">
                            <span>Planning Complete</span>
                            <span className="timeline-text">{new Date(project.planning_complete_date).toISOString().split('T')[0]}</span>
                        </div>
                    </div>
                    <div className={`timeline-middle ${status === "Planning Started" ? "gray" : status === "Planning Complete" ? "blue" : status === "Construction Started" ? "blue" : "blue"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                    </div>
                </li>
                <li>
                    <hr />
                    <div className={`timeline-start timeline-box ${status === "Planning Started" ? "bg-lightblue" : status === "Planning Complete" ? "bg-blue" : status === "Construction Started" ? "bg-blue" : "bg-blue"}`}>
                        <div className='label-wrapper'>
                            <span>Planning Start</span>
                            <span className="timeline-text">{new Date(project.planning_start_date).toISOString().split('T')[0]}</span>
                        </div>
                    </div>
                    <div className={`timeline-middle ${status === "Planning Started" ? "lightblue" : status === "Planning Complete" ? "blue" : status === "Construction Started" ? "blue" : "blue"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                    </div>
                </li>
            </ul>
        </>
    );

}
