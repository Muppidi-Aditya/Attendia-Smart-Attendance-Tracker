import { Component } from "react";
import axios from "axios";
import FeatureHeader from "../../components/FeatureHeader";
import './index.css';
import TimeTableBlock from "../../components/TimeTableBlock";
import Cookies from 'js-cookie';

// Fallback data in case API fails and no cached data
const sampleData = {
  day_order: "1",
  timetable: {
    Day1: {
      "12:30 - 01:20": {
        subject_name: "Software Engineering in Artificial Intelligence",
        subject_type: "Theory",
        room_code: "AY2024-25-EVEN",
      },
      "01:25 - 02:15": {
        subject_name: "Software Engineering in Artificial Intelligence",
        subject_type: "Theory",
        room_code: "AY2024-25-EVEN",
      },
    },
    Day2: {},
    Day3: {},
    Day4: {},
    Day5: {},
  },
};

class TimeTable extends Component {
  state = {
    selectedDay: "1",
    timetableData: null,
    loading: true,
    error: null,
    today: "1",
    isOffline: false
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    // Check for cached data and network status
    const cachedData = localStorage.getItem('timetableData');
    if (cachedData && !navigator.onLine) {
      const parsedData = JSON.parse(cachedData);
      this.setState({
        timetableData: parsedData,
        selectedDay: parsedData.day_order || "1",
        today: parsedData.day_order || "1",
        loading: false,
        isOffline: true
      });
    } else {
      this.fetchTimetableData();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  fetchTimetableData = async () => {
    try {
      const token = Cookies.get('token'); 

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      this.setState({ loading: true, error: null, isOffline: false });

      const apiUrl = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/timetable`;

      const response = await axios.get(`${apiUrl}?token=${encodeURIComponent(token)}`, {
        withCredentials: true,
        headers: {
          'X-CSRF-Token': token
        }
      });

      // Validate response structure
      if (!response.data || !response.data.timetable) {
        console.warn("Unexpected API response format:", response.data);
        const adaptedData = this.adaptApiResponse(response.data);
        if (this._isMounted) {
          // Save to localStorage
          localStorage.setItem('timetableData', JSON.stringify(adaptedData));
          this.setState({
            timetableData: adaptedData,
            loading: false,
          });
        }
      } else {
        if (this._isMounted) {
          // Save to localStorage
          localStorage.setItem('timetableData', JSON.stringify(response.data));
          this.setState({
            timetableData: response.data,
            selectedDay: response.data.day_order,
            today: response.data.day_order,
            loading: false,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching timetable:", error);
      const cachedData = localStorage.getItem('timetableData');
      
      if (cachedData && this._isMounted) {
        const parsedData = JSON.parse(cachedData);
        this.setState({
          timetableData: parsedData,
          selectedDay: parsedData.day_order || "1",
          today: parsedData.day_order || "1",
          loading: false,
          isOffline: true,
          error: "Network error. Displaying cached data."
        });
        return;
      }

      if (this._isMounted) {
        this.setState({
          error: error.message || "Failed to fetch timetable data. Please try again later.",
          loading: false,
          timetableData: sampleData,
        });
      }
    }
  };

  adaptApiResponse = (data) => {
    if (Array.isArray(data)) {
      console.log("Adapting array response to timetable format");
      const adaptedData = {
        day_order: "1",
        timetable: {},
      };

      for (let day = 1; day <= 5; day++) {
        const dayKey = `Day${day}`;
        adaptedData.timetable[dayKey] = {};

        const dayItems = data.filter(
          (item) => item.day_order === day.toString() || item.day_order === day
        );

        dayItems.forEach((item) => {
          if (item.start_time && item.end_time) {
            const timeSlot = `${item.start_time} - ${item.end_time}`;
            adaptedData.timetable[dayKey][timeSlot] = {
              subject_name: item.subject_name || "Unknown Subject",
              subject_type: item.subject_type || "N/A",
              room_code: item.room_code || "N/A",
            };
          }
        });
      }

      return adaptedData;
    }

    if (typeof data === "object" && data !== null && !data.timetable) {
      return {
        day_order: "1",
        timetable: data,
      };
    }

    return sampleData;
  };

  handleDaySelect = (day) => {
    this.setState({ selectedDay: day });
  };

  renderTimeTableBlocks = () => {
    const { selectedDay, timetableData, loading, error } = this.state;

    if (loading) {
      return <div className="loading-message">Loading timetable...</div>;
    }

    if (error && !timetableData) {
      return <div className="error-message">{error}</div>;
    }

    const data = timetableData || sampleData;

    if (!data || !data.timetable) {
      console.error("Invalid timetable data structure:", data);
      return <div className="error-message">Invalid timetable data format</div>;
    }

    const dayKey = `Day${selectedDay}`;
    const daySchedule = data.timetable[dayKey];

    if (!daySchedule) {
      console.warn(`Day schedule not found for ${dayKey}`);
      return <div>No schedule available for this day</div>;
    }

    return Object.entries(daySchedule)
      .filter(([_, details]) => details.subject_name !== "No class")
      .map(([timeSlot, details]) => (
        <div key={timeSlot} className="time-table-block-wrapper">
          <TimeTableBlock
            timeTableDetails={{
              [timeSlot]: details,
            }}
          />
        </div>
      ));
  };

  render() {
    const { selectedDay, today, isOffline } = this.state;
    return (
      <div className="marks-page">
        <FeatureHeader />
        <div className="attendance-page-block">
          <p className="timetable-title">Timetable</p>
          {isOffline && (
            <p className="offline-message" style={{ color: '#FFA500', fontStyle: 'italic' }}>
              Displaying offline cached data
            </p>
          )}
          <div className="timetable-header">
            {[1, 2, 3, 4, 5].map((day) => (
              <div
                key={day}
                className={
                  selectedDay === day.toString()
                    ? "selected-day-btn"
                    : "not-selected-day-btn"
                }
                onClick={() => this.handleDaySelect(day.toString())}
                style={
                  today === day.toString()
                    ? { borderColor: "rgb(0, 255, 30)" }
                    : {}
                }
              >
                {day}
              </div>
            ))}
          </div>
          <div className="timetable-blocks-container">
            {this.renderTimeTableBlocks()}
          </div>
        </div>
      </div>
    );
  }
}

export default TimeTable;
