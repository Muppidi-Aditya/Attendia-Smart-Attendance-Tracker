import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import './index.css';

const MarksGraphBlock = (props) => {
  const { marksData } = props;
  const { courseCode, courseType, courseName, tests } = marksData;

  // Prepare chart data if tests exist
  const chartData = Object.entries(tests).map(([name, values]) => ({
    name,
    percentage: values.percentage,
  }));

  // Check if tests object is empty
  const hasTests = Object.keys(tests).length > 0;

  // Custom styles
  const containerStyle = {
    width: '100%',
    height: '400px',
    padding: '7px',
    paddingTop: '20px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
  };

  const titleStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: '#fff',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
            fontSize: '12px',
          }}
        >
          <p style={{ margin: '0', fontWeight: 'bold' }}>{`${label}`}</p>
          <p style={{ margin: '0', color: '#4CAF50' }}>{`Percentage: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="marks-block">
      <h1
        className="att-h1"
        style={{
          fontSize: '20px',
          marginTop: '20px',
          marginLeft: '20px',
        }}
      >
        {courseName}
      </h1>
      <h1
        className="att-h2"
        style={{
          marginLeft: '20px',
        }}
      >
        {courseCode} - {courseType}
      </h1>

      {hasTests ? (
        <>
          <div style={containerStyle}>
            <h2 style={titleStyle}>Performance Metrics</h2>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <defs>
                  <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#333', fontSize: 12 }}
                  axisLine={{ stroke: '#333' }}
                />
                <YAxis
                  domain={[0, 100]}
                  label={{
                    value: 'Percentage (%)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: '#333', textAnchor: 'middle', fontSize: 12 },
                  }}
                  tick={{ fill: '#333', fontSize: 12 }}
                  axisLine={{ stroke: '#333' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                <Area
                  type="linear"
                  dataKey="percentage"
                  stroke="#4CAF50"
                  fillOpacity={1}
                  fill="url(#colorPercentage)"
                />
                <Line
                  type="linear"
                  dataKey="percentage"
                  stroke="#4CAF50"
                  strokeWidth={3}
                  dot={{
                    stroke: '#4CAF50',
                    strokeWidth: 2,
                    r: 6,
                    fill: 'white',
                  }}
                  activeDot={{
                    stroke

: '#4CAF50',
                    strokeWidth: 2,
                    r: 8,
                    fill: 'white',
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="marks-data">
            {Object.entries(tests).map(([key, each]) => (
              <div className="marks-outer-block" key={key}>
                <p>{key}</p>
                <div className="marks-div">
                  {each.got}/{each.total}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '18px',
            color: '#666',
            fontWeight: 'bold',
            textAlign: 'center',
            paddingLeft: '15px',
            paddingRight: '15px'
          }}
        >
          <div className='planner-block-2' style={{
            height: '70px',
            marginBottom: '15px',
            marginTop: '15px',
            color: 'white',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: '550'
          }}>
            No marks records available
          </div>
        </div>
      )}
    </div>
  );
};

export default MarksGraphBlock;