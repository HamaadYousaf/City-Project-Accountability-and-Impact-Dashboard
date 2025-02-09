import "../Sidebar.css";
import Input from "../../Components/Input";
import { IoConstructOutline } from "react-icons/io5";

export default function Type({ handleChange, selectedOption }) {
    return (
        <>
            <div className='sidebar-section'>
                <h4 className="sidebar-header">
                    <IoConstructOutline className="sidebar-icons" size={24} />
                    Type
                </h4>
                <div className="sidebar-list">
                    <Input
                        handleChange={handleChange}
                        value="Transit" //this will align with the value of Region (aka either downtown or a place in downtown, depending on table provided)
                        name="category" //this aligns with Region from table
                        heading="Transit"
                        className="sidebar-input"
                        selectedOption={selectedOption}
                    />
                    <Input
                        handleChange={handleChange}
                        value="Communities"
                        name="category"
                        heading="Communities"
                        className="sidebar-input"
                        selectedOption={selectedOption} />
                    <Input
                        handleChange={handleChange}
                        value="Roads/Bridges"
                        name="category"
                        heading="Roads and bridges"
                        className="sidebar-input"
                        selectedOption={selectedOption} />
                    <Input
                        handleChange={handleChange}
                        value="Recreation"
                        name="category"
                        heading="Recreation"
                        className="sidebar-input"
                        selectedOption={selectedOption} />
                    <Input
                        handleChange={handleChange}
                        value="Health Care"
                        name="category"
                        heading="Health Care"
                        className="sidebar-input"
                        selectedOption={selectedOption} />
                </div>
            </div>
        </>
    )
}