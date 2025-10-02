import React from 'react';
import './Banner.css';

const Banner = () => {
    return (
        <div className="awareness-banner">
            <div className="banner-content">
                <span className="banner-text">
                    October is Breast Cancer Awareness Month - Early detection saves lives! || <a href="https://www.nationalbreastcancer.org/get-involved" target="_blank" rel="noopener noreferrer" className="banner-link">Learn how you can help!</a>
                </span>
            </div>
        </div>
    );
};

export default Banner;