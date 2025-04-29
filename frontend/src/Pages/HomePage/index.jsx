import { Component } from "react";
import Cookies from 'js-cookie';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './index.css';
import { LuPercent } from "react-icons/lu";
import { IoTimeOutline } from "react-icons/io5";
import { IoCalendarOutline } from "react-icons/io5";
import { SlGraph } from "react-icons/sl";
import LowerMenuBlock from "../../components/LowerMenuBlock";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class HomePage extends Component {
    state = {
        attendanceList: [],
        isLoading: false,
        error: null,
        isNotificationShowed: false,
    };

    componentDidMount() {
        // Get the current date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Combine username and date to create a unique key for each user per day
        const username = Cookies.get('username');
        const welcomeKey = `welcome_${username}_${today}`;
        
        // Check if this specific user has seen the welcome message today
        const hasShownWelcome = localStorage.getItem(welcomeKey);
        
        // Show welcome message if this user hasn't seen it today
        if (!hasShownWelcome) {
            toast.info('Welcome to ATTENDIA!', {
                position: "top-right",
                autoClose: 3000
            });
            
            // Mark that this user has seen the welcome message today
            localStorage.setItem(welcomeKey, 'true');
        }
        
        // Fetch attendance details
        this.getUserData();
    }

    getUserData = async () => {
        // Get stored credentials
        const token = Cookies.get('token');
        const username = Cookies.get('username');
        
        // Check if we have necessary credentials
        if (!token || !username) {
            this.setState({ error: 'Authentication token or username is missing' });
            toast.error('Authentication failed. Please log in again.');
            return;
        }

        this.setState({ isLoading: true, error: null });

        try {
            // Make the API request to the user endpoint
            const userUrl = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user`;
            const response = await axios.get(userUrl, {
                params: { token },
                timeout: 10000
            });
            
            // Check if courses data exists in the response
            if (!response.data || !response.data.userInfo || !response.data.userInfo.courses) {
                throw new Error('Invalid response: Missing courses data');
            }
            const courses = response.data.userInfo.courses;
            // Update state with user data
            this.setState({
                attendanceList: courses,
                isLoading: false,
                isNotificationShowed: false // Reset notification flag to ensure they show
            }, () => {
                // Check low attendance after state update is complete
                this.checkLowAttendance(courses);
            });
            
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            
            let errorMessage = 'Failed to fetch attendance data. Please try again.';
            
            if (error.response) {
                errorMessage = error.response.data.error || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
            this.setState({ error: errorMessage, isLoading: false });
        }
    };

    // Check attendance and show notifications for low attendance courses
    checkLowAttendance = (attendanceList) => {
        // Validate input data
        if (!attendanceList || !Array.isArray(attendanceList)) {
            console.error('Invalid attendance list:', attendanceList);
            return;
        }
        
        // Filter courses with attendance below 75%
        const lowAttendanceCourses = attendanceList.filter(course => {
            // Validate course data
            if (!course || !course.attendancePercent) {
                console.warn('Invalid course data:', course);
                return false;
            }
            
            const attendancePercent = parseFloat(course.attendancePercent);
            return !isNaN(attendancePercent) && attendancePercent < 75;
        });
        
        if (lowAttendanceCourses.length > 0) {
            // Track which courses we've already shown notifications for
            const notifiedCourses = new Set();
            
            // Show notifications for each course with low attendance
            lowAttendanceCourses.forEach(course => {
                // Create a unique key using courseTitle and category to avoid duplicates
                const courseKey = `${course.courseTitle} (${course.category || 'Unknown'})`;
                
                // Skip if we've already shown a notification for this course
                if (notifiedCourses.has(courseKey)) {
                    return;
                }
                
                // Mark this course as notified
                notifiedCourses.add(courseKey);
                
                const requiredClasses = parseInt(course.margin) || 0;
                
                const courseTitle = course.courseTitle;
                const attendancePercent = course.attendancePercent;
                const category = course.category || 'Unknown';
                
                // Create the message based on required classes
                const message = requiredClasses > 0 
                    ? `You need ${requiredClasses} more classes for 75% attendance in ${courseTitle} - ${category} (Current: ${attendancePercent}%)`
                    : `Your attendance is below 75% in ${courseTitle} - ${category} (Current: ${attendancePercent}%)`;
                
                // Show the toast notification
                toast.warning(message, {
                    position: "top-center",
                    autoClose: 10000, // Stay longer on screen
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
            });
            
            // Update state to indicate notifications have been shown
            this.setState({ isNotificationShowed: true });
        }
    };

    render() {
        const displayName = Cookies.get('displayName');
        const { isLoading } = this.state;
        return (
            <div className="home-page">
                <ToastContainer 
                    position="top-right"
                    autoClose={7000} 
                    hideProgressBar={false} 
                    newestOnTop={false}
                    closeOnClick 
                    rtl={false} 
                    pauseOnFocusLoss 
                    draggable 
                    pauseOnHover
                    style={{
                        width: "400px",
                        maxWidth: "90%",
                        top: "60px" // Add some margin from the top
                    }}
                />
                
                <LowerMenuBlock />
                <h1 className="home-page-logo"> ATTENDIA </h1>
                <div className="home-block">
                    <div className="hm-fir-block">
                        <h1 className="hm-p-h1"> {displayName || 'Student'} </h1>
                    </div>
                    <div className="hm-sec-block">
                        <Link to="/attendance" className="feature-block-link">
                            <div className="feature-block">
                                <p> Attendance </p>
                                <LuPercent className="feature-block-icon" />
                            </div>
                        </Link>
                        
                        <Link to="/marks" className="feature-block-link">
                            <div className="feature-block">
                                <p> Marks </p>
                                <SlGraph className="feature-block-icon" />
                            </div>
                        </Link>
                        
                        <Link to="/timetable" className="feature-block-link">
                            <div className="feature-block">
                                <p> Time Table </p>
                                <IoTimeOutline className="feature-block-icon" />
                            </div>
                        </Link>
                        
                        <Link to="/planner" className="feature-block-link">
                            <div className="feature-block">
                                <p> Planner </p>
                                <IoCalendarOutline className="feature-block-icon" />
                            </div>
                        </Link>
                        
                        <Link to="/cgpa" className="feature-block-link">
                            <div className="feature-block">
                                <p> CGPA Calculator </p>
                                <p className="feature-block-icon"> A+ </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default HomePage;