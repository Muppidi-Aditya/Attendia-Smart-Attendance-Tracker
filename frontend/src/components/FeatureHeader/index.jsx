import { GoHomeFill } from "react-icons/go";
import { Link } from 'react-router-dom';
import './index.css'

const FeatureHeader = () => {
    return (
        <div className="feature-header-block">
            <h1> ATTENDIA </h1>
            <Link to="/" className="feature-block-link"  style = {{
                display: 'flex',
                justifyContent: 'flex-end'
            }}>
                <GoHomeFill style = {{
                    fontSize: '8vw'
                }} />
            </Link>
        </div>
    )
}

export default FeatureHeader