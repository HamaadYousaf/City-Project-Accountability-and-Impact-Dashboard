import "../Sidebar.css";
import Input from "../../Components/Input";
import { MdAccessTime } from "react-icons/md";

export default function Stauts({ handleChange, selectedOption }) {
    return (
        <>
            <div className='sidebar-section'>
                <h4 className="sidebar-header">
                    <MdAccessTime className="sidebar-icons" size={24} />
                    Status
                </h4>
                <div className="sidebar-list">
                    <Input
                        handleChange={handleChange}
                        value=""  // "All" option
                        name="status"
                        heading="All"
                        className="sidebar-input"
                        selectedOption={selectedOption}
                    />
                    <Input
                        handleChange={handleChange}
                        value="Completed" //this will align with the value of Region (aka either downtown or a place in downtown, depending on table provided)
                        name="status" //this aligns with Region from table
                        heading="Completed"
                        className="sidebar-input"
                        selectedOption={selectedOption}
                        filterType="status"
                    />
                    <Input
                        handleChange={handleChange}
                        value="Construction Started"
                        name="status"
                        heading="In Progress"
                        className="sidebar-input"
                        selectedOption={selectedOption}
                        filterType="status" />
                    <Input
                        handleChange={handleChange}
                        value="Planning Started"
                        name="status"
                        heading="Not Started"
                        className="sidebar-input"
                        selectedOption={selectedOption}
                        filterType="status" />
                </div>
            </div>
        </>
    )
} 