import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CostPieChart({ pieData }) { //passed project from detailedpages.jsx 
    const colors = ['#00c49f', '#0088fe', '#ff8042'];

    const label = ({ cx, cy, midAngle, outerRadius, index }) => {
        const radian = Math.PI / 180;
        const radius = outerRadius * 1.4;
        const x = cx + radius * Math.cos(-midAngle * radian);
        const y = cy + radius * Math.sin(-midAngle * radian);
        const value = pieData[index].value;

        return (
            <text
                x={x}
                y={y}
                fontSize={12}
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
            >
                ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </text>
        );
    };

    return (
        <div className="project-cost-piechart" style={{ maxWidth: 500, marginTop: '-9rem', marginBottom: '-8rem' }}>
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label={label}
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
`} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
