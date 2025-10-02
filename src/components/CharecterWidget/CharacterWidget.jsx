import React, { useState } from 'react';
import './CharacterWidget.css';

const CharacterWidget = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

    // const quotes = [
    //     "Hey there! Welcome to MedXplore :>",
    //     "Hope you're having a wonderful day exploring medical opportunities!",
    //     "Thanks for stopping by! Feel free to explore our events and resources",
    //     "Hi! Ready to advance your medical career?",
    //     "Don't forget to check out upcoming events and news!",
    //     "You seem like a really dedicated medical student!"
    // ];

        const quotes = [
        "October is Breast Cancer Awareness Month - Early detection saves lives!",
        "1 in 8 women will develop breast cancer - Support research and awareness!",
        "Together we can make a difference in the fight against breast cancer",
        "Knowledge is power - Learn about breast cancer prevention today",
        "Supporting survivors, honoring fighters, remembering angels",
        "Pink October: Spreading hope, courage, and awareness worldwide"
    ];

    const playClickSound = () => {
        // Create a cute click sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Create a cute "pop" sound
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            
            oscillator.type = 'sine';
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        } catch {
            // Fallback: just continue without sound if Web Audio API is not supported
            console.log('Audio not supported');
        }
    };

    const toggleExpanded = () => {
        // Play sound effect
        playClickSound();
        
        if (!isExpanded) {
            // When expanding, show next quote
            setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
        }
        setIsExpanded(!isExpanded);
    };

    return (
        <>
            {/* Character Widget - Bottom Right Corner */}
            <div 
                className={`character-widget ${isExpanded ? 'expanded' : ''}`}
                onClick={toggleExpanded}
            >
                <div className="character-container">
                    {/* Character Image */}
                    <div className={`character-image ${isExpanded ? 'large' : 'small'}`}>
                        <img
                            src="/cancer2.png"
                            alt="MedXplore mascot"
                            className="character-img"
                        />
                    </div>

                    {/* Quote Bubble - Shows when expanded */}
                    {isExpanded && (
                        <div className="quote-bubble">
                            <div className="quote-content">
                                <p className="quote-text">
                                    {quotes[currentQuoteIndex]}
                                </p>
                                {/* Speech bubble arrow */}
                                <div className="quote-arrow"></div>
                            </div>
                        </div>
                    )}

                    {/* Floating animation indicator when not expanded */}
                    {!isExpanded && (
                        <div className="notification-dot"></div>
                    )}
                </div>
            </div>

            {/* Backdrop overlay when expanded (for mobile) */}
            {isExpanded && (
                <div 
                    className="character-backdrop"
                    onClick={toggleExpanded}
                />
            )}
        </>
    );
};

export default CharacterWidget;