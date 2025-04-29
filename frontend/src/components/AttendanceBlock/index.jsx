import './index.css'

const AttendanceBlock = props => {
    const {attendanceDetails} = props
    const {attendancePercent, category, courseCode, courseTitle, hoursAbsent, hoursConducted, hoursPresent, margin, required} = attendanceDetails
    const shortCourseCode = courseCode.substring(0, 8)
    
    return (
        <div className='att-block'>
            <div className='att-block-fir-half'>
                <div className='fac-details-block'>
                    <h1 className='att-h1'> {courseTitle} </h1>
                    <h1 className='att-h2'> {shortCourseCode} - {category}  </h1>
                </div>
                <div className='attendance-block'>
                    {
                        required === 0 ? (
                            <div>
                                <p style = {{
                                    fontSize: '30px',
                                    color: '#00fd00',
                                    fontWeight: '800'
                                }}> {margin} </p>
                                <p style = {{
                                    color: '#00fd00',
                                }}> Margin </p>
                                <p style = {{
                                    color: 'rgb(54 171 255)'
                                }}> {attendancePercent} </p>
                            </div>
                        ) : (
                            <div>
                                <p style = {{
                                    fontSize: '30px',
                                    color: '#ce0000',
                                    fontWeight: '800'
                                }}> {required} </p>
                                <p style = {{
                                    color: '#ce0000',
                                }}> Required </p>
                                <p style = {{
                                    color: 'rgb(54 171 255)'
                                }}> {attendancePercent} </p>
                            </div>
                        )
                    }
                </div>
            </div>
            <div className='attendance-line-block'>
                <div className='att-line'></div>
                <div className='att-box'></div>
                <div 
                    className='att-clear-line'
                    style = {{
                        width: attendancePercent+'%',
                        alignSelf: 'flex-start',
                        backgroundColor: attendancePercent >= 75 ? '#00fd00' : 'red',
                    }}
                ></div>
            </div>
            <div className='attendance-p-a-details'>
                <div>
                    <p style = {{
                        color: '#00fd00'
                    }}> P </p> 
                    <p>{hoursPresent}</p>
                </div>
                <div>
                    <p style = {{
                        color: '#ce0000'
                    }}> A </p> 
                    <p>{hoursAbsent}</p>
                </div>
                <div>
                    <p style = {{
                        color: 'rgba(0,148,255)'
                    }}> T </p> 
                    <p>{hoursConducted}</p>
                </div>
            </div>
        </div>
    )
}

export default AttendanceBlock