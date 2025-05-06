import { Component } from "react";
import './index.css';
import FeatureHeader from "../../components/FeatureHeader";
import MarksGraphBlock from "../../components/MarksGraphBlock";
import Cookies from 'js-cookie';
import axios from 'axios';

class MarksPage extends Component {
  state = {
    marksList: [],
    isLoading: false,
    error: null,
    isOffline: false
  }

  componentDidMount() {
    // Check if there's cached data and network status
    const cachedData = localStorage.getItem('marksData');
    if (cachedData && !navigator.onLine) {
      this.setState({
        marksList: JSON.parse(cachedData),
        isOffline: true
      });
    } else {
      this.getMarksData();
    }
  }

  getMarksData = async () => {
    const token = Cookies.get('token');
    
    if (!token) {
      this.setState({ error: 'Authentication token is required' });
      return;
    }

    this.setState({ isLoading: true, error: null, isOffline: false });

    try {
      const apiUrl = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user`;
      console.log('Fetching marks data from:', apiUrl);
      
      const response = await axios.get(apiUrl, {
        params: { token },
        timeout: 10000
      });

      if (!response.data || !response.data.userInfo || !response.data.userInfo.testPerformances) {
        throw new Error('Invalid response: Missing test performance data');
      }

      const testPerformances = response.data.userInfo.testPerformances;
      console.log(`Received ${testPerformances.length} test records`);
      
      // Save to localStorage
      localStorage.setItem('marksData', JSON.stringify(testPerformances));
      
      this.setState({
        marksList: testPerformances,
        isLoading: false
      });
      
    } catch (error) {
      console.error('Failed to fetch marks data:', error);
      
      let errorMessage = 'Failed to fetch marks data. Please try again.';
      const cachedData = localStorage.getItem('marksData');
      
      if (cachedData) {
        // Use cached data if available
        this.setState({
          marksList: JSON.parse(cachedData),
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
    const { marksList, isLoading, error, isOffline } = this.state;
    
    return (
      <div className="marks-page">
        <FeatureHeader />
        <div className="attendance-page-block">
          <p> Marks Report </p>
          
          {isOffline && (
            <p className="offline-message" style={{ color: '#FFA500', fontStyle: 'italic' }}>
              Displaying offline cached data
            </p>
          )}
          
          {isLoading && <p className="loading-message">Loading marks data...</p>}
          
          {error && <p className="error-message">{error}</p>}
          
          {!isLoading && !error && marksList.length === 0 && (
            <p>No marks data available.</p>
          )}
          
          {marksList.map((each, index) => (
            <MarksGraphBlock key={`${each.courseCode || 'course'}-${index}`} marksData={each} />
          ))}
        </div>
      </div>
    );
  }
}

export default MarksPage;
