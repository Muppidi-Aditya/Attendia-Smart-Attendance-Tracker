import { Component } from "react";
import './index.css'
import FeatureHeader from "../../components/FeatureHeader";
import MarksGraphBlock from "../../components/MarksGraphBlock";
import Cookies from 'js-cookie'
import axios from 'axios'

class MarksPage extends Component {
  state = {
    marksList: [],
    isLoading: false,
    error: null
  }

  componentDidMount() {
    this.getMarksData();
  }

  getMarksData = async () => {
      const token = Cookies.get('token');
      
      if (!token) {
          this.setState({ error: 'Authentication token is required' });
          return;
      }

      this.setState({ isLoading: true, error: null });

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
          
          this.setState({
            marksList: testPerformances,
            isLoading: false
          });
          
      } catch (error) {
          console.error('Failed to fetch marks data:', error);
          
          let errorMessage = 'Failed to fetch marks data. Please try again.';
          
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
      const { marksList, isLoading, error } = this.state;
      
      return (
          <div className="marks-page">
              <FeatureHeader />
              <div className="attendance-page-block">
                  <p> Marks Report </p>
                  
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

export default MarksPage