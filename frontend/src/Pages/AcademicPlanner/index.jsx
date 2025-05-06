import { Component, createRef } from "react";
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle } from "react-icons/io";
import axios from "axios";
import './index.css';
import FeatureHeader from "../../components/FeatureHeader";
import PlannerBlock from "../../components/PlannerBlock";
import Cookie from 'js-cookie';

class AcademicPlanner extends Component {
  constructor(props) {
    super(props);
    this.plannerContainerRef = createRef(); // Create a ref for the planner container
  }

  state = {
    currentMonthIndex: 3,
    currentDateIndex: 1,
    plannerData: null, 
    loading: true,
    error: null,
    isOffline: false
  };

  componentDidMount() {
    // Initialize the date values
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    
    // Check for cached data and network status
    const cachedData = localStorage.getItem('plannerData');
    if (cachedData && !navigator.onLine) {
      this.setState({
        currentMonthIndex: month,
        currentDateIndex: day,
        plannerData: JSON.parse(cachedData),
        loading: false,
        isOffline: true
      });
    } else {
      this.setState({
        currentMonthIndex: month,
        currentDateIndex: day
      }, () => {
        // Fetch planner data after state is updated
        this.fetchPlannerData();
      });
    }
  }

  // Fetch data from /api/planner
  fetchPlannerData = async () => {
    try {
      const token = Cookie.get("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      this.setState({ loading: true, error: null, isOffline: false });

      const apiUrl = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/planner`;

      const response = await axios.get(`${apiUrl}?token=${encodeURIComponent(token)}`, {
        withCredentials: true,
        headers: {
          'X-CSRF-Token': token
        }
      });

      console.log("Planner data retrieved:", response.data);

      // Save to localStorage
      localStorage.setItem('plannerData', JSON.stringify(response.data));

      this.setState({
        plannerData: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching planner data:", error);
      const cachedData = localStorage.getItem('plannerData');
      
      if (cachedData) {
        this.setState({
          plannerData: JSON.parse(cachedData),
          loading: false,
          isOffline: true,
          error: "Network error. Displaying cached data."
        });
        return;
      }

      this.setState({
        loading: false,
        error: error.response?.data?.message || error.message || "Failed to fetch planner data",
      });
    }
  };

  // Get array of all months
  getMonths = () => {
    const { plannerData } = this.state;
    if (!plannerData) return [];
    return Object.keys(plannerData);
  };

  // Navigate to previous month
  handlePreviousMonth = () => {
    this.setState((prevState) => ({
      currentMonthIndex: Math.max(0, prevState.currentMonthIndex - 1),
    }));
  };

  // Navigate to next month
  handleNextMonth = () => {
    const months = this.getMonths();
    this.setState((prevState) => ({
      currentMonthIndex: Math.min(months.length - 1, prevState.currentMonthIndex + 1),
    }));
  };

  render() {
    const { currentMonthIndex, currentDateIndex, plannerData, loading, error, isOffline } = this.state;
    const months = this.getMonths();
    const currentMonth = months[currentMonthIndex] || "";

    // Handle loading state
    if (loading) {
      return (
        <div className="marks-page">
          <FeatureHeader />
          <div className="attendance-page-block">
            <p>Academic Planner</p>
            <p>Loading...</p>
          </div>
        </div>
      );
    }

    // Handle error state
    if (error && !isOffline) {
      return (
        <div className="marks-page">
          <FeatureHeader />
          <div className="attendance-page-block">
            <p>Academic Planner</p>
            <p>Error: {error}</p>
            <button onClick={this.fetchPlannerData}>Retry</button>
          </div>
        </div>
      );
    }

    // Render the planner
    return (
      <div className="marks-page">
        <FeatureHeader />
        <div className="attendance-page-block">
          <p>Academic Planner</p>
          {isOffline && (
            <p className="offline-message" style={{ color: '#FFA500', fontStyle: 'italic' }}>
              Displaying offline cached data
            </p>
          )}
          <div className="planner-header">
            <IoIosArrowDropleftCircle
              style={{
                color: "white",
                fontSize: "40px",
                cursor: currentMonthIndex > 0 ? "pointer" : "not-allowed",
                opacity: currentMonthIndex > 0 ? 1 : 0.5,
              }}
              onClick={this.handlePreviousMonth}
            />
            <p
              style={{
                color: "white",
                fontWeight: "550",
              }}
            >
              {currentMonth.split("'")[0]}
            </p>
            <IoIosArrowDroprightCircle
              style={{
                color: "white",
                fontSize: "40px",
                cursor: currentMonthIndex < months.length - 1 ? "pointer" : "not-allowed",
                opacity: currentMonthIndex < months.length - 1 ? 1 : 0.5,
              }}
              onClick={this.handleNextMonth}
            />
          </div>
          <div ref={this.plannerContainerRef}>
            <PlannerBlock 
              dateDetails={plannerData} 
              currentMonth={currentMonth} 
              currentDateIndex={currentDateIndex}
              plannerContainerRef={this.plannerContainerRef}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default AcademicPlanner;
