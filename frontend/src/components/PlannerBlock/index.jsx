import React, { useEffect, useRef } from 'react';
import './index.css';

const PlannerBlock = props => {
    const { dateDetails, currentMonth, currentDateIndex, plannerContainerRef } = props;
    const currentDayRef = useRef(null);
    
    // Effect for scrolling to the current date after component mounts and when date changes
    useEffect(() => {
        if (currentDayRef.current) {
            // Scroll the current day into view with a slight delay to ensure DOM is fully rendered
            setTimeout(() => {
                currentDayRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 300);
        }
    }, [currentMonth, currentDateIndex]);
    
    // Check if the current month exists and has data
    if (!currentMonth || !dateDetails[currentMonth] || !dateDetails[currentMonth].Data || dateDetails[currentMonth].Data.length === 0) {
        return (
            <div className="planner-block-2" style = {{
                height: '100px',
                marginTop: '15px',
                color: 'white',
                fontWeight: '550',
                textAlign: 'center',
                fontSize: '18px',
                width: '100%'
            }}>
                <div className="no-data-message">No records available for this month</div>
            </div>
        );
    }
    
    return (
        <div className="planner-container">
            {dateDetails[currentMonth].Data.map((day, index) => {
                const isCurrentDay = parseInt(day.Date) === currentDateIndex;
                
                return (
                    <div 
                        key={index} 
                        className="planner-block" 
                        ref={isCurrentDay ? currentDayRef : null} // Add ref to the current day
                    >
                        <div 
                            className="planner-block-1"
                            style={{
                                borderColor: isCurrentDay ? 'rgba(0,255,56,.8)' : '',
                                borderWidth: isCurrentDay ? '2px' : '',
                                borderStyle: isCurrentDay ? 'solid' : ''
                            }}
                        >
                            <p className="date-number">{day.Date}</p>
                            <p className="day-name">{day.Day}</p>
                        </div>
                        <div 
                            className="planner-block-2" 
                            style={{
                                backgroundColor: dateDetails[currentMonth].Holiday.includes(parseInt(day.Date)) 
                                    ? 'rgba(0,255,56,.8)' 
                                    : isCurrentDay 
                                        ? 'violet' 
                                        : ''
                            }}
                        >
                            <p className="pb-2-p-1 scrollable-text">
                                {day.Event 
                                    ? day.Event 
                                    : (dateDetails[currentMonth].Holiday.includes(parseInt(day.Date)) 
                                        ? 'Holiday' 
                                        : 'Regular Classes')}
                            </p>
                            <p className="pb-2-p-2">
                                {day.Dayorder !== '-' 
                                    ? `DO - ${day.Dayorder}` 
                                    : 'DO -'}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PlannerBlock;