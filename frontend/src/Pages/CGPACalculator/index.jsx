import { Component } from "react";
import FeatureHeader from "../../components/FeatureHeader";
import './index.css'

class CGPACalculator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            courses: [{ credits: '', grade: '' }],
            cgpa: null
        };
    }

    handleCreditsChange = (index, value) => {
        const courses = [...this.state.courses];
        courses[index].credits = value;
        this.setState({ courses });
    }

    handleGradeChange = (index, value) => {
        const courses = [...this.state.courses];
        courses[index].grade = value;
        this.setState({ courses });
    }

    addCourse = () => {
        this.setState({
            courses: [...this.state.courses, { credits: '', grade: '' }]
        });
    }

    removeCourse = (index) => {
        const courses = [...this.state.courses];
        courses.splice(index, 1);
        this.setState({ courses });
    }

    calculateCGPA = () => {
        const gradePoints = {
            'O': 10,
            'A+': 9,
            'A': 8,
            'B+': 7,
            'B': 6,
            'C': 5,
            'F': 0,
            'Ab': 0,
            'I': 0
        };

        let totalCredits = 0;
        let totalGradePoints = 0;

        this.state.courses.forEach(course => {
            const credits = parseFloat(course.credits);
            const grade = course.grade;

            if (!isNaN(credits) && grade && gradePoints[grade] !== undefined) {
                totalCredits += credits;
                totalGradePoints += credits * gradePoints[grade];
            }
        });

        const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
        this.setState({ cgpa });
    }

    render() {
        return (
            <div className="marks-page">
                <FeatureHeader />
                <div className="attendance-page-block" style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <p className="cgpa-title">CGPA Calculator</p>
                    
                    {this.state.courses.map((course, index) => (
                        <div className="course-row" key={index}>
                            <div className="credit-grade-block">
                                <input 
                                    type="number" 
                                    placeholder="Enter No. of Credits" 
                                    value={course.credits}
                                    onChange={(e) => this.handleCreditsChange(index, e.target.value)}
                                />
                                <select 
                                    value={course.grade}
                                    onChange={(e) => this.handleGradeChange(index, e.target.value)}
                                >
                                    <option value="">Enter Grade</option>
                                    <option value="O">O</option>
                                    <option value="A+">A+</option>
                                    <option value="A">A</option>
                                    <option value="B+">B+</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="F">F</option>
                                    <option value="Ab">Ab</option>
                                    <option value="I">I</option>
                                </select>
                                {index > 0 && (
                                    <button 
                                        className="remove-course-btn"
                                        onClick={() => this.removeCourse(index)}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    <button className="add-course-btn" onClick={this.addCourse}>
                        Add Course
                    </button>
                    
                    <hr className="cgpa-hr-line" />
                    
                    <button className="cgpa-submit-btn" onClick={this.calculateCGPA}>
                        Calculate CGPA
                    </button>
                    
                    {this.state.cgpa !== null && (
                        <div className="cgpa-result">
                            <p>Your CGPA: <span>{this.state.cgpa}</span></p>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}

export default CGPACalculator