import "../Sidebar.css";
import Input from "../../Components/Input";
import { IoLocationOutline } from "react-icons/io5";

export default function Region({ handleChange, selectedOption }) {
    return (
        <>
            <div className='sidebar-section'>
                <h4 className="sidebar-header">
                    <IoLocationOutline className="sidebar-icons" size={24} />
                    Region
                </h4>
                <div className="sidebar-list">
                    <Input
                        handleChange={handleChange}
                        value="Central"
                        name="area"
                        heading="Central"
                        className="sidebar-input"
                        selectedOption={selectedOption}
                        filterType="region"
                    />
                    <Input
                        handleChange={handleChange}
                        value="Peel"
                        name="area"
                        heading="Peel"
                        className="sidebar-input"
                        selectedOption={selectedOption}
                        filterType="region"
                    />
                    <Input
                        handleChange={handleChange}
                        value="Downtown"
                        name="area"
                        heading="Downtown"
                        className="sidebar-input"
                        selectedOption={selectedOption}
                        filterType="region"
                    />
                </div>
            </div>
        </>
    );
}
