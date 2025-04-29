import React from 'react';
import './index.css';

const TimeTableBlock = props => {
    const {timeTableDetails} = props;
    const key = Object.keys(timeTableDetails)[0];
    const [startTime, endTime] = key.split(" - ");
    const name = timeTableDetails[key].subject_name;
    const type = timeTableDetails[key].subject_type;
    const room = timeTableDetails[key].room_code;
    
    return (
        <div className='time-table-block'>
            <div>
                <h1 className='tt-h1'>{name}</h1>
                <h1 className='tt-h2'>{room} - {type}</h1>
            </div>
            <div className='timings'>
                <div>
                    <p style={{color: '#00fd00'}}>ST</p> 
                    <p>{startTime}</p>
                </div>
                <div>  
                    <p style={{color: 'rgba(0,148,255)'}}>ET</p> 
                    <p>{endTime}</p>
                </div>
            </div>
        </div>
    );
};

export default TimeTableBlock;