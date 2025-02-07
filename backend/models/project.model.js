import mongoose from 'mongoose'

const ProjectSchema = mongoose.Schema({
    project_name: { type: String, required: true, unique: true },
    description: { type: String },
    location: {
        type: {
            type: String,
            enum: ['Point'], // GeoJSON format for geolocation
            required: true,
        },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    original_completion_date: { type: Date, required: true },
    current_completion_date: { type: Date, required: true },
    planning_start_date: { type: Date, required: true },
    planning_complete_date: { type: Date, required: true },
    construction_start_date: { type: Date, required: true },
    status: { type: String, enum: ['Planning Started', 'Planning Complete', 'Construction Started', 'Completed'], required: true },
    original_budget: { type: Number, required: true },
    current_budget: { type: Number, required: true },
    category: { type: String, enum: ['Transit', 'Communities', 'Roads and bridges', 'Recreation', 'Health care', 'Education'], required: true },
    result: { type: String }, // Impact of project to the community
    area: { type: String },
    region: { type: String },
    address: { type: String },
    postal_code: { type: String },
    municipal_funding: { type: Boolean },
    provincial_funding: { type: Boolean },
    federal_funding: { type: Boolean },
    other_funding: { type: Boolean },
    performance_metric: { type: Number },
    efficiency: {
        type: String, enum: ['Improving', 'Moderate', 'Declining'], required: true, default: 'Moderate'
    },
    website: { type: String }
}, {
    timestamps: true // Adds `createdAt` and `updatedAt` fields
})

export const Project = mongoose.model('projects', ProjectSchema);
