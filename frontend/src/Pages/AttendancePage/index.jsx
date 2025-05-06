import { Component } from "react";
import axios from 'axios';
import Cookies from 'js-cookie';
import './index.css';
import FeatureHeader from "../../components/FeatureHeader";
import AttendanceBlock from "../../components/AttendanceBlock";

class AttendancePage extends Component {
    state = {
        attendanceList: [],
        isLoading: false,
        error: null,
        isOffline: false
    }

    componentDidMount() {
        // Check if there's cached data and network status
        const cachedData = localStorage.getItem('attendanceData');
        if (cachedData && !navigator.onLine) {
            this.setState({
                attendanceList: JSON.parse(cachedData),
                isOffline: true
            });
        } else {
            this.getAttendanceDetails();
        }
    }

    getAttendanceDetails = async () => {
        const token = Cookies.get('token');
        
        if (!token) {
            this.setState({ error: 'Authentication token is required' });
            return;
        }

        this.setState({ isLoading: true, error: null, isOffline: false });

        try {
            // Use the new user API endpoint with the token
            const userUrl = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user`;
            
            const response = await axios.get(userUrl, {
                params: { token },
                timeout: 10000
            });

            // Check if courses data exists in the response
            if (response.data && response.data.userInfo && response.data.userInfo.courses) {
                // Save to localStorage
                localStorage.setItem('attendanceData', JSON.stringify(response.data.userInfo.courses));
                
                this.setState({
                    attendanceList: response.data.userInfo.courses,
                    isLoading: false
                });
            } else {
                throw new Error('Invalid response format - no attendance data found');
            }
            
        } catch (error) {
            console.error('Failed to fetch attendance data:', error);
            
            let errorMessage = 'Failed to fetch attendance data. Please try again.';
            const cachedData = localStorage.getItem('attendanceData');
            
            if (cachedData) {
                // Use cached data if available
                this.setState({
                    attendanceList: JSON.parse(cachedData),
                    isLoading: false,
                    isOffline: true,
                    error: 'Network error. Displaying cached data.'
                });
                return;
            }

            if (error.response) {
                errorMessage = error.response.data.error || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            this.setState({ 
                error: errorMessage,
                isLoading: false 
            });
        }
    } 

    render() {
        const { attendanceList, isLoading, error, isOffline } = this.state;
        
        return (
            <div className="attendance-page">
                <FeatureHeader />
                <div className="attendance-page-block">
                    <p> Attendance </p>
                    
                    {isOffline && (
                        <p className="offline-message" style={{ color: '#FFA500', fontStyle: 'italic' }}>
                            Displaying offline cached data
                        </p>
                    )}
                    
                    {isLoading && <p className="loading-message">Loading attendance data...</p>}
                    
                    {error && <p className="error-message">{error}</p>}
                    
                    {!isLoading && !error && attendanceList.length === 0 && (
                        <p>No attendance data available.</p>
                    )}
                    
                    {attendanceList.map(each => (
                        <AttendanceBlock attendanceDetails={each} key={each.courseCode} />
                    ))}
                </div>
            </div>
        );
    }
}

export default AttendancePage;
