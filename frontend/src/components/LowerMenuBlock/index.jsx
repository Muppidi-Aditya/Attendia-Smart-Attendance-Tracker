import { useState, useEffect } from 'react';
import './index.css';
import { PiDotsThreeOutlineVertical } from "react-icons/pi";
import { TbLogout2 } from "react-icons/tb";
import { FaFileDownload } from "react-icons/fa";
import { IoShareSocialOutline } from "react-icons/io5";
import { MdInstallMobile } from "react-icons/md";
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const LowerMenuBlock = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isOffline, setIsOffline] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const navigate = useNavigate();

    // Handle PWA install prompt
    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the default mini-infobar from appearing
            e.preventDefault();
            // Store the event for later use
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallApp = () => {
        setIsOpen(false);
        if (deferredPrompt) {
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                setDeferredPrompt(null);
            });
        } else {
            alert('App installation is not available. Try accessing this site from a compatible browser (e.g., Chrome or Safari) and ensure you are on a secure connection.');
        }
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleGetPDF = async () => {
        const token = Cookies.get('token');
        
        if (!token) {
            alert('Authentication token is required. Please log in again.');
            navigate('/login');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setIsOffline(false);

        const cachedData = localStorage.getItem('studentData');
        if (cachedData && !navigator.onLine) {
            const studentInfo = JSON.parse(cachedData);
            setIsOffline(true);
            generatePDF(studentInfo);
            setIsLoading(false);
            alert('Generated PDF using cached data (offline mode).');
            return;
        }

        try {
            const userUrl = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user`;
            
            const response = await axios.get(userUrl, {
                params: { token },
                timeout: 10000
            });
            
            if (!response.data || !response.data.userInfo) {
                throw new Error('Invalid response data structure');
            }
            
            const studentInfo = response.data.userInfo;
            
            localStorage.setItem('studentData', JSON.stringify(studentInfo));
            
            generatePDF(studentInfo);
            
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            const cachedData = localStorage.getItem('studentData');
            
            if (cachedData) {
                const studentInfo = JSON.parse(cachedData);
                setIsOffline(true);
                generatePDF(studentInfo);
                setIsLoading(false);
                alert('Network error. Generated PDF using cached data.');
                return;
            }

            let errorMessage = 'Failed to fetch data. Please try again.';
            
            if (error.response) {
                errorMessage = error.response.data.error || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const generatePDF = (studentData) => {
        try {
            const reportContainer = document.createElement('div');
            reportContainer.id = 'student-report-container';
            reportContainer.style.padding = '20px';
            reportContainer.style.fontFamily = 'Arial, sans-serif';
            reportContainer.style.position = 'absolute';
            reportContainer.style.left = '-9999px';
            reportContainer.style.width = '800px';
            
            reportContainer.innerHTML = `
                <h1 style="text-align: center; color: #33AFE0;">Student Information Report</h1>
                <div style="margin-bottom: 20px;">
                    <p><strong>Registration Number:</strong> ${studentData.registrationNumber || 'N/A'}</p>
                    <p><strong>Name:</strong> ${studentData.name || 'N/A'}</p>
                    <p><strong>Program:</strong> ${studentData.program || 'N/A'} - ${studentData.department || 'N/A'}</p>
                    <p><strong>Specialization:</strong> ${studentData.specialization || 'N/A'}</p>
                    <p><strong>Semester:</strong> ${studentData.semester || 'N/A'}</p>
                </div>
                
                <h2 style="color: #33AFE0;">Course Attendance</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <thead>
                        <tr style="background-color: #33AFE0; color: white;">
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Course Code</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Course Title</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Faculty</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Attendance %</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Hours</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${studentData.courses && studentData.courses.length 
                            ? studentData.courses.map(course => `
                                <tr>
                                    <td style="padding: 8px; border: 1px solid #ddd;">${course.courseCode || 'N/A'}</td>
                                    <td style="padding: 8px; border: 1px solid #ddd;">${course.courseTitle || 'N/A'}</td>
                                    <td style="padding: 8px; border: 1px solid #ddd;">${course.facultyName || 'N/A'}</td>
                                    <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${course.attendancePercent || '0'}%</td>
                                    <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${course.hoursPresent || '0'}/${course.hoursConducted || '0'}</td>
                                </tr>
                            `).join('')
                            : '<tr><td colspan="5" style="padding: 8px; border: 1px solid #ddd; text-align: center;">No attendance data available</td></tr>'
                        }
                    </tbody>
                </table>
                
                <h2 style="color: #33AFE0;">Test Performance</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #33AFE0; color: white;">
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Course Code</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Course Name</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Type</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Marks</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${studentData.testPerformances && studentData.testPerformances.length 
                            ? studentData.testPerformances.map(test => {
                                const percentage = test.totalMarks > 0 
                                    ? ((test.totalMarkGot / test.totalMarks) * 100).toFixed(2) + '%' 
                                    : 'N/A';
                                return `
                                    <tr>
                                        <td style="padding: 8px; border: 1px solid #ddd;">${test.courseCode || 'N/A'}</td>
                                        <td style="padding: 8px; border: 1px solid #ddd;">${test.courseName || 'N/A'}</td>
                                        <td style="padding: 8px; border: 1px solid #ddd;">${test.courseType || 'N/A'}</td>
                                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${test.totalMarkGot || '0'}/${test.totalMarks || '0'}</td>
                                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${percentage}</td>
                                    </tr>
                                `;
                            }).join('')
                            : '<tr><td colspan="5" style="padding: 8px; border: 1px solid #ddd; text-align: center;">No test performance data available</td></tr>'
                        }
                    </tbody>
                </table>
                
                <div style="margin-top: 30px; font-size: 10px; text-align: center; color: #666;">
                    <p>Generated on ${new Date().toLocaleString()} via ATTENDIA${isOffline ? ' (Offline Mode)' : ''}</p>
                </div>
            `;
            
            document.body.appendChild(reportContainer);
            
            html2canvas(reportContainer, { 
                scale: 1.5,
                logging: false,
                useCORS: true,
                allowTaint: true
            }).then(canvas => {
                const pdf = new jsPDF('p', 'mm', 'a4');
                
                const imgWidth = 210;
                const pageHeight = 297;
                const imgHeight = canvas.height * imgWidth / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;
                
                pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                
                while (heightLeft > 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
                
                const studentName = studentData.name ? studentData.name.replace(/\s+/g, '_') : 'Student';
                const fileName = `${studentName}_Academic_Report.pdf`;
                pdf.save(fileName);
                
                document.body.removeChild(reportContainer);
            }).catch(err => {
                console.error('Error creating PDF from canvas:', err);
                alert('Failed to generate PDF: ' + err.message);
                document.body.removeChild(reportContainer);
            });
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF: ' + error.message);
        }
    };
    
    const handleLogout = () => {
        setIsOpen(false);
        
        Cookies.remove('username');
        Cookies.remove('password');
        Cookies.remove('token');
        Cookies.remove('displayName');
        
        Cookies.remove('_iamadt_client_10002227248');
        Cookies.remove('_iambdt_client_10002227248');
        Cookies.remove('wms-tkp-token_client_10002227248');
        Cookies.remove('_z_identity');
        
        navigate('/login');
    };

    const handleShare = () => {
        setIsOpen(false);
        
        if (navigator.share) {
            navigator.share({
                title: 'ATTENDIA',
                text: 'Check out ATTENDIA for tracking your academic progress!',
                url: window.location.origin,
            })
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing:', error));
        } else {
            const shareUrl = encodeURIComponent(window.location.origin);
            const shareText = encodeURIComponent('Check out ATTENDIA for tracking your academic progress!');
            
            const whatsappUrl = `https://wa.me/?text=${shareText}%20${shareUrl}`;
            const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
            const emailUrl = `mailto:?subject=ATTENDIA&body=${shareText}%20${shareUrl}`;
            
            const shareOptions = document.createElement('div');
            shareOptions.className = 'share-options-modal';
            shareOptions.innerHTML = `
                <div class="share-options-content">
                    <h3>Share via</h3>
                    <div class="share-buttons">
                        <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                        <a href="${twitterUrl}" target="_blank" rel="noopener noreferrer">Twitter</a>
                        <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer">Facebook</a>
                        <a href="${emailUrl}" target="_blank" rel="noopener noreferrer">Email</a>
                    </div>
                    <button class="close-share-modal">Close</button>
                </div>
            `;
            
            const modalStyle = document.createElement('style');
            modalStyle.textContent = `
                .share-options-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .share-options-content {
                    background-color: white;
                    padding: 20px;
                    border-radius: 10px;
                    width: 80%;
                    max-width: 400px;
                }
                .share-options-content h3 {
                    text-align: center;
                    margin-top: 0;
                    color: #33AFE0;
                    font-family: "Poppins", sans-serif;
                }
                .share-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin: 20px 0;
                }
                .share-buttons a {
                    padding: 10px;
                    background-color: #33AFE0;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    text-align: center;
                    font-family: "Poppins", sans-serif;
                }
                .close-share-modal {
                    width: 100%;
                    padding: 10px;
                    background-color: #f1f1f1;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-family: "Poppins", sans-serif;
                }
            `;
            
            document.body.appendChild(modalStyle);
            document.body.appendChild(shareOptions);
            
            const closeButton = shareOptions.querySelector('.close-share-modal');
            closeButton.addEventListener('click', () => {
                document.body.removeChild(shareOptions);
                document.body.removeChild(modalStyle);
            });
        }
    };

    return (
        <div className='lower-menu-container'>
            <div className={`menu-transform-block ${isOpen ? 'open' : ''}`}>
                <div onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    <TbLogout2 style={{ fontSize: '25px' }} />
                    <p style={{ fontFamily: '"Poppins", sans-serif' }}> Logout </p>
                </div>
                <div onClick={handleGetPDF} style={{ cursor: 'pointer' }}>
                    <FaFileDownload style={{ fontSize: '25px' }} />
                    <p style={{ fontFamily: '"Poppins", sans-serif', textAlign: 'center' }}>
                        {isLoading ? 'Generating PDF...' : 'Download Report'}
                    </p>
                </div>
                <div onClick={handleShare} style={{ cursor: 'pointer' }}>
                    <IoShareSocialOutline style={{ fontSize: '25px' }} />
                    <p style={{ fontFamily: '"Poppins", sans-serif' }}> Share App </p>
                </div>
                <div onClick={handleInstallApp} style={{ cursor: 'pointer' }}>
                    <MdInstallMobile style={{ fontSize: '25px' }} />
                    <p style={{ fontFamily: '"Poppins", sans-serif' }}> Install App </p>
                </div>
            </div>
            <div className='lower-menu-button' onClick={toggleMenu}>
                <PiDotsThreeOutlineVertical />
            </div>
        </div>
    );
};

export default LowerMenuBlock;
